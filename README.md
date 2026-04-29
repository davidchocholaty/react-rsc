# RSC Trading Dashboard

A demo for the React Brno talk **"Streaming the Future: Building High-Performance Financial UIs with RSC"** — a fintech trading dashboard built with Next.js 15.5 App Router, progressively transformed across five tagged commits to teach where React Server Components fit and where they don't.

The app renders five panels mapped to four architectural archetypes — client island (price chart), client + WebSocket-style (order book), optimistic UI (order ticket), RSC server-fetch (news), and RSC streamed via Suspense (recent trades). An always-visible HUD overlay reports live performance metrics (LCP, TTFB, JS bytes shipped, hydration time, time-to-trade) so the audience can see the numbers move at every progression step.

## Presentation

The slide deck is checked into the repo at [`docs/react_brno.pdf`](docs/react_brno.pdf).

## Tags

| Tag | Architectural step | What changes | Hero metric |
|---|---|---|---|
| `step-1-naive-csr` | Naive client-side rendering | Every panel is `'use client'`; data fetched in `useEffect` after mount; layout is also `'use client'`; no Suspense; no optimistic. | Establishes slow / heavy baseline. |
| `step-2-suspense-streaming` | Suspense + streaming | Layout returns to RSC; metadata exports come back; news + recent-trades become async server components wrapped in independent `<Suspense>` boundaries. Static shell paints immediately, slow panels stream in. | Secondary content LCP drops dramatically. |
| `step-3-optimistic-ui` | `useOptimistic` + Server Action | Order ticket adopts `useOptimistic` paired with the `placeTrade` Server Action; on click, the optimistic state appears within a microtask. | Time-to-trade collapses from ~600 ms to ≈0 ms. |
| `step-4-rsc-boundary` | Push `'use client'` to leaves | `RecentTrades` splits into an RSC initial slice plus a tiny `TradesLiveTail` client island; only chart, order book, order ticket, HUD, and the live tail remain client components. | Smallest interactive surface — the architectural lesson is the take-away. |
| `step-5-honest-limits` | Three failure-mode demos | (a) Sibling tag `step-5a-rsc-ws-fail` ships a deliberately broken WebSocket-as-RSC `OrderBookRsc` that hangs forever on Suspense. (b) `?csr=1` flips news + recent-trades to client-fetched variants — warm reload beats RSC. (c) `?tick=N` cranks the mock feed (`?tick=5` with three tabs is the rehearsed stress demo). | Each demo establishes a *where RSC does not fit* boundary. |
| `step-5a-rsc-ws-fail` | Failed attempt (sibling tag) | Branches off `step-4-rsc-boundary`; replaces the working OrderBook with an async server component awaiting "first WebSocket message". The Suspense boundary holds the fallback indefinitely — the structural lesson the talk closes on. | None — the failure is the point. |

## Run a tag

The repo ships with `pnpm demo:1` … `pnpm demo:5` scripts that switch onto a fresh `live-N` branch from the corresponding tag, install with `--frozen-lockfile`, and start `next dev`. Re-running mid-rehearsal is idempotent (`git switch -C` overwrites the prior `live-N` branch).

```bash
pnpm install
pnpm demo:1   # naive CSR baseline
pnpm demo:2   # Suspense + streaming
pnpm demo:3   # useOptimistic + Server Action
pnpm demo:4   # RSC boundary push
pnpm demo:5   # honest-limits closer
```

For the WebSocket-as-RSC failure demo, switch directly to the sibling tag:

```bash
git switch -C live-5a step-5a-rsc-ws-fail
pnpm install --frozen-lockfile
pnpm --filter @purple-stack/web dev
```

`bash scripts/demo.sh` prints a one-line summary of every tag, useful as a stage cheat-sheet.

## Performance HUD

The HUD overlay surfaces LCP, TTFB, FCP, INP, CLS, JS bytes shipped, hydration time, chart-leaf hydration, and time-to-trade. It is gated behind `NEXT_PUBLIC_HUD=1`:

```bash
echo 'NEXT_PUBLIC_HUD=1' >> web/.env.local
```

The HUD is rendered as a single `'use client'` overlay reading from a `useSyncExternalStore` singleton, so it never prop-drills perf data through the RSC tree. Web Vitals come from `next/web-vitals` (`useReportWebVitals`); custom marks (`hud:hydration:*`, `hud:chart-hydration:*`, `hud:trade:*`) are recorded with `performance.mark` / `performance.measure`.

## Stack

- **Framework**: Next.js 15.5 (App Router, RSC, Server Actions). 16.x is the post-talk upgrade target.
- **Charting**: hand-rolled `lightweight-charts` 5.2 wrapper using a single StrictMode-safe `useLayoutEffect`.
- **Styling**: Tailwind CSS v4 via `@tailwindcss/postcss`. Zero-runtime, RSC-safe.
- **State**: `useSyncExternalStore` over small singletons. No Zustand or Redux — the demo's lessons stay in the framework.
- **Data**: deterministic in-process mock with a Mulberry32 PRNG; subscription API is shaped like a WebSocket so the U9 honest-limits beat is structural rather than theatrical.
- **Validation**: Zod at the Server Action boundary.
- **Tooling**: pnpm catalog, Biome, Vitest + jsdom + Testing Library, mise (Node 22.19.0, pnpm 10.18.2).

## Development

```bash
mise install                                # install Node + pnpm versions
pnpm install
pnpm --filter @purple-stack/web dev         # next dev
pnpm test                                   # vitest across workspaces
pnpm typecheck
pnpm lint
mise run check                              # lint:fix + typecheck + test in parallel
```

## Repository layout

```
react-rsc/
├── docs/
│   ├── brainstorms/                 # talk research + requirements
│   ├── plans/                       # this demo's executable plan
│   └── react_brno.pdf               # talk slide deck
├── packages/                        # shared workspace packages (kept from Purple Stack)
├── scripts/
│   ├── aws_sso.sh                   # SST helper (only useful when deploying)
│   ├── set_sst_stage.sh
│   └── demo.sh                      # prints tag-by-tag progression
├── sst.config.ts                    # opt-in deploy target (sst.aws.Nextjs)
└── web/                             # Next.js 15 App Router app
    ├── app/
    │   ├── _actions/placeTrade.ts          # Server Action (Zod-validated, throws on failure)
    │   ├── _components/                    # the five panels + the HUD + variants
    │   ├── layout.tsx
    │   ├── page.tsx                        # dashboard, async (reads searchParams)
    │   └── loading.tsx                     # route-level skeleton
    ├── lib/
    │   ├── perf.ts                         # mark/measure helpers, bytesShipped()
    │   ├── prng.ts                         # Mulberry32
    │   └── store.ts                        # HUD store via useSyncExternalStore
    ├── mocks/
    │   ├── feed.ts                         # WS-shaped subscribe API + tick-rate knob
    │   ├── news.json
    │   └── seed.ts                         # initial state + generateTradeHistory
    ├── styles/globals.css
    └── tests/                              # vitest + Testing Library
```

## References

- Plan: [docs/plans/2026-04-27-001-feat-rsc-trading-dashboard-demo-plan.md](docs/plans/2026-04-27-001-feat-rsc-trading-dashboard-demo-plan.md)
- Origin brainstorm: [docs/brainstorms/rsc-trading-dashboard-demo-requirements.md](docs/brainstorms/rsc-trading-dashboard-demo-requirements.md)
- Research digest: [docs/brainstorms/rsc-research-digest.md](docs/brainstorms/rsc-research-digest.md)
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js streaming guide](https://nextjs.org/docs/app/guides/streaming)
- [React `useOptimistic`](https://react.dev/reference/react/useOptimistic)
- [TradingView lightweight-charts — advanced React tutorial](https://tradingview.github.io/lightweight-charts/tutorials/react/advanced)
- [GoogleChrome/web-vitals](https://github.com/GoogleChrome/web-vitals)
- [SST `sst.aws.Nextjs`](https://sst.dev/docs/component/aws/nextjs/)

## License

MIT — see [LICENSE](LICENSE).
