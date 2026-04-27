# Deep dive — how the code and the problem actually work

Read this until you can explain it without notes. The goal is that nothing on stage surprises you and nothing in Q&A trips you up.

---

## 1. What an RSC actually is

A **server component** is a React component that runs on the server, renders to a special wire format, and ships **no JavaScript** for itself to the browser. It can `await` things directly. It cannot use hooks (no state, no effects), it cannot have event handlers, it cannot read `window`.

A **client component** is the React you've always known: hooks, effects, event handlers, browser APIs. It ships its source code as JavaScript that runs in the browser.

The boundary between them is the `'use client'` directive at the top of a file. **Anything imported from a `'use client'` file becomes part of the client bundle.** This is why the rule "push `'use client'` to the leaves" matters: if you put it on a high-level layout, everything underneath it is dragged along into the bundle.

What gets sent over the wire when an RSC page renders:

1. The server runs the component tree. Server components render to a serializable description: tag names, props, children, and **placeholders** where client components live.
2. That description is streamed to the browser as the **RSC payload** — a custom format, roughly JSON with markers for client-component slots.
3. The browser receives the payload, paints the server-rendered HTML, and downloads the JavaScript for client-component slots only.
4. Client components hydrate in place — React attaches event handlers and starts running effects.

The key mental shift: server components are **rendered once, on the server, per request**. They don't re-render on the client. They don't have state. They're more like a templating language with full access to your backend than they are like the React you know.

**Q&A landmine**: "Do server components re-render on data changes?" No. They render at request time. To get fresh data you trigger a new render — usually via `revalidateTag`/`revalidatePath`, or by navigating, or by having a client component call a Server Action that re-renders.

---

## 2. Streaming and Suspense — the wire model

When the server starts streaming the RSC payload, it sends what's ready first and **flushes** later. If a server component does `await db.fetchSomething()`, the server can't render that subtree yet — but it can render everything around it and ship that immediately.

Where does the "yet" appear in the payload? At a `<Suspense>` boundary. The boundary is the contract: "here's what to show right now (the fallback), here's a placeholder ID for the real content, the server will send the real thing later in the same response stream."

The browser sees the fallback first, then a follow-up chunk swaps in the real content when the server flushes it. **All in one HTTP response.** No second request. That's why streaming is fast: the round-trip cost is paid once.

Why "one Suspense per independent slow read"?

- **One giant Suspense at the top**: the whole page waits for the slowest piece. You've turned the streaming benefit into a serial wait.
- **Suspense around every leaf**: each leaf becomes its own waterfall. The browser paints, swaps, paints, swaps. CLS cost. Visual noise.
- **Goldilocks**: one boundary per piece of data that can finish independently. News and recent-trades are independent slow reads in our demo, so they each get their own boundary.

**Q&A landmine**: "What about parallel Suspense vs sequential?" If you put a Suspense inside another Suspense and both await, they're serial — the inner one can't start until the outer one resolves. To parallelize, the awaits need to start at the same level (or you trigger them with `Promise.all` and pass the promises down).

---

## 3. `useOptimistic` — the revert mechanism

`useOptimistic` returns a tuple `[displayed, addOptimistic]`. You give it:
- A **base state** (typically the result of `useActionState`).
- A **reducer** that takes the base state and a "delta" you pass to `addOptimistic`, and returns the displayed state.

```ts
const [optimistic, addOptimistic] = useOptimistic(
  state,                                  // base
  (currentBase, delta) => mergeDelta(currentBase, delta)  // reducer
)
```

Three rules to internalize:

1. **`displayed` is computed from `base`**, not stored separately. There's no second storage. The displayed value is the reducer applied to the current base.
2. **`addOptimistic` only takes effect during a transition.** Outside a transition (e.g., a Server Action dispatch via `useActionState`), the call is ignored. That's why our `clientAction` calls `addOptimistic` *and then* dispatches the form action — both happen inside the transition that React kicks off when the form action runs.
3. **Reverts happen because base didn't update.** When the action completes successfully, base updates, the reducer runs against the new base, and the displayed state reflects success. When the action **throws**, base doesn't update — the transition ends, the reducer is no longer applied, and displayed reverts to whatever base was.

This is why "throw to revert" works:
- Server action throws → `useActionState` keeps prev base.
- Transition ends → `useOptimistic` stops applying the optimistic delta.
- Displayed returns to base = previous committed state.
- **The pending row visually disappears.** Clean revert.

If instead the server returned `{ ok: false, error: ... }`, base **would** update (just to a "failed" shape). The reducer would run against that new base. Whatever shape your reducer produced from `(failedBase, optimisticDelta)` is what you'd see — most likely "still pending" because your reducer wasn't designed to handle a failure base. **That's the stuck-state pattern.**

In our code we do something subtle: the client wrapper `runPlaceTrade` catches the server-side throw and returns `{ ...prev, error }`. This:
- Lets us surface an inline error string.
- Returns prev's `last` field, so the optimistic pending entry is replaced with the prior committed entry.
- Effectively gives us "throw to revert + inline error" — best of both.

**Q&A landmine**: "Why don't you just throw and let an error boundary handle it?" Because a fintech UI wants the error string visible inline next to the form, not a full route-level error page. The wrapper is the production-realistic pattern.

---

## 4. Server Actions — the protocol

A Server Action is a function exported from a module marked `'use server'`. The framework:
1. Replaces the function reference with a network handle on the client side.
2. When the client calls it, the call serializes args (form data, JSON, or both), POSTs them to the server.
3. Server runs the actual function, gets a return value, optionally invokes `revalidatePath`/`revalidateTag` to mark cached data stale.
4. Server streams back: the return value PLUS any updated RSC payload for re-rendered routes (because revalidation triggered a re-render).
5. Client receives, applies the new RSC payload (in-place — no full navigation), and the action's return value lands in `useActionState`.

The "single round-trip mutate-and-refresh" is the entire point. A traditional setup needs: POST mutation, await response, refetch GET, swap state. Server Actions collapse that into one stream.

**Common Server Action pitfalls:**

- **Returning closures or non-serializable data.** Doesn't work — return values must be serializable.
- **Calling `revalidatePath` for paths the user isn't on.** Wasted server work.
- **Throwing from revalidation.** As discussed above — never throw from revalidation; log and continue.
- **Storing FormData in state.** It's not serializable across renders. Extract values first.

**Q&A landmine**: "How do Server Actions auth?" They run with whatever cookies/session the request carries. Auth check is the first thing in the action body — Zod-validate, then auth-check, then mutate.

---

## 5. WebSockets vs RSC — why it's a category error

HTTP request/response: client → request → server → ONE response → connection closes (or keep-alive but the request/response semantic is one-shot per request).

WebSocket: client → upgrade request → server → upgrade response → bidirectional channel stays open → many messages each direction → either side closes when done.

RSC's wire protocol is layered on HTTP. The server streams **one** RSC payload per request. There's no slot in the protocol for "and here are 47 more messages five minutes later".

If you write `const data = await someWebSocket.firstMessage()` inside an `async` server component:
- The await suspends rendering of that component subtree.
- The HTTP response stays open waiting.
- When the WebSocket sends its first message, the await resolves, the server renders, the response flushes.
- **The connection then closes.** The server is done.

You got a snapshot. You're not getting updates. There's no mechanism in RSC's wire format for "the server pushes another update later". That's just not what HTTP request/response is.

If you don't await the message at all and write `const ws = new WebSocket(...)` inside a server component, you're trying to open a WebSocket from your **server runtime** — which usually doesn't have a WebSocket client, and even if it did, the server would close after the response anyway. Either way: structurally wrong.

The right pattern for live data:
- **RSC fetches the initial slice** (last N events from your DB).
- **A client island opens the WebSocket** in `useEffect` and prepends incoming messages to that initial slice.
- The boundary is the prop pass: `<TradesLiveTail initialTrades={initial} />`.

Our `step-5a-rsc-ws-fail` tag literally writes the wrong way (a never-resolving await) so the audience sees the page hang. The fix is what we already had in step 4.

**Q&A landmine**: "But what about Server-Sent Events (SSE)?" SSE is one-direction (server → client) over a long-lived HTTP response. You could *technically* hold a server component open with an async iterator and yield messages, but RSC's payload format isn't designed for that. SSE belongs in a Route Handler (`app/api/.../route.ts`) consumed by a client component via `EventSource`. Same architectural shape as WebSockets: client island, not RSC.

---

## 6. The CSR-vs-RSC reload lesson

When you reload an RSC route:
- Browser sends a fresh GET.
- Server re-renders the whole tree from scratch.
- Every async data fetch in the tree runs again.
- Even if the data hasn't changed, the server pays the cost.

When you reload a CSR (SPA) route with the data bundled or HTTP-cached:
- Browser sends a fresh GET.
- Static HTML is served (often from CDN).
- Bundled JS executes, hydrates instantly.
- The data is in the bundle (or in browser cache), no extra fetch.

On a **cold** load, RSC wins because there's no JS to ship. On a **warm** load, CSR can win because everything's cached and there's no server round-trip.

The fix for RSC's warm-reload weakness: **server-side caching via `revalidateTag` / `revalidatePath`**. You mark data with a tag, the framework caches the rendered output, and only invalidates when something with that tag changes. Then RSC's warm-reload cost drops too.

But: getting cache invalidation right at scale is hard. Stale data, cache stampedes, multi-region invalidation propagation. It's the entire production-RSC adoption topic and it's outside this demo's scope.

**Q&A landmine**: "Is there a CDN-cached RSC?" Yes — Next.js's `unstable_cache`, the `cache: 'force-cache'` fetch option, and the new (16+) Cache Components are all attempts at this. They work but have caveats. Don't pretend they solve everything.

---

## 7. Hydration — what it is and why we measure it

Server-rendered HTML is dead — no event handlers, no state. **Hydration** is the process where React walks the DOM the server produced, mounts client components in place, attaches event handlers, and runs effects. After hydration, the page is interactive.

Hydration cost scales with:
- **How many client components** there are. Each one instantiates, mounts, runs effects.
- **How much work each one does in render**. Big trees, expensive renders, expensive `useEffect` setups.
- **How much synchronous JS** runs at startup (your bundle parse + execute time).

In our demo we measure two hydration moments:
- `markHydrationStart` / `markHydrationEnd` — generic. Runs in a top-level client component's `useEffect`.
- `markChartHydrationStart` / `markChartHydrationEnd` — specific to the chart's `useLayoutEffect`. The chart is the heaviest client mount, so this is the more meaningful "interactive ready" signal.

**Q&A landmine**: "What does the App Router give you for hydration metrics?" Not much directly. The legacy Pages Router emitted a `Next.js-hydration` web vital; App Router doesn't. We hand-roll our marks for that reason.

---

## 8. The mock feed — why HMR safety matters

The mock feed is a singleton with a `setInterval` driving ticks. Without care, **dev hot-reload doubles your tick rate every save**:

- You save `feed.ts`. Next.js Fast Refresh re-evaluates the module.
- The new module declares a *new* singleton with a fresh `setInterval`.
- The *old* `setInterval` is still running, pointing at the old subscriber list.
- Within a few saves, you're at 4×, 8× the intended tick rate. HUD numbers no longer reflect reality.

The fix is the `globalThis` namespace pattern:

```ts
function bootSingleton(): MockFeed {
  const g = globalThis as { __mockFeed?: MockFeed }
  if (g.__mockFeed) g.__mockFeed.stop()  // <-- clear old interval first
  const next = createMockFeed()
  next.start()
  g.__mockFeed = next
  return next
}
export const feed: MockFeed = bootSingleton()
```

On every module evaluation (initial boot or HMR save), we stop the prior generation's interval before installing a fresh feed. `globalThis` survives module re-evaluation; module-scoped state does not.

**Q&A landmine**: "Why not use a React context?" Because the feed is read by both client *and* server code paths in our app — `lib/store.ts` is imported by client islands, but `mocks/feed.ts` could be imported anywhere. A module-scoped singleton with HMR safety is simpler than React context for this use case.

---

## 9. The HUD store — `useSyncExternalStore` and why

The HUD state lives outside React. Reading it from React requires either:
- Convert all subscribers to React state via context (re-renders everything subscribed every change), or
- Use `useSyncExternalStore`, React's official hook for connecting to external stores.

`useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)`:
- `subscribe(listener)` — register a callback the store calls when it changes. Returns an unsubscribe.
- `getSnapshot()` — returns the current state. **Must return the same reference if state hasn't changed**, or React thinks it changed and re-renders unnecessarily.
- `getServerSnapshot()` — returns the SSR-time state. For our HUD it's the immutable INITIAL constant.

The store is implemented as a tiny class:
- Holds a reference to the current state object.
- `set(key, value)` checks `state[key] === value` first — bails if unchanged (referential equality).
- Otherwise creates a *new* state object via spread and notifies all listeners.

Replacing the object instead of mutating is critical: React compares snapshots by `Object.is`. If you mutate, the reference is the same and React skips the re-render even though the value changed.

**Q&A landmine**: "Why not Zustand?" Zustand is great. We don't ship it because the demo is teaching `useSyncExternalStore` directly — Zustand is built on top of it, and showing the primitive earns you the right to use the library.

---

## 10. The chart — why it MUST be a client island, and why hand-rolled

`lightweight-charts` is canvas-based. It calls `getContext('2d')` and draws pixels. None of that exists on the server. Forcing it into RSC would mean somehow rendering canvas to HTML/SVG on the server, which is not what the library does.

So the chart is `'use client'`. That's not a choice — it's a constraint.

The hand-roll is one StrictMode-safe `useLayoutEffect`:

```tsx
useLayoutEffect(() => {
  const chart = createChart(container, options)
  const series = chart.addSeries(AreaSeries, options)
  series.setData(seedHistory(...))
  const unsubscribe = feed.subscribe('price', tick => series.update({...}))
  return () => {
    unsubscribe()
    chart.remove()
  }
}, [])
```

Why one effect, not two? In React 19 + StrictMode, dev mounts components twice (mount → unmount → mount) to catch effects that don't clean up. With one effect:
- First mount: create chart, subscribe.
- Unmount: cleanup runs — `chart.remove()`, unsubscribe. Chart fully torn down.
- Second mount: create chart again, subscribe again. Fresh state, no leaks.

If you split create-and-subscribe across two effects, the cleanup-and-recreate dance leaves stale `series` references in closures. The chart breaks subtly in dev and you don't notice until production.

**`useLayoutEffect` over `useEffect`?** Marginal. `useLayoutEffect` runs synchronously after DOM mutations, before paint. For a chart you want first paint to include the chart, so layout effect is slightly better. But both work in practice.

**Q&A landmine**: "Why not a community wrapper?" The well-known wrappers were stale, untested against React 19, or both. Hand-rolling is 30-40 lines and the pattern itself is talk-worth.

---

## 11. The progression in one sentence per step

- **step-1**: everything client; deliberately bad; baseline numbers.
- **step-2**: Suspense lifts slow data to server; static shell paints fast.
- **step-3**: optimistic UI collapses click-to-feedback latency.
- **step-4**: server is the default; client islands are leaves.
- **step-5**: three failure modes that establish where this stops working.
- **step-5a**: the failed sibling — async RSC awaiting WebSocket-style data, hangs.

If you forget anything else, remember: **server for data-shaped reads, client island for push-shaped state, optimistic for felt latency, throw to revert.**

---

## 12. Things that will sound clever but are wrong

People will say things in Q&A. Be ready:

- **"Server Components replace Redux."** No. Redux is client-side state. Server Components don't have state. They replace the *fetching* layer (where you used to use Redux Thunk / SWR / TanStack Query for data), not the state layer.

- **"RSC is just SSR."** No. SSR renders the same React you have on the client, on the server. The client gets the same JS bundle and re-renders. RSC ships **no JS for the server tree** and the client never re-runs that part.

- **"You can do anything in a server component."** Not quite. No `useState`, no `useEffect`, no event handlers, no browser APIs. You can `await`, you can read your DB, you can read files, you can call other server functions. That's mostly it.

- **"Streaming makes everything faster."** It makes time-to-first-paint faster. It can make time-to-interactive *worse* if a client island hydrates before its data arrives. Measure both.

- **"`useOptimistic` is just `useState`."** It's not — it's tied to React's transition system. Outside a transition, `addOptimistic` is a no-op. The reducer runs every render while a transition is pending. The "auto-revert on action failure" only works because base state is the source of truth.

- **"Just put `'use client'` everywhere — it's simpler."** That's the step-1 baseline. It's slow, ships a lot of JS, no waterfall optimization, no streaming. Simpler isn't free.

---

## 13. If something breaks on stage

| Symptom | Likely cause | Fix |
|---|---|---|
| Chart doesn't render | StrictMode double-mount race | Already mitigated — but if it happens, refresh the page once |
| HUD shows all dashes | `NEXT_PUBLIC_HUD` not set | `echo 'NEXT_PUBLIC_HUD=1' > web/.env.local`, then restart dev |
| `pnpm demo:N` says "command not found" | You're on `live-N` from a previous demo; the tag's package.json doesn't have demo scripts | `git switch -` (back to `feat`), then `pnpm demo:N` again |
| Step-5a doesn't hang | You forgot to switch to the tag | `git switch -C live-5a step-5a-rsc-ws-fail && pnpm install --frozen-lockfile && pnpm --filter @purple-stack/web dev` |
| Port 3000 in use | Another process | `lsof -i :3000` to find it; or just use `:3001` (Next.js auto-falls-back) |
| Tick stress doesn't show degradation | Only one tab open | Open three tabs at the same URL with `?tick=5` |
| `pnpm install` hangs | Conference WiFi | Pre-install before the talk; have all five demos pre-warmed |

**Mantra:** if something breaks, narrate it. The audience is on your side. "And this is what happens when..." is a recoverable beat. Silently fighting your laptop is not.
