# Canva fill sheet — Streaming the Future

Paste-ready content for the Canva deck `react_brno` (https://www.canva.com/design/DAHHa2AolEs).

**How to use:** open the deck. For each slide below, copy the **Title** and **Body** text into the matching text frames; paste **Code** into a mono-font block; drop the **Visual** in. Paste **Presenter notes** into Canva's presenter-notes panel (View → Notes).

**Plan:** 16 slides aligned to the user's sketched outline. Footer convention: `PURPLE TECHNOLOGY · NN · React Brno #1`.

**Theme:** dark (zinc-950 / zinc-900). Mono font for code, sans for prose. Accent colors: **cyan** = client island, **violet** = RSC, **emerald** = optimistic / improvement, **rose** = sharp edge / regression.

**Talk length:** ~17 min content + ~3 min Q&A in a 20-min slot.

**Arc:** problem (users want speed; AI doesn't replace architectural judgment) → demo intro → 5-step roadmap → metrics → fast walkthrough of steps 1–3 with values → RSC concept introduction → CSR/SSR/RSC comparison → step 4 RSC with values → summary of all measurements → practical pros/cons + decision tree → AI as iteration accelerator → resources → Q&A.

---

## Slide 01 — Title

**Footer:** `PURPLE TECHNOLOGY · 01 · React Brno #1`

**Title:**
> Building High-Performance Financial UIs with RSC

**Subtitle (small):**
> Streaming the Future

**Byline:**
> David Chocholatý · Purple Technology · React Brno #1 · 2026-04-27

**Visual:** hero screenshot of the dashboard at `step-3-optimistic-ui` with the HUD overlay visible bottom-right. Dark background.

**Presenter notes:**
> Hello. I'm David — Purple Technology, broker behind Axiory and a fintech wallet called Walletory. Today: build a fintech UI from naive to optimized in four commits, then look honestly at where the new tools fit and where they don't. By the end you'll know which lever to reach for in your own app — and why that decision still matters even with AI doing the heavy lifting.

---

## Slide 02 — Customers want the app to feel fast

**Footer:** `PURPLE TECHNOLOGY · 02 · React Brno #1`

**Title:**
> Customers want the app to feel fast

**Body:**
> The app must **feel** fast — even on mobile, even on slow networks, even on tired hardware.
>
> Every 100 ms of latency = −1% conversion (Amazon).
> In trading, latency is **money** — lost fills, stale prices, abandoned orders.
>
> **AI doesn't change this.** Even with coding agents, the **architectural decisions** — which tool, which boundary, which trade-off — are still ours. AI accelerates implementation; it doesn't choose the shape of the system.

**Visual:** simple split layout. Left: stat callouts (mobile / slow network / 100 ms = −1%). Right: small icon of architect's drafting compass, captioned "still our job".

**Presenter notes:**
> Performance is product, not polish. We aren't optimizing for benchmarks — we're optimizing for the user clicking Place BUY before the price moves. AI agents help us iterate faster on these choices, but they don't make the choices. That's why a talk about RSC vs streaming vs optimistic still matters in 2026 — it's our job to know which one fits.

---

## Slide 03 — Demo app · financial dashboard

**Footer:** `PURPLE TECHNOLOGY · 03 · React Brno #1`

**Title:**
> Demo app — a fintech trading dashboard

**Body:**
> Five panels chosen to cover four architectural archetypes:
>
> **Price chart** → client island (canvas, lightweight-charts) · cyan
> **Order book** → client + ws-style subscription · cyan
> **Order ticket** → optimistic + Server Action · emerald
> **News / research** → server-fetched read · violet
> **Recent trades** → streamed (Suspense) + tiny client tail · violet
>
> Symbol is decorative; data layer is symbol-agnostic. Each panel maps to one archetype on purpose, so when the architecture changes, you see exactly which panel changed.

**Visual:** 2×3 grid screenshot of the dashboard with each panel labeled by archetype.

**Presenter notes:**
> A toy trading dashboard. Aesthetically plausible fintech without claiming domain accuracy. Even if your day job is a slower-cadence client zone (like ours at Purple), there are always parts of the product where speed matters — login, dashboards, orders, anything the user is waiting for. This dashboard is dense enough to demonstrate every pattern we'll discuss.

---

## Slide 04 — The 5-step optimization roadmap

**Footer:** `PURPLE TECHNOLOGY · 04 · React Brno #1`

**Title:**
> Five steps · five lessons

**Body (timeline):**
> 1. **Slow baseline** — naive CSR · everything `'use client'` · `useEffect` data fetching 🟠
> 2. **Streaming** — Suspense + server components · static shell paints fast 🔵
> 3. **Optimistic updates** — `useOptimistic` + Server Action · click feels instant 🟢
> 4. **RSC at the leaves** — server is default · client is exception 🟣
> 5. **Honest limits** — three sharp edges where RSC stops winning 🌹
>
> Reproduce any state: `pnpm demo:N`. Production builds for measurement: `pnpm demo:N:prod`.

**Visual:** horizontal progress bar with 5 color-coded nodes, each labeled with the step's headline.

**Presenter notes:**
> Each step is a runnable git tag. The diff between two consecutive tags is the lesson. We'll spend the next ten minutes walking the ladder and reading numbers off the HUD.

---

## Slide 05 — Metrics · how we'll measure if optimization is worth it

**Footer:** `PURPLE TECHNOLOGY · 05 · React Brno #1`

**Title:**
> Metrics · what we measure, and why

**Body:**
> **Web Vitals** (Next.js `useReportWebVitals`):
> · **LCP** — Largest Contentful Paint (does the page feel painted?)
> · **TTFB** — Time To First Byte (server responsiveness)
> · **FCP** — First Contentful Paint (something visible)
> · **INP** — Interaction to Next Paint (does click→visible feel snappy?)
> · **CLS** — Cumulative Layout Shift (no jumping)
>
> **Custom marks** (`performance.measure`):
> · **JS bytes shipped** (sum of `.js` transferSize)
> · **Hydration time** (root + chart island)
> · **Time-to-trade** (Place BUY click → optimistic commit)
>
> Live HUD in the corner: `NEXT_PUBLIC_HUD=1` · reads via `useSyncExternalStore` from a singleton store.

**Visual:** 2×4 grid of metric cards, each metric paired with the question it answers ("does the page feel painted?", etc.).

**Presenter notes:**
> Web Vitals are the standard browser-level numbers. Custom marks fill the gaps — bundle size and the user-feels metrics like time-to-trade. The HUD is gated behind an env var so production builds don't pay for it. When I say a number moves, the HUD is telling you. We'll see five sets of these numbers, one per step.

---

## Slide 06 — Step 1 · slow CSR baseline (with values)

**Footer:** `PURPLE TECHNOLOGY · 06 · React Brno #1`

**Title:**
> Step 1 — slow baseline · `'use client'` everywhere

**Body:**
> Every panel `'use client'`. Data fetched in `useEffect`. No Suspense.
>
> **Measured (this codebase, throttled Slow 4G + 6× CPU, median of 5):**
> · LCP: _step1.summary.lcp_ ms
> · TTFB: _step1.summary.ttfb_ ms
> · JS shipped: _step1.summary.jsBytes_ kB
> · Time-to-trade: _step1.summary.timeToTradeMs_ ms (~600 ms expected)

**Code (compact):**
```tsx
'use client'
export function NewsPanel() {
  const [items, setItems] = useState(null)
  useEffect(() => {
    (async () => setItems((await import('@/mocks/news.json')).default))()
  }, [])
  return /* … */
}
```

**Visual:** screenshot of dashboard at step-1 with HUD visible. Annotate the slow rows in red.

**Demo cue:** `pnpm demo:1` → reload throttled. Read HUD aloud. **Fly through this fast.**

**Presenter notes:**
> This is what most React tutorials look like. Five client components, all data fetching after mount. Large bundle, slow paint, ~600 ms time-to-trade. Don't dwell — the audience needs to see the numbers and feel the slowness, then move on.

---

## Slide 07 — Step 2 · streaming + Suspense (with values)

**Footer:** `PURPLE TECHNOLOGY · 07 · React Brno #1`

**Title:**
> Step 2 — Suspense + streaming

**Body:**
> Drop `'use client'` on data-shaped panels. Await server-side. One `<Suspense>` per independent slow read.
>
> **Measured (same throttling):**
> · LCP: _step2.summary.lcp_ ms — **Δ vs step 1: -X%**
> · Secondary content visible time collapses (skeletons → real content)
> · JS shipped: _step2.summary.jsBytes_ kB (mostly unchanged — chart still client)

**Code (before / after, compact):**
```tsx
// before — step-1                    // after — step-2
'use client'                           // (no directive — server)
export function NewsPanel() {          export function NewsPanel() {
  const [items, setItems] = …            return <ul>{news.map(/* … */)}</ul>
  useEffect(/* fetch */, [])           }
}
```

**Visual:** two-column diagram — client-fetch waterfall (left) vs streaming with static shell + per-panel arrival (right).

**Demo cue:** `pnpm demo:2`. Reload throttled. **Fly through fast** — point at the secondary-content delta.

**Presenter notes:**
> One Suspense per independent data dependency — not one giant boundary, not popcorn-on-every-leaf. Goldilocks zone. Bundle doesn't move yet because chart canvas is still client; secondary-content visible time is the metric to watch.

---

## Slide 08 — Step 3 · optimistic updates (with values)

**Footer:** `PURPLE TECHNOLOGY · 08 · React Brno #1`

**Title:**
> Step 3 — `useOptimistic` + Server Action

**Body:**
> Click → instant feedback. Server confirms in 600 ms. UI doesn't wait.
> Throw to revert · return to commit.
>
> **Measured:**
> · Time-to-trade: _step3.summary.timeToTradeMs_ ms — **Δ vs step 1: ~600 ms → ~0 ms**
> · INP improves (click response within microtask boundary)
> · LCP / JS bytes: roughly unchanged (this step is interaction, not paint)

**Code (left — client):**
```tsx
'use client'
const [state, formAction] = useActionState(runPlaceTrade, INITIAL_STATE)
const [optimistic, addOptimistic] = useOptimistic(state, (_, next) => ({
  last: next, error: null,
}))
function clientAction(formData: FormData) {
  markTradeClick()
  addOptimistic({ side, size, pending: true })
  markTradeCommitted() // ≈ 0 ms
  formAction(formData)
}
```

**Code (right — server, sidebar):**
```ts
'use server'
const Schema = z.object({ side: z.enum(['buy','sell']), size: z.coerce.number().positive() })
export async function placeTrade(formData: FormData): Promise<PlaceTradeResult> {
  const parsed = Schema.safeParse({ /* … */ })
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Invalid')
  await new Promise(r => setTimeout(r, 600))
  return { ok: true, tradeId: nextTradeId(), /* … */ }
}
```

**Visual:** 3-frame storyboard — click → "(sending…)" pending row → 600 ms later, solid row.

**Demo cue:** `pnpm demo:3`. Click Place BUY 3-4 times. **Fly through fast** — the visible feedback is the lesson.

**Presenter notes:**
> Strongest user-visible win in the demo. Throw contract: action throws → base state doesn't update → optimistic state reverts. Returning `{ ok: false }` instead of throwing leaves the optimistic row stuck. Production rule: revalidation failure after a successful trade should NOT throw — otherwise you revert UI for a trade that actually happened.

---

## Slide 09 — React Server Components

**Footer:** `PURPLE TECHNOLOGY · 09 · React Brno #1`

**Title:**
> React Server Components — what they are

**Body:**
> **Server Components** = React components that render on the server, ship as a wire-format payload, and **never download as JavaScript**. Inline `await`. No state, no effects, no event handlers.
>
> **A second wave of an old idea.** Years ago we had server-rendered HTML (PHP, Rails) and that was unfashionable. RSC is the same idea with a typed protocol, fine-grained boundaries, and React's component model.
>
> **Stable since React 19** (2024). Available in Next.js App Router, Waku, Parcel-RSC. **Not available in classic Express + React, Pages Router, Vite-only setups.**
>
> **For non-experts**: think of RSC as "the server can render React for you, and only the interactive bits travel as JavaScript".

**Visual:** simple diagram — left: timeline showing PHP/Rails (server HTML) → React SPA (client only) → React 18 SSR → **React 19 RSC**. Right: a wire-format icon showing "HTML + payload" with a small "JS only for islands" callout.

**Presenter notes:**
> Audience may know SSR but not RSC. Frame it: server-rendered HTML isn't new — what's new is doing it inside React's component model with a typed wire format and per-island hydration. Stable since React 19, only works in RSC-aware runtimes. If someone asks "can I use it with Express?" — the answer is no, you need a runtime that speaks the protocol.

---

## Slide 10 — CSR vs SSR vs RSC

**Footer:** `PURPLE TECHNOLOGY · 10 · React Brno #1`

**Title:**
> CSR vs SSR vs RSC — at a glance

**Body (table):**
> |  | **CSR** | **Classic SSR** | **RSC** |
> |---|---|---|---|
> | First paint | slow — JS first | fast — server HTML | fast — HTML + payload |
> | JS shipped | the entire app | the entire app | client islands only |
> | Hydration | full tree | full tree | per island |
> | Data fetching | client → API → render | server pre-fetch | inline `await` |
> | Streaming | no | partial | yes — per Suspense |
> | Cache invalidation | client refetch | HTTP cache | `revalidateTag` / `revalidatePath` |

**Visual:** the table. Color-code columns: CSR amber, SSR cyan, RSC violet.

**Presenter notes:**
> CSR = the React you know. Classic SSR = Pages Router, Express + renderToString — fast paint, ships the whole tree. RSC = fast paint AND only client islands ship. Row that matters most: "JS shipped" — that's the bundle delta you'll see in step 4.

---

## Slide 11 — Step 4 · RSC at the leaves (with values)

**Footer:** `PURPLE TECHNOLOGY · 11 · React Brno #1`

**Title:**
> Step 4 — server is default · client is exception

**Body:**
> Push `'use client'` to the leaves. Server components wrap; tiny islands subscribe.
>
> **Measured:**
> · JS shipped: _step4.summary.jsBytes_ kB — **Δ vs step 3: -X kB**
> · LCP / TTFB roughly unchanged (already optimized in step 2)
> · Hydration time: _step4.summary.hydrationMs_ ms — only islands hydrate

**Code (server):**
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

**Code (client island):**
```tsx
// web/app/_components/TradesLiveTail.tsx (client)
'use client'
export function TradesLiveTail({ initialTrades }) {
  const [trades, setTrades] = useState(initialTrades)
  useEffect(() => feed.subscribe('trades', t =>
    setTrades(prev => [t, ...prev].slice(0, 12))
  ), [])
}
```

**Visual:** tree diagram — layout (server) → page (server) → recent-trades (server) → live tail (client). Highlight only the leaf as client. Inset: DevTools Coverage panel diff (step-3 vs step-4).

**Demo cue:** `pnpm demo:4`. Open DevTools → Coverage / Network.

**Presenter notes:**
> Wrapping `<section>` and the initial 12 trades render on the server — already-painted HTML. Only the live subscription is client. Smallest possible client surface. Lightweight-charts dominates this specific bundle, so the delta is modest here; the pattern compounds across structural panels in real apps.

---

## Slide 12 — Summary of all measurements (speed ladder)

**Footer:** `PURPLE TECHNOLOGY · 12 · React Brno #1`

**Title:**
> Summary — what each step actually moved

**Body (table):**
> | Step | Change | Metric | This codebase ² | Cross-check ¹ |
> |---|---|---|---|---|
> | 1 → 2 | Suspense + streaming | Secondary content visible | _step1.lcp → step2.lcp_ | **~4.4 s → ~1.28 s** |
> | 2 → 3 | `useOptimistic` + Server Action | Time-to-trade | _step2.timeToTradeMs → step3.timeToTradeMs_ | (in-demo metric) |
> | 3 → 4 | `'use client'` at the leaves | JS shipped | _step3.jsBytes → step4.jsBytes_ | pattern compounds |
> | warm reload | Cached CSR vs cold RSC | LCP | _step5b.csr.warm.lcp vs step5b.rsc.warm.lcp_ | **~800 ms vs ~750 ms** |
>
> _¹ Nadia Makarevich, developerway.com, Oct 2025 — Slow 4G + 6× CPU._
> _² This codebase, captured per `docs/talk/measurements/PROTOCOL.md`; medians of 5 runs at matching throttling._

**Body (lessons):**
> **Honest takeaways:**
> · Streaming wins the most for slow secondary content.
> · Optimistic UI is the strongest *user-felt* win — it's not really an RSC feature, but it pairs.
> · RSC's repeat-visit margin is razor-thin without server caching (`revalidateTag`).
> · Bundle delta in step 4 is real but small in this demo — pattern matters more than kilobytes.

**Visual:** stacked horizontal bar chart per metric, one bar per step. Color rows: emerald = improvement, rose = regression. Or just the table on a clean dark background.

**Presenter notes:**
> This is the slide to photograph. Two columns of evidence: this codebase's own captured numbers and Makarevich's published cross-check. The lessons in the bottom block are the honest reading — wins, caveats, and the one place RSC actually loses (warm reload without server caching).

---

## Slide 13 — RSC · practical takeaway

**Footer:** `PURPLE TECHNOLOGY · 13 · React Brno #1`

**Title:**
> RSC — what to take home

**Body (top — pros / cons):**
> **Pros** ✓ smaller bundle ✓ data colocation, no API routes ✓ secrets stay server-side ✓ streaming + Suspense per component ✓ Server Actions for mutations
>
> **Cons** ✗ no hooks/effects in server components ✗ caching is your problem (`revalidateTag`) ✗ locked to RSC-aware runtimes ✗ push channels still need client islands ✗ wire-format debugging

**Body (middle — when to reach for what):**
> **Reach for RSC when:** the data is server-shaped (DB, API, FS read), the page is read-mostly, you want secrets server-only, you have slow secondary content.
> **Reach for a client island when:** WebSocket / SSE / polling, real-time visualization, anything interactive at high frequency.
> **Reach for optimistic when:** the user feels the click→confirm latency.
> **Stay on classic SSR or CSR when:** your runtime can't host RSC, or your team can't absorb the caching story.

**Body (bottom — decision tree + mental model):**
> **Decision tree** (single line each):
> DB read → RSC. Mutation → Server Action + RSC. Push → client island. Felt latency → + optimistic. Warm reload speed → + `revalidateTag`.
>
> **Mental model**: server is **data-shaped**, client is **state-shaped**, optimistic **bridges the gap**.

**Visual:** three-row card. Top row: emerald pros vs rose cons two-column. Middle row: four "when to reach for" cards horizontal. Bottom row: simple decision flow + 3-zone mental-model diagram.

**Presenter notes:**
> One slide that combines pros/cons, situational guidance, decision tree, and mental model. Photo-worthy. The key insight: most architectural arguments resolve to "is this push-shaped or pull-shaped?" — pull → server, push → client. RSC isn't a hammer; it's one tool in a kit that now also includes Server Actions, Suspense, optimistic UI, and client islands. Today we have more options than ever.

---

## Slide 14 — With AI we can optimize much faster

**Footer:** `PURPLE TECHNOLOGY · 14 · React Brno #1`

**Title:**
> Don't be afraid to try — AI shrinks the cost

**Body:**
> 5 architectural states · ~3 days of work · with AI pair programming.
>
> **AI gives us:**
> · Faster iteration on architectural experiments
> · Refactor whole sections in hours, not sprints
> · Spike multiple approaches on a real surface, then measure
>
> **AI does not give us:**
> · The architectural decision itself
> · Knowledge of which lever fits which metric
> · Judgment about when *not* to optimize
>
> The way we choose **still depends on us**. AI is the multiplier on the human's architectural judgment — not its replacement.

**Visual:** timeline graphic — left: classic refactor weeks/sprints; right: AI-assisted refactor days. Arrow above showing "the human still chooses the destination". Or a stylized commit graph showing 5 commits across 3 days.

**Presenter notes:**
> The point isn't "AI wrote my code" — it's that the cost of *trying* a pattern dropped enough to be empirical instead of theological. Bring this to your team: stop arguing about RSC vs SPA on Slack, spike both for a real page in a day, and measure. But the spike still needs you to know what to measure and what to compare. That's why this talk still matters.

---

## Slide 15 — Resources

**Footer:** `PURPLE TECHNOLOGY · 15 · React Brno #1`

**Title:**
> Resources · sources · further reading

**Body (top — sources I drew from):**
> **Nadia Makarevich** · developerway.com — RSC + SSR benchmarks (Mar / Oct 2025) · the reproducible RSC numbers in this talk.
> **DoorDash Engineering** · CSR → SSR migration · LCP −65% (Mar 2022).
> **web.dev case studies** · Tokopedia · Lazada · Redbus — field-data evidence that LCP improvements drive conversion.
> **Josh Comeau** · "The Functional Side of React" / Server Components mental model · joshwcomeau.com.
> **Dan Abramov** · "React from Another Dimension" · RemixConf 2023 talk.

**Body (bottom — repo + try it):**
> **Repo:** github.com/davidchocholaty/react-rsc
> **Plan + research digest + measurements:** in `docs/`

**Code (after the talk):**
```bash
git clone https://github.com/davidchocholaty/react-rsc
mise install && pnpm install
echo 'NEXT_PUBLIC_HUD=1' > web/.env.local
pnpm demo:1      # dev mode
pnpm demo:1:prod # production build for measurements
```

**Visual:** clean two-column closer. Left: source list. Right: repo info + QR code.

**Presenter notes:**
> Every number cited in this talk is cross-checkable in `docs/brainstorms/rsc-research-digest.md`. Every measurement is in `docs/talk/measurements/measurements.json`. The repo is open; the methodology is documented; clone and reproduce.

---

## Slide 16 — Q&A

**Footer:** `PURPLE TECHNOLOGY · 16 · React Brno #1`

**Title:**
> Questions.

**Body:**
> @davidchocholaty
> React Brno #1 · 2026-04-27

**Body (right column — QR codes):**
> **Repo** github.com/davidchocholaty/react-rsc
> **Purple Technology** purple-technology.com

**Visual:** title card with handle / contact. Two QR codes side-by-side: repo + Purple Technology. Optional: hero dashboard screenshot with HUD as background.

**Presenter notes (anticipated Q&A):**
> **Q: Why not Server Actions for everything?** A: Mutations only. Reads are RSC.
> **Q: TanStack Start / Remix?** A: They have RSC too. Same model, different ergonomics. Decision tree on slide 13 still holds.
> **Q: WebSockets in production?** A: RSC fetches initial slice; client island opens the WS and prepends. Step-4 pattern.
> **Q: What if the WebSocket is the only data source?** A: Don't model it as RSC — `await` on a never-resolving Promise hangs Suspense forever. Client island, every time.
> **Q: Caching?** A: `revalidateTag` / `revalidatePath`. Out of scope of this talk; biggest production-RSC adoption concern. Without it, RSC's repeat-visit margin disappears.
> **Q: Bundle didn't drop much in step-4 — why?** A: lightweight-charts dominates. Real apps with more structural panels see compounding savings.
> **Q: How does `useOptimistic` actually revert?** A: Throw → base state doesn't update → displayed state reverts to base.
> **Q: Express / Fastify backends?** A: RSC needs a runtime that understands the protocol — Next.js, Waku, Parcel-RSC. Not Express-compatible by design.
> **Q: When NOT to use RSC?** A: Real-time visualizations / chat / collab / games / any high-frequency push → stay SPA + selective islands.
> **Q: Did you really build this in 3 days?** A: Yes — with an AI pair. The codebase is open; clone and reproduce.
> **Q: How does this perform on warm reloads vs a well-cached SPA?** A: Without `revalidateTag`, CSR cached can match or beat RSC. Makarevich measured 800 ms CSR vs 750 ms RSC + Suspense; that gap inverts without server caching.

---

## Image checklist (capture before stage)

- [ ] **Hero screenshot** — dashboard at step-3 with HUD, dark theme · slides 1, 16
- [ ] **Five-panel grid** — full dashboard with archetype labels overlaid · slide 3
- [ ] **HUD close-up** — bottom-right corner cropped, magnified · slide 5
- [ ] **Step-1 dashboard** — HUD showing slow numbers · slide 6
- [ ] **Mid-stream screenshot** — chart painted, news/trades still skeleton · slide 7
- [ ] **Optimistic GIF (or 3 frames)** — click → pending → committed · slide 8
- [ ] **RSC concept timeline diagram** — PHP/Rails → SPA → React 18 SSR → React 19 RSC · slide 9
- [ ] **Tree diagram + DevTools Coverage** — step-3 vs step-4 chunk drop · slide 11
- [ ] **Speed-ladder chart or table render** — clean dark-theme version of slide 12 table · slide 12
- [ ] **Commit graph** — 5 commits across 3 days, AI-assisted · slide 14
- [ ] **QR codes** — repo + Purple Technology · slides 15, 16
  - `qrencode -o repo.png 'https://github.com/davidchocholaty/react-rsc'`
  - `qrencode -o purple.png 'https://purple-technology.com'`

---

## Time budget (20-min slot)

| Block | Slides | Approx |
|---|---|---|
| Open + framing | 1–2 | 1 min |
| Demo intro + roadmap + metrics | 3–5 | 2 min |
| Steps 1–3 fast walkthrough (with values) | 6–8 | 4 min |
| RSC concept + comparison | 9–10 | 2 min |
| Step 4 RSC (with values) | 11 | 1.5 min |
| Speed-ladder summary | 12 | 1.5 min |
| Practical takeaway (pros/cons + decision tree) | 13 | 2 min |
| AI accelerator | 14 | 1 min |
| Resources | 15 | 0.5 min |
| Q&A | 16 | ~3.5 min |

≈ 16.5 min content + 3.5 min Q&A = 20 min. **Never cut slide 12 (speed-ladder summary)** — it's the slide audience photographs. **Slides 6–8 are deliberately fast** — read the numbers, point at the win, move on.

---

## Measurement workflow (committed numbers + stage screenshots)

Slides 6, 7, 8, 11, and 12 reference values from `docs/talk/measurements/measurements.json`. To populate them:

1. Follow `docs/talk/measurements/PROTOCOL.md` end-to-end. Production builds via `pnpm demo:N:prod`. Captures via the DevTools console one-liner `copy(JSON.stringify(__hudStore.getSnapshot(), null, 2))`. 5 runs per step; medians.
2. Commit the filled `measurements.json` so the slide numbers are versioned alongside the deck.
3. (Optional) `node docs/talk/measurements/summarize.mjs` to auto-fill `summary` blocks.
4. When transcribing to Canva, replace each `_stepN.summary.METRIC_` placeholder in the slide bodies with the actual measured number.

Stage rehearsal screenshots (separate from committed numbers; for slide visuals): `pnpm demo:N` for each step under throttled DevTools, screenshot the HUD at the right moment. The committed numbers are what the audience reads. The stage HUD is the live confirmation when you switch to the laptop.

---

## Acknowledge openly on stage

These stay honest framings — **say them, don't put them on the slides**. Slides land the wins; voice carries the integrity.

1. **Step-1 baseline is artificially slow** — `await import('@/mocks/news.json')` in `useEffect` is theatrical, designed to make the lesson read at small-app scale.
2. **Time-to-trade ≈ 0 ms is partly tautological** — microtask boundary by construction; visual feedback is the real lesson.
3. **Bundle delta in step-4 is small here** — lightweight-charts is the heavy leaf; pattern > kilobytes.
4. **Step-5 sharp edges (WS-as-RSC, cached CSR, tick-rate stress) cut for time** — covered as Q&A talking points and partially folded into slide 13's "when not to use RSC". If asked: WS-as-RSC hangs forever; cached CSR can beat cold RSC without server caching; high-frequency push isn't RSC's shape.
5. **AI-assisted ≠ AI-written** — agents drafted, but every architectural decision was deliberate, every commit reviewed.
6. **Speed ladder mixes sources** — your captured numbers + Makarevich cross-check; clarify aloud if asked.
