# Canva fill sheet — Streaming the Future

Paste-ready content for the Canva deck `react_brno` (https://www.canva.com/design/DAHHa2AolEs).

**How to use:** open the deck. For each slide below, copy the **Title** and **Body** text into the matching text frames; paste **Code** into a mono-font block; drop the **Visual** in. Paste **Presenter notes** into Canva's presenter-notes panel (View → Notes).

**Plan:** 17 slides aligned to the user's sketched outline plus a dedicated WebSocket-as-RSC failure beat. Footer convention: `PURPLE TECHNOLOGY · NN · React Brno #1`.

**Theme:** dark (zinc-950 / zinc-900). Mono font for code, sans for prose. Accent colors: **cyan** = client island, **violet** = RSC, **emerald** = optimistic / improvement, **rose** = sharp edge / regression.

**Talk length:** ~17 min content + ~3 min Q&A in a 20-min slot.

**Arc:** problem (users want speed; AI doesn't replace architectural judgment) → demo intro → 5-step roadmap → metrics → fast walkthrough of steps 1–3 with values → RSC concept introduction → CSR/SSR/RSC comparison → step 4 RSC with values → summary of all measurements → **WebSocket-as-RSC failure (the strongest "don't do this" beat)** → practical pros/cons + decision tree → AI as iteration accelerator → resources → Q&A.

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

**Body (bullets):**
> - Modern apps need to **feel fast** — on mobile, on slow networks, on tired hardware
> - Performance is a **product feature**, not a polish step — speed is part of what users buy
> - React 19 brought a new toolbox: **RSC, streaming, Server Actions, optimistic UI** — each fits a different problem, and choosing wrong costs more than choosing none
> - AI accelerates implementation, but the **architectural decision is still ours** — and that's what this talk is about

**Visual:** clean 4-bullet layout on dark background. Optional small icon row at the bottom showing the four tools (RSC · streaming · Server Actions · optimistic) in muted accent colors.

**Presenter notes:**
> Performance is product, not polish. The point of this talk isn't a benchmark contest — it's that React 19 gave us several new tools that each solve a different shape of problem, and picking the right one still requires judgment. AI lets us try architectural ideas in hours instead of sprints, but it doesn't make the architectural choice for us. That's why a talk about RSC vs streaming vs optimistic still matters in 2026 — it's our job to know which lever fits which problem. The next slides walk through the demo, the metrics, and five concrete steps of that decision in action.

---

## Slide 03 — Demo app · financial dashboard

despite the fact we develop client zone not so forced for the quick update, there are still situations we should focus on speed
tady ukazu demo appku, kterou budu pouzivat behem prezentace. Popisu jednotlive casti, co obsahuje a proc zrovna tyhle casti jsem na dashboard zvolil a jsou dobre pro ukazku moznosti optimalizace a pro mereni

**Footer:** `PURPLE TECHNOLOGY · 03 · React Brno #1`

**Title:**
> Demo app — a fintech trading dashboard

**Body:** _(none — screenshot speaks for itself; talk over it)_

**Visual:** full-bleed screenshot of the dashboard at `step-3-optimistic-ui` (or `step-4-rsc`) on a dark background. No labels, no overlays, no annotations — just the app. Footer + slide number stay.

**Presenter notes:**
> _Three beats — what it contains, why those specific panels, why this is the right shape for the talk._
>
> **What it contains.** Five panels: price chart, order book, order ticket (BUY / SELL), news / research, recent trades. A toy trading dashboard — aesthetically plausible fintech, no claim of domain accuracy. Symbol is decorative, data layer is mocked.
>
> **Why those specific panels.** Each panel maps to a different architectural pattern, on purpose:
> · price chart → heavy client island (canvas / lightweight-charts)
> · order book → real-time push (WebSocket-shaped subscription)
> · order ticket → mutation that needs optimistic feedback + Server Action
> · news / research → static server-fetched read
> · recent trades → streamed initial render + tiny client tail
>
> Five panels, four architectural shapes. So when we change the architecture across the five steps, you can see *exactly* which panel moved — the demo isolates the lesson.
>
> **Why this is useful for our purpose.** Fintech is a fair excuse for "every millisecond matters" without overclaiming. Even if your day job is a slower-cadence app (like ours at Purple), there are always parts of the product where speed matters — login, dashboards, mutations, anything the user is waiting for. This dashboard is dense enough to demonstrate every pattern we'll discuss but small enough to fit on one screen and one slot.

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
> **Embedded clip — `step-1.mov`** · cold reload under Slow 4G + 6× CPU. Numbers visible in the HUD overlay:
> · LCP — slow paint
> · JS shipped — large bundle
> · Time-to-trade — ~600 ms (server confirms before UI moves)

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

**Visual:** play `step-1.mov` (~10–15 s) inline. Annotate slow HUD rows in red post-capture if Canva permits, or rely on the natural HUD reading.

**Demo cue:** clip plays automatically; narrate over it. **Fly through this fast** — let the audience feel the slowness, then move on.

**Capture notes (record at home):**
> `pnpm demo:1:prod` → DevTools throttled (Slow 4G + 6× CPU) → cold hard reload → QuickTime screen recording → trim to 10–15 s → export `step-1.mov`. HUD must be visible.

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
> **Embedded clip — `step-2.mov`** · cold reload, same throttling. The reveal is the lesson:
> · Static shell paints first — LCP collapses vs step 1
> · Skeletons → real content as panels stream in
> · JS shipped barely moves yet — chart canvas is still client

**Code (before / after, compact):**
```tsx
// before — step-1                    // after — step-2
'use client'                           // (no directive — server)
export function NewsPanel() {          export function NewsPanel() {
  const [items, setItems] = …            return <ul>{news.map(/* … */)}</ul>
  useEffect(/* fetch */, [])           }
}
```

**Visual:** play `step-2.mov` (~10–15 s) inline. Optional: a small two-column diagram alongside — client-fetch waterfall (left) vs streaming with static shell + per-panel arrival (right) — for the audience to anchor what they're watching.

**Demo cue:** clip plays automatically; point at the moment skeletons resolve into real panels. **Fly through fast** — that single transition is the whole lesson.

**Capture notes (record at home):**
> `pnpm demo:2:prod` → same throttling → cold hard reload → record the full reveal (shell → skeletons → arrived content) → trim to 10–15 s → export `step-2.mov`.

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
> **Embedded clip — `step-3.mov`** · 2–3 Place BUY clicks. Numbers visible in the HUD overlay:
> · Time-to-trade: ~600 ms → ~0 ms (the headline number)
> · INP improves (click response within microtask boundary)
> · LCP / JS bytes: roughly unchanged — this step is interaction, not paint

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

**Visual:** play `step-3.mov` (~10–15 s) inline. Optional: a small 3-frame storyboard alongside — click → "(sending…)" pending row → 600 ms later, solid row — to anchor what the clip is showing.

**Demo cue:** clip plays automatically. **Fly through fast** — the visible feedback is the lesson; the moment the optimistic row appears is the headline beat.

**Capture notes (record at home):**
> `pnpm demo:3:prod` → throttle + cold reload, wait for page to settle → click Place BUY 2–3× with ~1–2 s gaps → trim to 10–15 s starting from just before the first click → export `step-3.mov`.

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
> **Embedded clip — `step-4.mov`** + **DevTools Coverage diff (`coverage-3-vs-4.png`)**:
> · JS shipped drops vs step 3 — the Coverage screenshot is the headline visual
> · LCP / TTFB roughly unchanged (already optimized in step 2)
> · Hydration time: only islands hydrate, not the whole tree

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

**Visual:** tree diagram — layout (server) → page (server) → recent-trades (server) → live tail (client). Highlight only the leaf as client. Inset: `coverage-3-vs-4.png` — DevTools Coverage screenshot showing chunks dropped between step 3 and step 4 (the static evidence). Optional: `step-4.mov` plays alongside if there's room.

**Demo cue:** point at the Coverage inset — chunks-dropped count is the take-home. The clip is supplementary.

**Capture notes (record at home):**
> 1. `pnpm demo:3:prod` → DevTools → Coverage tab → Start instrumenting → reload → screenshot the JS bytes total. Save as left half of `coverage-3-vs-4.png`.
> 2. `pnpm demo:4:prod` → same → screenshot. Save as right half.
> 3. Compose side-by-side in any image editor (or two adjacent slide images).
> 4. Optional: also record `step-4.mov` (cold reload, ~10 s) showing the dashboard painting with smaller bundle.

**Presenter notes:**
> Wrapping `<section>` and the initial 12 trades render on the server — already-painted HTML. Only the live subscription is client. Smallest possible client surface. Lightweight-charts dominates this specific bundle, so the delta is modest here; the pattern compounds across structural panels in real apps.

---

## Slide 12 — Summary of all measurements (speed ladder)

**Footer:** `PURPLE TECHNOLOGY · 12 · React Brno #1`

**Title:**
> Summary — what each step actually moved

**Body (table):**
> | Step | Change | What moves | Reference numbers ¹ |
> |---|---|---|---|
> | 1 → 2 | Suspense + streaming | LCP / secondary-content visible | **~4.4 s → ~1.28 s** |
> | 2 → 3 | `useOptimistic` + Server Action | Time-to-trade | **~600 ms → ~0 ms** (visible in `step-3.mov`) |
> | 3 → 4 | `'use client'` at the leaves | JS shipped (DevTools Coverage delta) | pattern compounds in real apps |
> | warm reload | Cached CSR vs cold RSC | LCP | **~800 ms vs ~750 ms** |
>
> _¹ Nadia Makarevich, developerway.com, Oct 2025 — Slow 4G + 6× CPU._
> _Reproducible via `docs/talk/measurements/PROTOCOL.md`. The embedded clips on steps 1–4 show the HUD updating in real time — that's the second column of evidence the audience already saw._

**Body (lessons):**
> **Honest takeaways:**
> · Streaming wins the most for slow secondary content.
> · Optimistic UI is the strongest *user-felt* win — it's not really an RSC feature, but it pairs.
> · RSC's repeat-visit margin is razor-thin without server caching (`revalidateTag`).
> · Bundle delta in step 4 is real but small in this demo — pattern matters more than kilobytes.

**Visual:** stacked horizontal bar chart per metric, one bar per step. Color rows: emerald = improvement, rose = regression. Or just the table on a clean dark background.

**Presenter notes:**
> The slide audience photographs. One column of reference numbers (Makarevich's published cross-check) plus the HUD they already saw move in the embedded clips during steps 1–4. Honest takeaways in the bottom block. Next slide is the load-bearing "do not do this" beat — keep momentum.

---

## Slide 13 — When RSC fails · the WebSocket category error

**Footer:** `PURPLE TECHNOLOGY · 13 · React Brno #1`

**Title:**
> When RSC fails — the WebSocket category error

**Subtitle:**
> One protocol mismatch you must not make

**Body:**
> RSC streams **one response per request**.
> A WebSocket is **bidirectional and long-lived**.
> Modeling the second with the first hangs Suspense **forever**.

**Code:**
```tsx
// step-5a-rsc-ws-fail / web/app/_components/OrderBookRsc.tsx
async function awaitFirstWebSocketMessage(): Promise<BookSnapshot> {
  return new Promise<BookSnapshot>(() => {
    // Intentionally never resolves — Suspense holds the fallback.
  })
}

export async function OrderBookRsc() {
  const book = await awaitFirstWebSocketMessage() // page hangs here
  return /* … */
}
```

**Visual:** play `step-13.mov` (~10 s) showing the order-book panel stuck on "awaiting first ws message…" Suspense fallback while the rest of the dashboard renders normally. Rose accent border on the failing panel. If the clip doesn't play for any reason, the screenshot fallback (`step-13-orderbook-hang.png`) carries the slide.

**Demo cue:** clip plays automatically. Hold on screen long enough for the audience to notice the order book *never resolves* — that beat is the lesson.

**Capture notes (record at home):**
> 1. `git switch -C live-5a step-5a-rsc-ws-fail`
> 2. `pnpm install --frozen-lockfile`
> 3. `pnpm --filter @purple-stack/web build && pnpm --filter @purple-stack/web start`
> 4. Reload — order book hangs forever; rest of the dashboard works
> 5. QuickTime recording, hold ~10 s on the hung state → export `step-13.mov`
> 6. Also screenshot the same frame → `step-13-orderbook-hang.png` (fallback for slide)
> 7. Switch back: `git switch -`

**Presenter notes:**
> The strongest "do not do this" beat in the talk. RSC is single-response by design; WebSockets are inherently push-shaped. Modeling the second with the first is a category error, not a bug. The fix is what we already shipped in step 4 — keep the order book as a client island that subscribes via `useEffect`, with RSC providing the initial snapshot. The never-resolving Promise on the slide is unmistakable; the clip just makes the consequence visible.

---

## Slide 14 — RSC · practical takeaway

**Footer:** `PURPLE TECHNOLOGY · 14 · React Brno #1`

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
> One slide that combines pros/cons, situational guidance, decision tree, and mental model. Photo-worthy. The key insight: most architectural arguments resolve to "is this push-shaped or pull-shaped?" — pull → server, push → client. After the WebSocket-as-RSC failure on the previous slide, this take-home is the codified guidance.

---

## Slide 15 — With AI we can optimize much faster

**Footer:** `PURPLE TECHNOLOGY · 15 · React Brno #1`

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

## Slide 16 — Resources

**Footer:** `PURPLE TECHNOLOGY · 16 · React Brno #1`

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

## Slide 17 — Q&A

**Footer:** `PURPLE TECHNOLOGY · 17 · React Brno #1`

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
> **Q: TanStack Start / Remix?** A: They have RSC too. Same model, different ergonomics. Decision tree on slide 14 still holds.
> **Q: WebSockets in production?** A: RSC fetches initial slice; client island opens the WS and prepends. Step-4 pattern; the failure on slide 13 shows what NOT to do.
> **Q: Caching?** A: `revalidateTag` / `revalidatePath`. Out of scope of this talk; biggest production-RSC adoption concern. Without it, RSC's repeat-visit margin disappears.
> **Q: Bundle didn't drop much in step-4 — why?** A: lightweight-charts dominates. Real apps with more structural panels see compounding savings.
> **Q: How does `useOptimistic` actually revert?** A: Throw → base state doesn't update → displayed state reverts to base.
> **Q: Express / Fastify backends?** A: RSC needs a runtime that understands the protocol — Next.js, Waku, Parcel-RSC. Not Express-compatible by design.
> **Q: When NOT to use RSC?** A: Real-time visualizations / chat / collab / games / any high-frequency push → stay SPA + selective islands. Slide 13 covered the WebSocket failure mode; tick-rate stress is the same shape (high-frequency push isn't RSC's natural form).
> **Q: Did you really build this in 3 days?** A: Yes — with an AI pair. The codebase is open; clone and reproduce.
> **Q: How does this perform on warm reloads vs a well-cached SPA?** A: Without `revalidateTag`, CSR cached can match or beat RSC. Makarevich measured 800 ms CSR vs 750 ms RSC + Suspense; that gap inverts without server caching.

---

## Asset checklist (capture before stage)

### Embedded clips (replace all live demos)

- [ ] **`step-1.mov`** (~10–15 s) · cold reload throttled, slow paint, HUD visible · slide 6
- [ ] **`step-2.mov`** (~10–15 s) · static shell → skeletons → arrived panels (the streaming reveal) · slide 7
- [ ] **`step-3.mov`** (~10–15 s) · 2–3 Place BUY clicks, pending row appears instantly, HUD shows ~0 ms time-to-trade · slide 8
- [ ] **`step-4.mov`** (~10 s, optional) · cold reload showing dashboard painting with smaller bundle · slide 11
- [ ] **`step-13.mov`** (~10 s) · order book stuck on Suspense fallback while rest renders normally · slide 13

Capture method: macOS QuickTime → `File → New Screen Recording` → select Chrome window. Trim with `Cmd+T`. Drop into Canva (Canva supports inline `.mov` playback).

### Static images

- [ ] **Hero screenshot** — dashboard at step-3 with HUD, dark theme · slides 1, 17
- [ ] **Clean dashboard screenshot** — full-bleed, no overlays · slide 3
- [ ] **HUD close-up** — bottom-right corner cropped, magnified · slide 5
- [ ] **RSC concept timeline diagram** — PHP/Rails → SPA → React 18 SSR → React 19 RSC · slide 9
- [ ] **`coverage-3-vs-4.png`** — DevTools Coverage panel side-by-side (step 3 vs step 4) showing chunks dropped · slide 11 (headline visual)
- [ ] **Tree diagram** — layout (server) → page (server) → recent-trades (server) → live tail (client) · slide 11 inset
- [ ] **Speed-ladder table render** — clean dark-theme version of slide 12 table · slide 12
- [ ] **`step-13-orderbook-hang.png`** — Suspense fallback "awaiting first ws message…" with rose border (clip fallback) · slide 13
- [ ] **Commit graph** — 5 commits across 3 days, AI-assisted · slide 15
- [ ] **QR codes** — repo + Purple Technology · slides 16, 17
  - `qrencode -o repo.png 'https://github.com/davidchocholaty/react-rsc'`
  - `qrencode -o purple.png 'https://purple-technology.com'`

---

## Time budget (20-min slot)

| Block | Slides | Approx |
|---|---|---|
| Open + framing | 1–2 | 1 min |
| Demo intro + roadmap + metrics | 3–5 | 2 min |
| Steps 1–3 fast walkthrough (with values) | 6–8 | 3.5 min |
| RSC concept + comparison | 9–10 | 1.5 min |
| Step 4 RSC (with values) | 11 | 1.5 min |
| Speed-ladder summary | 12 | 1.5 min |
| WebSocket-as-RSC failure (the big "no") | 13 | 1.5 min |
| Practical takeaway (pros/cons + decision tree) | 14 | 2 min |
| AI accelerator | 15 | 1 min |
| Resources | 16 | 0.5 min |
| Q&A | 17 | ~3 min |

≈ 17 min content + 3 min Q&A = 20 min. **Never cut slides 12 (speed ladder) or 13 (WS failure)** — these are the load-bearing beats. **Slides 6–8 are deliberately fast** — read the numbers, point at the win, move on.

---

## Measurement workflow (embedded clips + reference numbers)

The deck no longer commits per-step captured numbers, and there are no live demos on stage. Two sources of evidence carry the talk:

1. **Embedded clips on slides 6, 7, 8, 11, 13.** Each clip shows the HUD updating in real time during a real cold reload (or click sequence) under Slow 4G + 6× CPU throttling. The audience reads the numbers off the HUD overlay in the recording. Capture method per slide is in each slide's "Capture notes" block.
2. **Reference numbers on slide 12.** Makarevich's published cross-check (developerway.com, Oct 2025) provides the cross-codebase generalization for LCP and warm-reload comparisons.

`docs/talk/measurements/PROTOCOL.md`, `measurements.json`, and `summarize.mjs` remain in the repo for anyone who wants to reproduce the numerical protocol independently — but **populating `measurements.json` is not required to ship the talk**. If you do capture during rehearsal, the workflow is: production build via `pnpm demo:N:prod`, DevTools console `copy(JSON.stringify(__hudStore.getSnapshot(), null, 2))`, paste into the matching `runs[]` slot, then `node docs/talk/measurements/summarize.mjs`.

Clip capture (one-shot, ~30 min total at home): `pnpm demo:N:prod` per step under throttled DevTools → QuickTime screen recording → trim → drop into Canva. Per-slide capture notes are inline on slides 6, 7, 8, 11, 13.

---

## Acknowledge openly on stage

These stay honest framings — **say them, don't put them on the slides**. Slides land the wins; voice carries the integrity.

1. **Step-1 baseline is artificially slow** — `await import('@/mocks/news.json')` in `useEffect` is theatrical, designed to make the lesson read at small-app scale.
2. **Time-to-trade ≈ 0 ms is partly tautological** — microtask boundary by construction; visual feedback is the real lesson.
3. **Bundle delta in step-4 is small here** — lightweight-charts is the heavy leaf; pattern > kilobytes.
4. **Step-5 sharp edges (cached CSR vs cold RSC, tick-rate stress) cut for time** — covered as Q&A talking points and the speed-ladder summary row. The WebSocket-as-RSC failure (slide 13) is the only step-5 beat that survived as a dedicated slide because it's the strongest content.
5. **AI-assisted ≠ AI-written** — agents drafted, but every architectural decision was deliberate, every commit reviewed.
6. **Speed ladder uses one cross-codebase reference column** (Makarevich) plus the HUD numbers the audience saw move in the embedded clips on steps 1–4 — no pre-captured numbers from this codebase committed in the deck. Clarify aloud if asked.
7. **WS-as-RSC failure is simulated** — `new Promise<BookSnapshot>(() => {})` — but the lesson is structural; a real WebSocket has the same failure shape because RSC's wire protocol is single-response.
