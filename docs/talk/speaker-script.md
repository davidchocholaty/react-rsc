# Speaker script — Streaming the Future

What to say, slide by slide. Read it, internalize it, then deliver it in your own words. Times are approximate; rehearse with a stopwatch.

Style notes:
- Each `Say:` block is a spoken paragraph. Read aloud at least three times before stage.
- `Beat:` = pause. Audiences need silence to absorb a hard claim.
- `Click:` = next slide / advance.
- `Demo:` = switch to the laptop. You should already be on the right tag.

---

## Slide 1 — Title (0:00 → 0:30)

**Say:**
> Hello. I'm David. I work at Purple Technology — we build the broker behind Axiory and a fintech wallet called Walletory. Day-job stack is actually Vite + tRPC + TanStack Router. So everything you'll see today is *not* what we ship in production. It's a learning artifact, and it's an opinionated one.
>
> The talk is called *Streaming the Future*, but I'd ask you to read it as a question rather than a promise. By the end of these 25 minutes I want you to know **where Server Components fit, and where they actively make your life worse**. We'll build a trading dashboard, watch it get faster across five commits, and then I'll deliberately break it three different ways so you can spot those failure modes in your own code.

**Beat.**

**Click → slide 2.**

---

## Slide 2 — The promise vs. the reality (0:30 → 1:15)

**Say:**
> The pitch for RSC is real. Less JavaScript shipped to the browser, faster first paint, data fetched right next to the component that needs it. Every word of that is true — for the workloads it fits.
>
> What you don't hear at conferences is the second half: a real product is half "fetch this list from the database" and half "stream live prices over a socket and let the user click a button at any time". The first half is exactly what RSC is for. The second half — push channels, optimistic interactions, anything bidirectional — is not. Today I'll show you both halves of that line.

**Click → slide 3.**

---

## Slide 3 — Three pillars (1:15 → 2:00)

**Say:**
> Three things I'm going to demonstrate, in this order:
>
> One — **optimistic updates**. Click a button, see the result before the server has confirmed.
>
> Two — **Suspense and streaming**. Render the static parts of the page in milliseconds, let the slow parts arrive as they're ready.
>
> Three — **the architectural shift to server-first**. Push `'use client'` so deep into the tree that what's left on the client is just the truly interactive bits.
>
> Each of those gets its own commit. Each commit is a real, runnable state of the app. You can clone the repo and check out any of them.

**Click → slide 4.**

---

## Slide 4 — Audience (2:00 → 2:30)

**Say:**
> A quick note on framing. I'm assuming intermediate-to-advanced React knowledge. If you've used `useEffect`, you'll be fine. I'm also assuming you're comparing RSC to alternatives — classic SPA, classic SSR, TanStack Start, Remix — rather than coming in fresh.
>
> I won't sell you on RSC. I'll give you a mental model. You'll decide.

**Click → slide 5.**

---

## Slide 5 — The demo (2:30 → 3:30)

**Say:**
> Here's what we're building. Five panels. The symbol on top is decorative — the data layer is symbol-agnostic. Aesthetics that read as plausible fintech without claiming domain accuracy, because I am not promising you a production trading system.
>
> Each panel is mapped to one architectural archetype on purpose:
>
> - The **price chart** is a client island. It uses TradingView's lightweight-charts library, which is canvas-based and inherently client.
> - The **order book** is also client, with a WebSocket-style subscription.
> - The **order ticket** is the optimistic-UI panel.
> - **News and research** is the RSC server-fetch panel — it reads a JSON fixture on the server, no waterfall.
> - **Recent trades** is RSC streamed via Suspense, with a tiny client island on top for live updates.
>
> This mapping is fixed across every progression step. What changes is the *implementation* of each panel.

**Click → slide 6.**

---

## Slide 6 — The HUD (3:30 → 4:15)

**Say:**
> One more thing before we start measuring. Every screenshot you'll see has this HUD overlay in the bottom-right. It surfaces the metrics we'll narrate: LCP, TTFB, hydration time, JS bytes shipped, and time-to-trade.
>
> The Web Vitals come from Next.js's built-in `useReportWebVitals` hook. The custom marks — hydration, time-to-trade — come from `performance.mark` and `performance.measure`. There's a single client-side singleton store, read by the HUD via `useSyncExternalStore`. The HUD is gated behind an environment variable so non-demo builds don't pay for it.
>
> The point: when I tell you a number moves between two steps, that's the live HUD telling you. Not a benchmark slide.

**Click → slide 7.**

---

## Slide 7 — Five tags (4:15 → 4:45)

**Say:**
> Five tags. Five lessons. The diff between two consecutive tags **is** the lesson. Step 1 is a baseline — deliberately bad. Step 5 is honest limits — three failure modes. Steps 2 through 4 do the real architectural work.
>
> Anyone who clones the repo can run `pnpm demo:1` through `demo:5` and reproduce every state.

**Click → slide 8.**

---

## Slide 8 — Step 1 baseline (4:45 → 5:45)

**Say:**
> Here's step 1. This is what most React tutorials look like. Every panel is `'use client'`. Data fetching happens in `useEffect` after the component mounts. The news panel — even though the data is just a JSON file — does a dynamic import inside `useEffect` so it feels like a fetch. There's no Suspense boundary anywhere. The order ticket has a 600-millisecond stub for the server.

**Demo:** [you should already be on `live-1` — switch tab to browser at `localhost:3001`]

**Say:**
> Look at the HUD. JS bytes shipped is large because the entire dashboard is client. Time-to-trade — when I click Place BUY — is around 600 milliseconds. LCP is slow because the chart is the painted-content reference and the chart is client.
>
> [Click Place BUY a couple of times. Read the time-to-trade aloud.]
>
> This is our baseline. We'll improve every one of these numbers.

**Click → slide 9.**

---

## Slide 9 — Step 2 the diff (5:45 → 6:30)

**Say:**
> Step 2. Two changes. We drop `'use client'` from the news panel. We delete the `useEffect` and read the JSON statically at the top of the file. Now the news panel is a server component — it never ships a single byte of JavaScript related to news rendering.
>
> Same idea for recent trades — async server component that awaits an 800-millisecond simulated server fetch. The static shell of the page paints immediately, and each slow panel suspends independently inside its own Suspense boundary.
>
> One Suspense per independent data dependency. Not one giant boundary at the top — that defeats the purpose. Not popcorn-on-every-leaf either. The Goldilocks zone is "one boundary per slow read".

**Click → slide 10.**

---

## Slide 10 — Step 2 demo (6:30 → 7:45)

**Say:**
> Let's see it. [Switch back to terminal, hit Ctrl+C, run `pnpm demo:2`. Wait for ready.]

**Demo:** Reload the page, ideally with throttled network in DevTools (Slow 4G).

**Say:**
> Static shell paints immediately — the chart, order book, order ticket. The news panel and recent trades show their skeleton fallbacks. Then they stream in. The chart is still loading because it's client and ships a 50-kilobyte canvas library. But the secondary content — news, trades — is already there.
>
> The HUD shows LCP for secondary content drops dramatically. JS bytes shipped is mostly unchanged in this step because the chart is the heavy thing, and the chart is still client. We'll attack that in step 4.

**Click → slide 11.**

---

## Slide 11 — Step 3 optimistic (7:45 → 9:30)

**Say:**
> Step 3 is my favorite, because it's the strongest user-visible win of any of these patterns.
>
> The order ticket gains `useOptimistic`. That hook lets you say: "while the action is pending, render *this* state instead of the real one". Paired with a Server Action — `placeTrade` — and `useActionState`, the whole thing becomes a few lines.
>
> Read the code on the slide. The `clientAction` function fires three things synchronously: it marks the click for the HUD, calls `addOptimistic` to apply the pending state, marks "committed", and *then* dispatches the actual server action. Because all four of those happen in the same JavaScript task, the optimistic state appears within a microtask. No matter how slow the server is.

**Demo:** `pnpm demo:3`. Click Place BUY a few times.

**Say:**
> Watch the time-to-trade reading. It's reading microseconds now, basically zero. The "(sending...)" row appears the instant I click. 600 milliseconds later, when the simulated broker responds, the row goes solid.
>
> Honest acknowledgement: time-to-trade ≈ 0 milliseconds is partly tautological — we're measuring within a microtask boundary, of course it's near zero. The deliverable here is **the visual feedback**, not the metric. The user sees their click respect them. That's the lesson.

**Click → slide 12.**

---

## Slide 12 — Server Action throw contract (9:30 → 10:45)

**Say:**
> The Server Action throws on validation failure. That's important. `useOptimistic` reverts when the underlying state doesn't update — which happens when the action throws — so the optimistic pending row disappears cleanly.
>
> If you returned `{ ok: false }` instead of throwing, the optimistic state would be stuck. The user would see a pending row that never resolves. That's the wrong-way pattern. I demo it on stage in step 5.
>
> One subtle production rule on this slide: **revalidation failure after a successful trade should NOT throw**. If `revalidatePath` errors after the trade actually placed, you log it server-side and return success. Otherwise you'd revert UI for a trade that genuinely happened. That's the worst possible UX in a fintech product.

**Click → slide 13.**

---

## Slide 13 — Step 4 push to leaves (10:45 → 12:00)

**Say:**
> Step 4. We split recent trades into two pieces. The wrapping `<section>`, the header, the initial 12 trades — all rendered on the server. RSC sends already-painted HTML. On top of that we drop a tiny client component called `TradesLiveTail` whose only job is to subscribe to the mock feed and prepend new prints.
>
> This is the canonical pattern: **RSC for the initial slice, client island for the live tail**. The smallest possible client surface. Look at the code — the live tail is maybe 25 lines.
>
> News and the page layout are also fully RSC at this point. Only chart, order book, order ticket, the HUD, and the live tail are still `'use client'`.

**Click → slide 14.**

---

## Slide 14 — Step 4 demo (12:00 → 13:30)

**Demo:** `pnpm demo:4`. Open DevTools → Coverage panel.

**Say:**
> Visually nothing changed. The page behaves exactly the same as step 3.
>
> But look at the bundle. [Show coverage panel or `next analyze`.] The recent-trades structure no longer ships as JavaScript. Only the live-tail subscription does.
>
> Honest framing: in this specific demo the JS-bytes drop is modest because lightweight-charts is the heavy leaf and it has to stay client. The bundle delta you'd see in a real app — with lots of structural panels — compounds. Take the architectural lesson, not the kilobytes.

**Click → slide 15.**

---

## Slide 15 — Mental model (13:30 → 14:30)

**Say:**
> Pause for the mental model. This is your decision tree.
>
> Server components are for **data-shaped reads**. They render once per request. They have no state, no effects, no event handlers. If your component fetches from a database or reads a file, it should default to RSC.
>
> Client islands are for **state-shaped interactions**. Subscriptions, event handlers, anything that reacts to time or user input. The chart, the order book — push-shaped data lives here.
>
> Optimistic UI is for **when latency would otherwise be felt**. It's not free — you write a reducer that merges a pending state into the real state. It's worth it when the user expects instant feedback and the network can't deliver.
>
> If you take one slide home, take this one.

**Click → slide 16.**

---

## Slide 16 — Honest limits intro (14:30 → 15:00)

**Say:**
> Now the honest part. Three failure modes. I'll demo all three.

**Click → slide 17.**

---

## Slide 17 — Failure (a) WebSocket as RSC (15:00 → 17:30)

**Say:**
> The first failure mode is the most important one for senior engineers in this room.
>
> RSC streams **one response per request**. The server sends payload, the client receives, the connection closes. That's it. A WebSocket is bidirectional and long-lived — multiple messages, both directions, the connection stays open until somebody closes it. Modeling the second with the first is a category error.
>
> Concretely: if you write an `async` server component that awaits a "first WebSocket message", the Suspense boundary either hangs forever or it resolves with one snapshot and never updates. Neither of those gives you a live order book.
>
> Let me show you.

**Demo:** [Stop dev server. Run `git switch -C live-5a step-5a-rsc-ws-fail && pnpm install --frozen-lockfile && pnpm --filter @purple-stack/web dev`. Open browser, reload the page.]

**Say:**
> Watch the order-book panel. [Wait. It will show "awaiting first ws message…" indefinitely.] That's the Suspense fallback for an `await` that never resolves. The rest of the page is fine. The order book is just gone.
>
> If you ship this on a real product, your order book never updates. Customer support calls follow.
>
> The fix is exactly what we already had in step 4: keep the order book as a client island that subscribes via `useEffect`. Let me switch back.

**Demo:** [`git switch -` then `pnpm demo:5`.]

**Say:**
> RSC is one-shot per response. Long-lived push channels are a client-island problem. Always.

**Click → slide 18.**

---

## Slide 18 — Failure (b) cached CSR vs RSC (17:30 → 19:30)

**Say:**
> Second failure mode. Less dramatic, more sneaky.
>
> Imagine your news endpoint takes 800 milliseconds on the server because RSC re-renders it every request. Your CSR alternative loads the JSON once into the bundle, the browser caches it, and the second visit is essentially free.
>
> On a warm reload, **the CSR path wins**. You can verify this in our demo with a query parameter.

**Demo:** Hit `/?csr=1`. Reload twice — once cold, once warm.

**Say:**
> Read the HUD. CSR mode, warm reload — LCP under 400 milliseconds. Now `?csr=0`, RSC mode, warm reload — that 800-millisecond server fetch happens every single time. RSC mode loses on warm reload.

**Demo:** `?csr=0`, reload twice.

**Say:**
> The lesson is: **RSC is not a free win against a well-cached SPA**. To make RSC compete on warm reloads you need a server-side cache layer — `revalidateTag`, `revalidatePath`, an HTTP cache between the server and the user. That's an entire production-RSC topic that this demo deliberately doesn't cover.
>
> Nadia Makarevich has a published benchmark showing 800 milliseconds CSR-cached versus 750 milliseconds RSC-with-Suspense — and that's *with* a smart cache. Without one, the gap widens.

**Click → slide 19.**

---

## Slide 19 — Failure (c) tick stress (19:30 → 21:00)

**Say:**
> Third failure mode. Tick rate stress.
>
> Crank the mock feed to one tick every 5 milliseconds. Open the same page in three browser tabs. Now you have 600 ticks per second across three independent client subscribers.

**Demo:** `?tick=5` in three tabs.

**Say:**
> The HUD shows the response time of each tab degrade. The mock feed is in-process — it lives in the browser tab — so what you're actually watching is the **client** struggle. Be honest about that on this slide.
>
> The lesson generalizes though: high-frequency push data is not the natural shape of RSC. RSC re-renders on every request; if you're driving server work at 200 Hz, you'll feel it. The fix, again: client island that subscribes once and renders many times in-place.

**Click → slide 20.**

---

## Slide 20 — When to reach for what (21:00 → 22:00)

**Say:**
> One slide for your monitor.
>
> Server components for read-mostly, server-shaped data. News, trade history, anything coming from your database.
>
> Client islands for push channels, real-time updates, anything where you'd reach for a WebSocket or SSE.
>
> Optimistic UI on top of either, when the user would otherwise feel the latency between click and confirmation.
>
> Most architectural arguments resolve to one question: **is this push-shaped or pull-shaped?** Push-shaped means client. Pull-shaped means server. That's most of it.

**Click → slide 21.**

---

## Slide 21 — What we shipped (22:00 → 22:30)

**Say:**
> Five tags, one sibling failure tag, live HUD numbers we measured ourselves, all open source. Clone, run `pnpm demo:N`, reload, learn.

**Click → slide 22.**

---

## Slide 22 — Stack notes (22:30 → 23:00)

**Say:**
> Quick stack mention so nobody asks. Next.js 15.5 — chosen over 16 because SST's pinned OpenNext is best-tested with 15.x and 16 has async params changes that aren't load-bearing for this demo. Tailwind v4 because it's zero-runtime and RSC-safe. Charting is a hand-rolled lightweight-charts wrapper because community wrappers were stale or untested against React 19.
>
> No state library. The HUD store is a 50-line `useSyncExternalStore` singleton. We don't need Zustand to teach the lessons.

**Click → slide 23.**

---

## Slide 23 — What I didn't do (23:00 → 23:30)

**Say:**
> Things I deliberately left out, because a good demo's value is what it leaves on the cutting room floor: no real broker, no real market data, no auth, no multi-user simulation, no live deploy during the talk. SST infrastructure is wired for an opt-in deploy after the talk if anyone wants a public URL.

**Click → slide 24.**

---

## Slide 24 — Resources (23:30 → 24:30)

**Say:**
> Repo URL is on the slide and on the QR code. The `docs/plans` folder has the long-form version of this entire talk — every architectural decision is documented with rationale and trade-offs. The `docs/brainstorms/rsc-research-digest.md` has the external benchmarks I cited.
>
> Three external links worth your time after this:
> - Josh Comeau's article on Server Components — clear mental model.
> - Dan Abramov's "React from Another Dimension" RemixConf 2023 talk — historical motivation.
> - The Next.js streaming guide — official docs, surprisingly readable.
>
> Clone the repo, run `pnpm demo:1`, and read the diffs.

**Click → slide 25.**

---

## Slide 25 — Q&A (24:30 → end)

**Say:**
> Questions.

**Anticipated questions and answers:**

> **Q: Why not just use Server Actions for everything?**
> A: Server Actions are for **mutations**. Reads are RSC. Don't blur the line — Server Actions have transaction semantics and revalidation behavior; RSC is pure rendering.

> **Q: How does this compare to TanStack Start or Remix?**
> A: They've added RSC support. Same mental model, different ergonomics. The decision tree on slide 20 holds for any of them.

> **Q: What about WebSockets in production with RSC?**
> A: Pattern: RSC fetches the initial slice (most recent N events), client island opens the WebSocket and prepends live updates. Exactly what we did with `TradesLiveTail` in step 4.

> **Q: You didn't talk about caching — how does that fit in?**
> A: Honest: it didn't fit in 25 minutes. `revalidateTag` and `revalidatePath` are the production RSC adoption story. Step 5 (b) hints at why — without server-side caching, RSC loses on warm reloads.

> **Q: Bundle didn't drop much in step 4 — why?**
> A: lightweight-charts dominates. It's canvas — has to be client. In a real app with more structural panels (admin dashboards, content sites), the savings compound. Trust the pattern more than the kilobytes you saw today.

> **Q: Is the WebSocket failure simulated or real?**
> A: Simulated with a never-resolving Promise. The lesson is structural — a real WebSocket has the same failure shape because RSC's wire protocol is single-response.

> **Q: How does `useOptimistic` actually revert?**
> A: It computes the displayed state from a base state. When you call `addOptimistic`, the displayed state diverges from base for the duration of the action. When the action completes, the base state catches up. If the action throws, base doesn't update — and the displayed state reverts to whatever base was. That's the throw contract.

> **Q: Can I use this with Express / Fastify / non-Next backends?**
> A: RSC needs a runtime that understands the protocol. Today that's Next.js, Waku, Parcel-RSC, and a few experiments. It's not Express-compatible by design — server components are part of the framework, not a library.

> **Q: When should I NOT use RSC?**
> A: Personal rule: if your app is mostly forms and dashboards over CRUD APIs, RSC is great. If your app is mostly real-time visualizations, chat, collab, or games — stay SPA, reach for client islands selectively. The decision tree holds.

---

## Cheat sheet — pacing reset

If you're halfway through and over-time:
- Cut step-5(c) tick stress entirely (slide 19). The architecture caveat is hard to land in 30 seconds.
- Compress slide 22 (stack) to a one-liner.
- Skip slide 23 (what I didn't do).

If you're under-time:
- Add a bonus slide on `revalidateTag` after slide 20.
- Walk through the placeTrade Zod schema on slide 12 in more depth.

Never cut step-5(a). The WebSocket-as-RSC failure is the strongest single content beat in the talk.
