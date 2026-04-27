# Slide template — Streaming the Future

A slide-by-slide template for the React Brno talk *Streaming the Future: Building High-Performance Financial UIs with RSC*. Drop the headline text, code snippets, and image hints into Canva.

- **Format**: ~25 slides for a ~25 min slot (≈1 min per slide on average; demo slides absorb extra time).
- **Visual style**: dark background to match the dashboard demo (zinc-950 / zinc-900). Mono font for code; sans for prose. Accent colors mirror the dashboard: cyan = client island, violet = RSC, emerald = optimistic, rose = failure.
- **Notation**: each slide has **Headline** (visible text), **Visual** (image/diagram cue), **Speaker notes** (what you say), **Demo cue** (what to switch to on the laptop).
- **Repo**: every code snippet below maps to a file under `web/` at the matching tag.

---

## 1 — Title

**Headline**
> Streaming the Future
>
> Building High-Performance Financial UIs with RSC
>
> David Chocholatý · React Brno · 2026-04-27

**Visual**
- Single hero image: cropped screenshot of the live trading dashboard at `step-3-optimistic-ui` with the HUD overlay visible bottom-right. Dark background.
- Optional: small subtitle "github.com/davidchocholaty/react-rsc" in the corner.

**Speaker notes**
- Introduce yourself. Day job: Purple Technology — fintech (Axiory, Walletory). The demo is a *toy* trading dashboard, not production code.
- The talk is opinionated. By the end you'll know when **not** to reach for RSC.

---

## 2 — The promise vs. the reality

**Headline**
> RSC promises: less JavaScript. Faster first paint. Server-shaped data.
>
> The pitch is real. The fit is partial.

**Visual**
- Split layout: left side "the pitch" — three icons (less JS, fast paint, server data); right side "the reality" — a single icon of a tangled wire (WebSockets/streaming).
- Or a simple two-column text block.

**Speaker notes**
- The framing for the next 25 minutes: I'll teach you to recognize where RSC pulls weight, and where you should reach for a client island instead.
- A trading dashboard is the perfect test case — half of it fits RSC beautifully, half of it doesn't.

---

## 3 — Three pillars (the abstract)

**Headline**
> 1. Optimistic updates
> 2. Suspense + streaming
> 3. The architectural shift to server-first

**Visual**
- Three columns, each with an icon: 🖱️ click → instant state · 💧 droplet streaming · 🖥️ server icon
- Or three numbered cards horizontally.

**Speaker notes**
- These are the three things I'll demo, in order.
- Each gets its own architectural step. Each is its own commit you can `git checkout`.

---

## 4 — Today's audience

**Headline**
> You: intermediate-to-advanced React.
>
> Comparing RSC to: SPA. Classic SSR. TanStack Start. Remix.

**Visual**
- Quadrant or radar chart showing RSC vs. each alternative on dimensions (interactivity, data colocation, bundle size, learning curve). Sketch is fine.

**Speaker notes**
- I won't sell you RSC. I'll give you a mental model so you can decide.
- If you came hoping for a benchmark slide, I'll show you our own numbers. We'll also reference Nadia Makarevich's published benchmark for cross-comparison.

---

## 5 — The demo: a fintech trading dashboard

**Headline**
> Five panels. Four archetypes.

**Visual**
- 2x3 grid screenshot of the dashboard with each panel labeled by archetype:
  - Price chart → **client island**
  - Order book → **client + ws-style**
  - Order ticket → **optimistic**
  - News / research → **RSC server-fetch**
  - Recent trades → **RSC streamed (Suspense)**

**Speaker notes**
- Symbol is decorative. Data layer is symbol-agnostic. Aesthetic plausibly fintech without claiming domain accuracy.
- Each panel is mapped to one architectural archetype on purpose — so when we move between archetypes, you see exactly which panel changed.

---

## 6 — The HUD: live numbers, no faking

**Headline**
> LCP · TTFB · FCP · INP · CLS · JS bytes · Hydration · Time-to-trade

**Visual**
- Cropped screenshot of the bottom-right HUD overlay, magnified.
- Caption: `NEXT_PUBLIC_HUD=1` toggles it.

**Code snippet (small, optional)**
```ts
// web/lib/perf.ts
markChartHydrationStart()
markChartHydrationEnd()  // → performance.measure → store.set
```

**Speaker notes**
- Web Vitals come from Next.js's `useReportWebVitals`. Custom marks (hydration, time-to-trade) come from `performance.mark` / `performance.measure`.
- I'll narrate the HUD numbers as we walk through each step.

---

## 7 — Five tags, five lessons

**Headline**
> step-1-naive-csr → step-2-suspense-streaming → step-3-optimistic-ui → step-4-rsc-boundary → step-5-honest-limits

**Visual**
- Horizontal timeline / progress bar with 5 nodes, each color-coded:
  - 1. amber (slow baseline)
  - 2. cyan (streaming)
  - 3. emerald (optimistic)
  - 4. violet (RSC boundary)
  - 5. rose (limits)

**Speaker notes**
- Each tag is a complete, runnable state. The diff between two consecutive tags is the lesson.
- Code is on GitHub; you can `pnpm demo:N` after the talk.

---

## 8 — Step 1: the naive baseline

**Headline**
> Every panel is `'use client'`. Data fetched in `useEffect`. No Suspense.

**Code snippet**
```tsx
'use client'
export function NewsPanel() {
  const [items, setItems] = useState(null)
  useEffect(() => {
    (async () => {
      const mod = await import('@/mocks/news.json')
      setItems(mod.default)
    })()
  }, [])
  return /* … */
}
```

**Visual**
- Screenshot of the dashboard at step-1 with HUD visible. Annotate two HUD rows: "JS = 200+ kB" and "TRADE = ~600 ms".

**Demo cue**
- `pnpm demo:1` → reload at `localhost:3001` (or 3000). Let the audience see the chart pop in. Read the HUD verbally.

**Speaker notes**
- This is what most React tutorials look like. Five client components, all data fetching after mount.
- Read the HUD: large bundle, slow paint, ~600 ms time-to-trade.

---

## 9 — Step 1 → 2: lift the slow stuff to the server

**Headline**
> `<Suspense>` boundaries on each independent slow read.
>
> Static shell paints in <100 ms. Slow panels stream.

**Code snippet — the `before`/`after`**
```tsx
// before (step-1)                   // after (step-2)
'use client'                          // (no directive — server component)
export function NewsPanel() {         export function NewsPanel() {
  const [items, setItems] =             return <ul>{news.map(/* … */)}</ul>
    useState(null)                    }
  useEffect(() => { /* fetch */ }, [])
  /* … */
}
```

**Visual**
- Two-column: "client fetch waterfall" diagram on the left vs. "streaming" on the right with the static shell appearing immediately and panels arriving over time.
- Reference Nadia Makarevich's perf table screenshot (link in resources).

**Speaker notes**
- Two changes: drop `'use client'`, await server-side. Each independent data dependency gets its own Suspense boundary. Not one giant boundary — that's the anti-pattern.
- Cite Makarevich: 4.4s → 1.28s LCP for secondary content in his benchmark.

---

## 10 — Step 2 demo

**Headline**
> Watch the secondary-content LCP drop.

**Visual**
- Screenshot showing the dashboard mid-stream: chart and order book painted, news + recent-trades still skeleton.

**Demo cue**
- `pnpm demo:2`. Reload with throttled network (Slow 4G in DevTools). Read HUD: secondary LCP drops; JS bytes mostly unchanged.

**Speaker notes**
- The chart is still client (lightweight-charts is canvas — has to be). The bundle hasn't shrunk yet.
- Step-3 attacks a different metric.

---

## 11 — Step 2 → 3: optimistic UI for interactivity

**Headline**
> Click → instant feedback.
>
> Server confirms in 600 ms. UI doesn't wait.

**Code snippet**
```tsx
'use client'
const [state, formAction] = useActionState(runPlaceTrade, INITIAL_STATE)
const [optimistic, addOptimistic] = useOptimistic(state, (_, next) => ({
  last: next, error: null
}))

function clientAction(formData: FormData) {
  markTradeClick()
  addOptimistic({ side, size, price, pending: true })
  markTradeCommitted()  // ≈ 0 ms boundary
  formAction(formData)
}
```

**Visual**
- Animated GIF (or sequence of three screenshots): click → "(sending…)" pending row appears immediately → 600 ms later the row goes solid.

**Demo cue**
- `pnpm demo:3`. Click Place BUY, narrate the time-to-trade reading. Hit it 3-4 times.

**Speaker notes**
- This is the strongest user-visible win in the demo.
- Honest acknowledgement: time-to-trade ≈ 0 ms is partly tautological because we're measuring within a microtask boundary. The *visual* feedback is the real deliverable.

---

## 12 — Server Action: the throw contract

**Headline**
> Throw to revert. Return to commit.

**Code snippet**
```ts
// web/app/_actions/placeTrade.ts
'use server'
const Schema = z.object({ side: z.enum(['buy','sell']), size: z.coerce.number().positive() })

export async function placeTrade(formData: FormData): Promise<PlaceTradeResult> {
  const parsed = Schema.safeParse({ side: formData.get('side'), size: formData.get('size') })
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Invalid trade')
  await new Promise(r => setTimeout(r, 600))  // simulated broker
  return { ok: true, tradeId: nextTradeId(), side: parsed.data.side, size: parsed.data.size, serverTimestamp: Date.now() }
}
```

**Visual**
- Decision diagram: "validation throws" → "optimistic reverts" / "broker says yes" → "state commits" / "broker says no" → "throw → revert" / "revalidate fails" → "log; do NOT throw".

**Speaker notes**
- The wrong-way pattern (return `{ ok: false }` and leave the optimistic state stuck) is a real footgun — I'll demo it on stage in step 5.
- Subtle production rule: revalidation failure after a successful trade should NOT throw. Otherwise the UI reverts a trade that actually happened. Worst possible UX.

---

## 13 — Step 3 → 4: push `'use client'` to the leaves

**Headline**
> Server components are the default. Client islands are the exception.

**Code snippet**
```tsx
// web/app/_components/RecentTrades.tsx (server)
export async function RecentTrades() {
  const initialTrades = await loadInitialTrades()
  return (
    <section aria-label="Recent trades">
      <header>RECENT TRADES <span>RSC initial · client tail</span></header>
      <TradesLiveTail initialTrades={initialTrades} />
    </section>
  )
}
```
```tsx
// web/app/_components/TradesLiveTail.tsx (client)
'use client'
export function TradesLiveTail({ initialTrades }) {
  const [trades, setTrades] = useState(initialTrades)
  useEffect(() => feed.subscribe('trades', t =>
    setTrades(prev => [t, ...prev].slice(0, 12))
  ), [])
  /* … */
}
```

**Visual**
- Tree diagram: layout (server) → page (server) → recent-trades section (server) → live tail (client). Highlight only the leaf as the "client" boundary.

**Speaker notes**
- The wrapping `<section>` and initial 12 trades render on the server — already-painted HTML.
- Only the live subscription needs to be on the client. That's the architectural pattern worth taking home.

---

## 14 — Step 4 demo

**Headline**
> Same UX. Smaller client surface.

**Visual**
- DevTools "Coverage" panel screenshot side-by-side step-3 vs step-4. Or annotate the bundle analyzer output.

**Demo cue**
- `pnpm demo:4`. Open DevTools → Coverage / Network. Show the chunk that doesn't ship anymore.

**Speaker notes**
- Honest: in this specific demo the bundle delta is small because lightweight-charts dominates. The pattern matters more than the kilobytes.
- In a real app where you have lots of structural panels, the savings compound.

---

## 15 — Mental model

**Headline**
> Server: data-shaped. Client: state-shaped.
>
> Optimistic: latency would otherwise be visible.

**Visual**
- Three-circle Venn or three-zone diagram. Each zone has an example: server = "renders once per request" · client = "subscribes / interacts" · optimistic = "user expects instant".

**Speaker notes**
- This is your decision tree. I borrowed it loosely from Josh Comeau's "Server Components: no re-rendering" framing and Dan Abramov's RemixConf 2023 talk.
- Now we get to the part where I tell you where this model breaks.

---

## 16 — Honest limits: a closer

**Headline**
> Three failure modes.
>
> RSC isn't a hammer.

**Visual**
- Three-card layout, each card a failure:
  - **(a)** WebSocket as RSC → ⛔
  - **(b)** Cached CSR vs RSC reload → ⏱️ (CSR wins)
  - **(c)** Tick-rate stress → 📈 (RSC re-renders compound)

**Speaker notes**
- I'll demo all three in the next slides. This is the honest framing.

---

## 17 — Failure (a): WebSocket as RSC

**Headline**
> RSC streams *one response per request*.
>
> A WebSocket is bidirectional and long-lived.
>
> Modeling the second with the first is a category error.

**Code snippet**
```tsx
// step-5a-rsc-ws-fail / web/app/_components/OrderBookRsc.tsx
async function awaitFirstWebSocketMessage(): Promise<BookSnapshot> {
  return new Promise<BookSnapshot>(() => {
    // Intentionally never resolves. Suspense holds the fallback indefinitely.
  })
}

export async function OrderBookRsc() {
  const book = await awaitFirstWebSocketMessage()  // page hangs here
  return /* … */
}
```

**Visual**
- Screenshot of the order-book panel showing the "awaiting first ws message…" Suspense fallback (taken from step-5a). Dashboard around it is normal.

**Demo cue**
- `git switch -C live-5a step-5a-rsc-ws-fail` → `pnpm install --frozen-lockfile` → `pnpm --filter @purple-stack/web dev`.
- Refresh the page. The order-book panel hangs forever. Narrate: "this is what trying to model a push channel as RSC looks like".
- Switch back: `git switch -` then `pnpm demo:5`.

**Speaker notes**
- I rehearsed this 5+ times. If it doesn't hang on stage for some reason, the slide does the work.
- The fix is what we already shipped in step-4: keep the order book as a client island that subscribes via `useEffect`.

---

## 18 — Failure (b): cached CSR can beat RSC

**Headline**
> Warm reload + browser cache + no server caching = CSR wins.

**Visual**
- Two HUD screenshots side-by-side:
  - Left: `?csr=1`, warm reload, LCP 320 ms
  - Right: `?csr=0`, warm reload, LCP 1.1 s
- Header badges visible (CSR · client cache vs RSC · server stream).

**Demo cue**
- `pnpm demo:5` running. Hit `/?csr=1`, reload twice (cold, then warm). Hit `/?csr=0`, reload twice. Read HUD aloud.

**Speaker notes**
- Reference Makarevich's table: 800 ms CSR cached vs 750 ms RSC + Suspense — and that's *with* the RSC having a smart cache layer. Without one, RSC loses on warm reload.
- The lesson: RSC is not a free win against a well-cached SPA. You need `revalidateTag` / `revalidatePath` to catch up.

---

## 19 — Failure (c): tick-rate stress

**Headline**
> Server-side re-renders compound.
>
> Each request pays the cost.

**Visual**
- Screenshot of three browser tabs side-by-side, each showing the dashboard at `?tick=5`. HUD numbers visibly stale across tabs.

**Demo cue**
- `?tick=5` in three tabs. Watch the response numbers degrade.

**Speaker notes**
- Honest acknowledgement: in our specific demo the load shows on the *client* feed first, because the data layer is in-process. A real RSC server with revalidation pings would show the cost on the server.
- Either way, the lesson holds: high-frequency updates are not the natural shape of RSC. They're the natural shape of WebSockets and client islands.

---

## 20 — When to reach for what

**Headline**
> RSC: read-mostly, server-shaped, slow data.
>
> Client island: push, interactive, real-time.
>
> Optimistic: when latency would otherwise be felt.

**Visual**
- Decision flowchart:
  - "Does the data come from your DB / API / FS?" → Yes → "Does it change per user interaction?"
    - No → **RSC**
    - Yes (rare) → **Server Action + RSC**
  - "Is the data pushed (WS, SSE, polling)?" → **Client island**
  - "Will the user feel the latency between click and confirmation?" → **+ optimistic**

**Speaker notes**
- Print this and tape it to your monitor. Most architectural arguments resolve to "is this push-shaped or pull-shaped?".

---

## 21 — What we shipped today

**Headline**
> 5 progression tags · 1 sibling failure tag · live HUD · open repo

**Visual**
- Screenshot of the GitHub tags page (or `git tag -n` output formatted as a list).
- QR code linking to the repo.

**Speaker notes**
- All code is on GitHub. Each tag is a complete state — clone, `pnpm demo:N`, reload.
- README maps each tag to its lesson.

---

## 22 — Stack notes

**Headline**
> Next.js 15.5 · React 19 · Tailwind v4 · lightweight-charts · Vitest · pnpm catalogs · Biome · mise · SST 4

**Visual**
- Logo wall (8 small logos in a single row). Or just the bullet list on a clean slide.

**Speaker notes**
- Why 15.5 and not 16.x? SST's pinned OpenNext is best-tested with 15.x. 16 is the post-talk upgrade.
- Why hand-rolled lightweight-charts? Community wrappers are stale or React-19-untested. Hand-roll is 30-40 lines and the imperative-canvas-in-React pattern is itself useful talk material.

---

## 23 — What I deliberately didn't do

**Headline**
> No real broker. No real market data. No multi-user. No live deploy.
>
> No cross-framework comparison built into the demo.

**Visual**
- Bullet list with strike-through styling.

**Speaker notes**
- A demo's value comes from what it leaves out as much as from what it shows.
- This is local-only on stage. SST infra is wired but I'm not deploying live during the talk.

---

## 24 — Resources

**Headline**
> github.com/davidchocholaty/react-rsc
>
> Plan + research digest live in `docs/`

**Visual**
- Repo screenshot or QR code.
- Smaller text below: links to Next.js streaming guide, `useOptimistic` reference, Makarevich's benchmark, Comeau's article, Abramov's RemixConf 2023 talk.

**Code snippet — to read after the talk**
```bash
git clone https://github.com/davidchocholaty/react-rsc
cd react-rsc
mise install && pnpm install
echo 'NEXT_PUBLIC_HUD=1' > web/.env.local
pnpm demo:1
```

**Speaker notes**
- The plan document under `docs/plans/` is essentially a long-form version of this talk. Every "why" you might Q&A is in there.

---

## 25 — Q&A

**Headline**
> Questions.
>
> @davidchocholaty · React Brno · 2026-04-27

**Visual**
- Title card with your handle / contact. Optional: screenshot of the running dashboard with HUD.

**Speaker notes**
- Anticipated Q&A:
  - "Why not Server Actions for everything?" → They're for mutations. RSC handles reads. Don't blur the line.
  - "What about TanStack Start / Remix?" → They have RSC too now. Different ergonomics, same model.
  - "How does this work with WebSockets in production?" → Client island that subscribes; pass the initial slice from RSC. Exactly the step-4 pattern.
  - "Caching?" → `revalidateTag` / `revalidatePath`. Out of scope for this demo, biggest production-RSC adoption concern.
  - "Bundle size didn't drop much in step-4 — why?" → lightweight-charts is the heavy leaf. In a real app with more structural panels, the delta compounds.

---

## Appendix — Quick-reference image checklist

Images you'll want to capture before the talk and drop into Canva:

- [ ] **Hero screenshot** — dashboard at step-3 with HUD, dark theme. Slide 1, 21, 25.
- [ ] **Five-panel grid screenshot** — full dashboard with archetype labels overlaid. Slide 5.
- [ ] **HUD close-up** — bottom-right corner cropped, magnified. Slide 6.
- [ ] **Step-1 dashboard** with HUD showing slow numbers. Slide 8.
- [ ] **Mid-stream screenshot** — chart painted, news/trades still skeleton. Slide 10.
- [ ] **Optimistic GIF (or 3 frames)** — click → pending → committed. Slide 11.
- [ ] **DevTools coverage / bundle analyzer** — step-3 vs step-4. Slide 14.
- [ ] **Order-book hang** — Suspense fallback "awaiting first ws message…" visible. Slide 17.
- [ ] **CSR vs RSC HUD side-by-side** — both LCP numbers visible. Slide 18.
- [ ] **Three-tab tick stress** — three browsers at `?tick=5`. Slide 19.
- [ ] **GitHub tags page** screenshot. Slide 21.
- [ ] **QR code** to the repo. Slide 24.

Generate the QR with any tool (`qrencode -o repo.png 'https://github.com/davidchocholaty/react-rsc'` or an online generator).

---

## Appendix — Time budget

| Block | Slides | Approx |
|---|---|---|
| Open + framing | 1–4 | 2–3 min |
| Demo intro + HUD | 5–7 | 2 min |
| Steps 1–4 (with demos) | 8–14 | 10–11 min |
| Mental model | 15 | 1 min |
| Honest limits | 16–19 | 5–6 min |
| Wrap | 20–24 | 2–3 min |
| Q&A | 25 | remainder |

Rehearse with a stopwatch. If you're over, the first beat to cut is **step-5 (c) tick stress** (the architecture caveat is harder to land in 30 seconds). Don't cut step-5 (a) — that's the strongest content.

---

## Appendix — Things to acknowledge openly on stage

These are honest framings the doc-review surfaced. Put them on a slide or say them aloud — don't let an attentive audience catch you unprepared.

1. **Step-1 baseline is artificially slow.** The `await import('@/mocks/news.json')` in `useEffect` is theatrical. Frame it: "I made the baseline deliberately slow so the lesson reads at small-app scale."
2. **Time-to-trade ≈ 0 ms is partly tautological.** Microtask boundary by construction. The visual feedback is the real lesson.
3. **Tick-rate stress loads the *client* feed first.** Our data layer is in-process. The lesson generalizes; the metric in this specific demo doesn't directly prove server load.
4. **Bundle delta in step-4 is small here.** lightweight-charts is the heavy leaf. The pattern matters more than the kilobytes.
5. **HUD bottom-right at `text-xs` may be unreadable past row 3.** Read the numbers verbally during walkthrough.
