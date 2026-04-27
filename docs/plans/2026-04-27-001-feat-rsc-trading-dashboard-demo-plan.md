---
title: "feat: RSC Trading Dashboard Demo"
type: feat
status: completed
date: 2026-04-27
origin: docs/brainstorms/rsc-trading-dashboard-demo-requirements.md
---

# feat: RSC Trading Dashboard Demo

## Overview

Build a Next.js 15.5 App Router fintech trading dashboard inside the existing Purple Stack v4 monorepo to serve as the on-stage demo for David's React Brno talk *"Streaming the Future: Building High-Performance Financial UIs with RSC."*

The dashboard renders five panels (price chart, order book, order ticket, news/research, recent trades) with each panel mapped to a distinct architectural archetype (client island, optimistic UI, RSC server-fetch, RSC streamed). The demo's pedagogy is delivered through five tagged commits that progressively transform a naive client-only baseline into an RSC-shaped app, with an always-visible HUD overlay surfacing live performance metrics so audience-visible numbers move at each step.

The work also covers the "honest limits" closer — a deliberate WebSocket-as-RSC failure on stage, a CSR-cached-beats-RSC reload demo, and a tick-rate stress demo that reveals server-load scaling — so the talk teaches *where RSC fits* rather than evangelizing it as a panacea.

---

## Problem Frame

David is presenting at React Brno (~20–30 min slot) on React Server Components, framed through a fintech / trading-dashboard lens. The committed abstract names three pillars: optimistic updates, Suspense + streaming, and the architectural shift toward server-first systems. Internal team review (FE Friends meetup, 2026-04-15) plus external research convergence both push the talk toward a more honest framing than the abstract suggests: a trading dashboard is partially a poor RSC fit, and that tension *is* the strongest teaching surface (see origin: `docs/brainstorms/rsc-trading-dashboard-demo-requirements.md`).

The audience is intermediate-to-advanced React developers who will compare RSC to existing solutions (SPA, classic SSR, alternative meta-frameworks). They want concrete performance numbers, library compatibility caveats, and a usable mental model for when to adopt — not a marketing pitch.

The repo this plan targets is `react-rsc`, a fresh clone of Purple Stack v4 (SST 4 + Vite + TanStack Router + tRPC + Vitest + Biome + mise + pnpm catalog). The Vite SPA scaffolding and the `domains/transaction/*` example feature are demo-irrelevant and being trimmed; Purple Stack tooling is preserved.

---

## Requirements Trace

Carrying forward all 21 requirements from the origin brainstorm. Each is traced to one or more implementation units below.

**Demo application surface**

- R1. Single-symbol fintech trading dashboard, five panels, each mapped to one architectural archetype (price chart = client island via `lightweight-charts`; order book = client+ws-style; order ticket = optimistic client; news/research = RSC server-fetched from JSON fixture; recent trades = RSC streamed via Suspense).
- R2. Symbol is decorative; data layer is symbol-agnostic.
- R3. Aesthetic reads as plausible fintech without claiming domain accuracy.

**Repository setup**

- R4. Demo lives inside this repo, inheriting Purple Stack v4 tooling (mise, Biome, pnpm catalog, SST 4.3.6, TS configs, scripts).
- R5. Existing `domains/transaction/*` removed.
- R6. Existing Vite-based `web/` content removed; replaced by Next.js 15 App Router app.
- R7. `pnpm-workspace.yaml` catalog extended with Next.js, lightweight-charts, web-vitals.
- R8. Repo published publicly post-talk; each progression step is a tag; README links slides + this plan + the requirements doc.

**Build progression — five tagged commits**

- R9. `step-1-naive-csr` — all components `'use client'`; data fetched on mount; no Suspense; no optimistic.
- R10. `step-2-suspense-streaming` — Suspense boundaries on slow-data panels; static shell renders immediately.
- R11. `step-3-optimistic-ui` — order ticket adopts `useOptimistic`; trade submission instant on the client.
- R12. `step-4-rsc-boundary` — `'use client'` pushed to leaves; news/research and recent trades become true RSC.
- R13. `step-5-honest-limits` — three failure modes demonstrated: WebSocket-as-RSC failure (with `step-5a-rsc-ws-fail` tag), CSR cached beats RSC, server load under tick-rate stress.

**Performance instrumentation**

- R14. Always-visible in-app HUD: LCP, TTFB, JS bytes shipped, Hydration time, Time-to-trade.
- R15. HUD updates live; persists across runs.
- R16. Pre-baked Lighthouse before/after slides for steps 1→2, 2→3, 3→4, 4→5.

**Data layer**

- R17. Deterministic in-process mock with tick-rate knob (100ms / 50ms / 10ms / stress).
- R18. Tick-rate exposed as UI control (or query param) for stage demo.
- R19. Symbol-agnostic; symbol drives only display labels.

**Talk delivery**

- R20. Demo runs locally on stage; SST infra preserved for optional post-talk deploy.
- R21. Live HUD shows our own numbers; external research (Makarevich's table) referenced on slides for cross-comparison.

---

## Scope Boundaries

- Out: real broker integration, real market data feeds, real authentication.
- Out: multi-user / multi-account simulation. Single-user only.
- Out: live deployment as part of demo execution. Local on stage; SST deploy is optional.
- Out: cross-framework comparison built into the demo (TanStack Start, Remix, SPA-only stay on slides — demo is single-stack Next.js for narrative clarity).
- Out: company-specific content from MyAxiory or Walletory.
- Out: testing strategy for the demo itself (no 80% coverage target). The global testing rules apply to the *production-style code we model* — utility units (mock data layer, HUD timing) get real test scenarios; panel/integration units rely on demo-runtime verification.

### Deferred to Follow-Up Work

- **Lighthouse capture as a CI script** is deferred — only the CI automation that re-captures on each push is deferred. R16 itself remains in-scope: David performs manual `next build && next start && Lighthouse` runs at each tag and embeds the PNGs in slides before the talk.
- **`docs/solutions/` learning capture** (RSC Suspense placement, RSC leaf pattern, web-vitals HUD architecture, deterministic mock data) — recommended by ce-learnings-researcher; defer to within a week post-talk while context is fresh. Not part of U10's commit.
- **SST deployment validation** against Next.js 15.5 — exercised only if the user opts to publish a public URL post-talk; otherwise local-only.

---

## Context & Research

### Relevant Code and Patterns

The existing Purple Stack v4 scaffolding informs every infrastructure decision below. Key references the implementer must internalize before touching anything:

- **Cursor rules** at `.cursor/rules/code-quality.mdc` and `.cursor/rules/dependency-management.mdc` — both apply unchanged. The catalog rule is mandatory: every dep used in 2+ packages goes in the catalog. The code-quality rule mandates `mise run check` (`lint:fix` + `typecheck` + `test`) after any non-config change.
- `.cursor/rules/domain-integration.mdc` — to be deleted/rewritten (assumes the vertical-slice domain pattern that's being trimmed).
- **Workspace catalog** at `pnpm-workspace.yaml` already pins `react@19.2.0`, `react-dom@19.2.0`, `@types/react@19.2.2`, `typescript@5.9.3`, `zod@4.1.12`, `sst@4.3.6`. New entries needed: `next@15.5.x`, `lightweight-charts@5.2.x`, `web-vitals@5.2.x`, plus Tailwind CSS toolchain (`tailwindcss@4.x`, `@tailwindcss/postcss`, `postcss`).
- **Biome config** at `biome.json` — tab indent width 2, single quotes, double quotes for JSX attrs, `trailingCommas: "none"`, `semicolons: "asNeeded"`, `arrowParentheses: "always"`. Lint rules curated (not `recommended`): hooks-at-top-level error, no-unused error, no-explicit-any warn. `routeTree.gen.ts` override becomes obsolete after Next.js replaces TanStack Router — leave it (harmless) or remove it.
- **TS config style** at `packages/tsconfig/base.json` — strict, composite project references, `module: "ESNext"`, `moduleResolution: "Bundler"`. Next.js generates its own `tsconfig.json` for `web/`; reconcile by extending `@purple-stack/tsconfig/base.json` from the generated config where compatible, or accept Next.js's defaults if friction is high.
- **`mise.toml`** task aliases (`lt`/`ltf`/`tc`/`tst`/`chk`) and the `_.source = 'scripts/set_sst_stage.sh'` env hook stay. The `trpc:panel` task is removed when `packages/trpc-api` is deleted.
- **Path aliases — distinguish shared from app-local**: the existing shared packages (`packages/core`, `packages/sst-extensions`, `packages/tsconfig`) and the root `tsconfig.json` use no path aliases — workspace packages import via subpath exports declared in each `package.json`'s `"exports"` map; intra-package imports stay relative. Next.js's default `paths: { "@/*": [...] }` IS idiomatic for App Router intra-app imports (`@/app/_components/...`, `@/lib/...`, `@/mocks/...`) and is acceptable inside `web/tsconfig.json` only. The principle: shared code stays portable (no alias coupling); app-local code follows Next.js conventions. Do not propagate `@/` into shared packages or the root.
- **Workspace package naming** — `@purple-stack/<name>`. The Next.js app keeps `@purple-stack/web` to inherit the existing workspace member identity.
- **CSS architecture** in the existing repo is plain CSS files, BEM kebab-case (`deposit-form__label`). Tailwind v4 will be introduced for the demo (decision rationale in Key Technical Decisions); existing pattern is documented for reference but does not constrain.
- **No AGENTS.md or CLAUDE.md** files exist. Only `.cursor/rules/*.mdc` carries agentic guidance.
- **Vitest only in `packages/core`** — `pnpm test` fans out to all workspaces but only `packages/core` defines a test script. The new `web/` package may add Vitest for utility tests (mock data, HUD timing) but does not need a full UI test suite (per scope boundary).

Files the implementer will repeatedly touch:

- `web/` (entire directory rewritten as Next.js 15 App Router app)
- `pnpm-workspace.yaml` (catalog extension)
- `package.json` (root) — drop `@purple-stack/transaction` devDep
- `tsconfig.json` (root) — drop `domains/transaction` reference, retarget `web` reference
- `sst.config.ts` — drop deposit stack import, drop `tRPC` `DevCommand`, swap `sst.aws.StaticSite` for `sst.aws.Nextjs` (or remove web entirely if not deploying)
- `infra/api.ts`, `infra/src/apiHandler.ts` — delete (transaction-coupled)
- `domains/transaction/**` — delete entirely
- `packages/core/src/deposit/**` — delete (transaction-coupled). `packages/core` itself stays as the workspace position; may be repurposed for fintech utilities if needed.
- `packages/trpc-api/**` — delete unless retained for a Server-Action-vs-tRPC slide aside (Key Decision below: delete).
- `packages/sst-extensions`, `packages/tsconfig` — keep.

### Institutional Learnings

`docs/solutions/` does not exist. No prior captured learnings to align with or contradict. The agent confirmed this and recommended seeding `docs/solutions/` as captures of the build progression, Suspense placement, useOptimistic patterns, web-vitals HUD architecture, mock data architecture, and SST + Next.js deployment quirks. Capture is out of scope for this plan but worth flagging for follow-up.

### External References

Anchored references the implementer should keep open during execution:

- [Next.js 15.5 release notes](https://nextjs.org/blog/next-15-5)
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js Server Actions / Forms guide](https://nextjs.org/docs/app/guides/forms)
- [Next.js streaming guide](https://nextjs.org/docs/app/guides/streaming)
- [React `useOptimistic`](https://react.dev/reference/react/useOptimistic)
- [React 19 release notes](https://react.dev/blog/2024/12/05/react-19) — `useOptimistic` stability + `useActionState` migration
- [TradingView lightweight-charts — advanced React tutorial](https://tradingview.github.io/lightweight-charts/tutorials/react/advanced)
- [GoogleChrome/web-vitals — README + CHANGELOG](https://github.com/GoogleChrome/web-vitals)
- [SST `sst.aws.Nextjs` component docs](https://sst.dev/docs/component/aws/nextjs/)
- [OpenNext compatibility / common issues](https://opennext.js.org/aws/compatibility)
- [pnpm catalogs](https://pnpm.io/catalogs)
- Companion: `docs/brainstorms/rsc-research-digest.md` — RSC perf benchmarks (Makarevich), Comeau's mental model, Dan Abramov's "React from Another Dimension" RemixConf 2023.

Watch items (research found these unresolved or evolving):
- React issue [#31967](https://github.com/facebook/react/issues/31967) (`useOptimistic` spurious rollback) and [#31595](https://github.com/facebook/react/issues/31595) (request for opt-out). Both unresolved as of April 2026. Affects U7 design.
- Next.js App Router does not emit the legacy `Next.js-hydration` web-vitals metric (Pages Router only). Hydration measurement is a hand-rolled `performance.mark` / `performance.measure`. Affects U4.
- `sst.aws.Nextjs` + Next.js 15.5 streaming + Server Actions through CloudFront is reported working but with known caveats (`OPEN_NEXT_FORCE_NON_EMPTY_RESPONSE=true` workaround for empty-body responses). Affects R20 deferred deploy.

---

## Key Technical Decisions

- **Next.js 15.5.x latest patch** over Next.js 16.x. Rationale: SST 4.3.6's pinned OpenNext is best-tested with 15.x; 16.x introduces async `params`/`searchParams` and Cache Components which are not load-bearing for this demo and would risk regression on stage. 16 is the post-talk upgrade target, not today's pin.
- **Hand-rolled `lightweight-charts` integration** over community wrappers. Rationale: official wrappers are stale or React-19-untested; the hand-roll is ~30–40 lines and the imperative-canvas-in-React pattern is itself useful talk material.
- **Mulberry32 PRNG, hand-rolled, zero deps** for the mock data layer. Rationale: 12 lines, deterministic given a seed, sufficient for non-cryptographic procedural data; avoids pulling `seedrandom` for a single use.
- **Server Actions over Route Handlers** for the placeTrade flow. Rationale: idiomatic for the optimistic UI pattern in 2026, type-safe end-to-end, native `<form action={fn}>` integration with `useOptimistic`. Route Handlers reserved only if a non-React client appears (none do here).
- **Tailwind v4** over plain CSS Modules or styled-components. Rationale: zero-runtime so RSC-safe; canonical fintech-aesthetic vocabulary that audience will read as polished without reading the markup; styled-components <6.3 breaks RSC (compatibility footgun). v4 has minimal config (`@import "tailwindcss"` in a single CSS file). If the implementer prefers CSS Modules (zero-runtime, RSC-safe equally), swap before U5; the architecture does not depend on Tailwind specifically. **Open: confirm the implementer is comfortable; reversible.**
- **Single `<DevHud />` client component** mounted at root layout, reading from a singleton store via `useSyncExternalStore`. Rationale: avoids prop-drilling perf data through the RSC tree; isolated to one client island; gated by `process.env.NEXT_PUBLIC_HUD === '1'` so non-demo builds carry zero overhead.
- **`useReportWebVitals` from `next/web-vitals`** to capture LCP/TTFB/INP/CLS/FCP. Rationale: avoids double-registering observers (a foot-gun if both `next/web-vitals` and bare `web-vitals` are imported); Next-recommended.
- **Hydration time via `performance.mark` / `performance.measure`** at the chart-leaf boundary. Rationale: web-vitals does not expose hydration; App Router does not emit `Next.js-hydration`. Marking inside the chart's `useEffect` post-mount produces a meaningful "interactive ready for the most-painful component" signal.
- **Time-to-trade via `performance.mark`** at the click handler + at the optimistic state commit. Rationale: this is the metric that visibly drops to ~0ms in step-3 vs N ms in step-1 — it is the entire pedagogical point of the optimistic step.
- **Tag naming: `step-N-<descriptive>`** (matching the brainstorm) over `0N-<descriptive>`. Tags are annotated (`git tag -a`) so `git show step-3-optimistic-ui` carries the "what this step teaches" message. The `step-5a-rsc-ws-fail` tag is the failed-attempt branch tag from R13.
- **One package.json across all tags** — no dep changes mid-progression. All deps installed in U1/U2 are present at every later tag. Rationale: clean diffs between tags, no `pnpm install` mid-demo, audience reads the diff as the lesson.
- **Lockfile committed; Node version pinned via `mise.toml`** (already at 22.19.0). Rationale: tagged-commit demos must be reproducible six months later when David does a re-run.
- **Demo navigation scripts** (`pnpm demo:1`, `pnpm demo:2`, etc.) wrapping `git checkout step-N-... && pnpm install --frozen-lockfile && pnpm dev`. Rationale: avoids fat-fingering on stage.
- **Drop `@purple-stack/trpc-api` and `infra/api.ts`** entirely. Rationale: tRPC is not the demo's API surface; Server Actions own that. Keeping tRPC alive means maintaining a tRPC-vs-Server-Actions slide aside which inflates scope without sharpening the talk's thesis.
- **Repurpose `packages/core` as a thin fintech-utility package** (immutable price formatters, deterministic ID generation, optionally the Mulberry32 PRNG if shared between web and a future SST API). Rationale: keeps the workspace structure recognizable to David's team; `packages/core/src/deposit/*` is deleted and replaced. Alternative (delete `packages/core` entirely): rejected because its workspace position and the `@tsconfig/node22` consumption are useful inheritance.
- **CSS-in-JS, React Context Providers**: avoided in the RSC tree where possible. Tiny client-side `<HudStateProvider>` (if needed) is itself `'use client'`; server children passed via `children` prop stay on server. Pattern from research: Provider is `'use client'`, server descendants come in via `children`.
- **No state library** beyond `useSyncExternalStore` over a small singleton for HUD + mock data subscriptions. Rationale: Zustand was considered (research recommendation) but adds a dep that the talk doesn't need to teach. The custom subscriber is ~20 lines and exposes a familiar pub/sub API.
- **Mock data subscription API designed to mimic a WebSocket interface** (`subscribe(channel, cb)` / `unsubscribe(...)`). Rationale: in U9 step-5 honest-limits, the implementer can swap in a real WebSocket and demonstrate the RSC failure with identical consumer code — making the architectural failure structural, not theatrical.

---

## Open Questions

### Resolved During Planning

- **Which Next.js version?** → 15.5.x latest patch. (Rationale in Key Decisions; 16.x deferred.)
- **Charting wrapper or hand-roll?** → Hand-roll. (Avoid stale community wrappers.)
- **PRNG library or hand-roll?** → Hand-roll Mulberry32. (Zero deps.)
- **Server Action or Route Handler for placeTrade?** → Server Action. (Idiomatic for `useOptimistic`.)
- **CSS strategy?** → Tailwind v4 default; CSS Modules acceptable substitute. (Both zero-runtime, RSC-safe.)
- **State management?** → `useSyncExternalStore` over a singleton, no Zustand. (Demo-scoped; minimal deps.)
- **Hydration measurement strategy?** → `performance.mark` / `performance.measure` at the chart leaf. (App Router does not emit `Next.js-hydration`.)
- **Time-to-trade measurement?** → `performance.mark` at click + at optimistic commit. (Visibly drops in step-3.)
- **`useOptimistic` rollback for non-throwing failures?** → Server actions in error paths *throw*; clients catch and present friendly messages. The "wrong way" (return `{ ok: false }`, optimistic state stuck) is itself demoed in step 5 as an honest-limits beat. (Resolves the research-flagged ambiguity.)
- **Keep `packages/trpc-api` for a Server-Action-vs-tRPC aside?** → No. (Inflates scope; the talk's thesis is server-first, not client-API trade-offs.)
- **Tag naming convention?** → `step-N-<descriptive>` (matches brainstorm), annotated tags.
- **Single `package.json` across tags or per-tag deps?** → Single. (Clean diffs.)

### Deferred to Implementation

- [Affects U2] [Technical] Whether `web/tsconfig.json` extends `@purple-stack/tsconfig/base.json` directly or accepts Next.js's generated tsconfig with adjustments. Decide while wiring U2 — pick whichever survives `pnpm typecheck` cleanly.
- [Affects U3] [Technical] Mock data tick-rate knob exposure: query param (`?tick=10`) vs UI control vs both. Implementation choice; both are cheap.
- [Affects U4] [Technical] Whether the HUD store uses a single `useSyncExternalStore` snapshot object or one snapshot per metric. Trade-off between re-render granularity and code size; decide at first integration.
- [Affects U6, U7] [Technical] Where `loading.tsx` sits vs inline `<Suspense>` boundaries. The brainstorm specifies inline boundaries on slow-data panels; `loading.tsx` may still be appropriate for the route shell. Decide while implementing U6.
- [Affects U9] [Technical] Whether the WebSocket-as-RSC failure demo uses a real WebSocket server (e.g., `ws://localhost:`) or simulates the failure mode with a long-lived async generator. Real WS makes the failure structural; simulation is more reproducible. Lean toward simulation backed by a small in-process WS server (`ws` package) for stage reliability — confirm at U9.
- [Affects R20] [Needs research] `sst.aws.Nextjs` + Next.js 15.5 streaming + Server Actions through CloudFront — read SST's installed `DEFAULT_OPEN_NEXT_VERSION` constant after install; confirm streaming and server-action POSTs work end-to-end before announcing a public deploy. Not blocking the local-only demo.
- [Affects R16] [Technical] Lighthouse capture procedure — manual capture for v1; CI script deferred to follow-up work.
- [Affects U10] [Technical] Whether to seed `docs/solutions/` with captured learnings during this build (recommended by ce-learnings-researcher) or after. Defer the *capturing* to post-talk to avoid distracting from the demo build itself; flag for follow-up.

### From Document Review (2026-04-27)

Strategic findings from the multi-persona doc review that need David's judgment. Each is anchored ≥75 confidence; concrete bug fixes from the same review have already been applied to the plan above.

- [Affects U5–U9] [Talk delivery] **Time-budget per beat is unallocated.** Five progression steps + three step-5 demos in 20–30 min, no minutes-per-beat assignment. Most-likely-cut beat is step-5 (the brainstorm names as the strongest content). Resolution path: rehearse with stopwatch before tag-1 lands; trim a beat if the budget overshoots.
- [Affects U5, R21] [Strategic] **Step-1 baseline is artificially slow.** `await import('@/mocks/news.json')` in `useEffect` is theatrical, and "Makarevich's 4.4s → 1.28s archetype" is cited as the design *target* — both tension with R21 ("live HUD shows our own numbers, not borrowed ones"). Decide: accept proportionally smaller deltas without the theatrical slowdown, or explicitly frame the slowdown on a slide ("baseline made deliberately slow so the lesson reads at small-app scale").
- [Affects R1, U5–U8] [Scope] **Five panels = four archetypes may be too dense for the slot.** Price chart and order book both demonstrate the "client island" archetype; one is teaching-redundant. Decide: drop the order book; consolidate so audience tracks fewer panels; or accept the cognitive load.
- [Affects R13.3, U9] [Architecture] **Step-5 (c) tick-rate stress doesn't drive server load.** The mock feed is a per-tab client-side `setInterval`; cranking ticks loads the *client*, not the server. The lesson "RSC re-renders pile up on every request" requires server work proportional to tick rate, which the architecture does not produce. Decide: re-architect to drive load via server-cacheable RSC payload refetches (`revalidateTag` pings); rewrite the lesson to match what the architecture demonstrates; or drop step-5 (c).
- [Affects U7, R14] [Metric design] **Time-to-trade ≈0ms is tautological.** The metric measures between a sync click handler and a sync `useOptimistic` updater (microtask boundary). It drops to ~0ms by construction, independent of network. Decide: swap to a metric that varies (time from click to first paint of optimistic state, via `requestAnimationFrame`), or drop the metric and demonstrate optimistic UI through visible behavior alone.
- [Affects R14, U4] [UX/stage] **HUD bottom-right `text-xs` unreadable on conference projector.** Audience past row 3 cannot read the numbers the demo is built around. Decide: move HUD to a top-bar with `text-2xl`, replace with per-panel inline metric callouts, or accept the limitation and read numbers verbally during walkthrough.
- [Affects R11, U7] [UX] **Optimistic UI rollback visual states unspecified.** Plan describes only the "pending → committed" path; rollback (entry disappears) and the step-5 "stuck-state" demo (entry never resolves) lack visual specification. Decide the four states explicitly: pending, success, rollback, stuck.
- [Affects U7] [Pedagogy / scope] **Caching/revalidation is absent from every unit.** `revalidatePath`/`revalidateTag` mentioned once in System-Wide Impact but not taught. For an intermediate-to-advanced audience comparing meta-frameworks, this is arguably the #1 production-RSC adoption concern. Decide: fold a brief revalidation beat into U7 (Server Action + revalidate); cover it only on slides without a code beat; or accept as deliberate omission and address in Q&A.
- [Affects U3, U4] [Architecture / simplicity] **HUD store and mock subscription API may be speculative generality.** Singleton store with subscribe/getSnapshot for one consumer (`<DevHud/>`); WebSocket-shaped channel API for a swap-in (real WS) that never lands in any committed tag. Decide: simplify to `useState` in DevHud + direct callback registration (`onPrice(cb)`) on the mock; or keep the abstractions because the WebSocket-shaped surface is itself a teaching artifact.
- [Affects U9] [Strategic / pedagogy] **WebSocket-as-RSC failure: simulated vs structural is unresolved.** Open Question leans toward simulation for stage reliability, but an attentive audience that suspects the failure is staged loses the visceral teaching impact (the linchpin of the honest-limits closer). Decide: commit to simulation rehearsed 5x with the trade-off acknowledged on slide; or commit to real `ws://localhost` with an escape-hatch slide for stage failure of the failure.
- [Affects R3, U2, U5] [Scope] **Tailwind v4 reversibility deadline unspecified.** By U2 (postcss config + globals.css + first utility classes), 8 of 10 units depend on Tailwind; "swap to CSS Modules if friction" has no decision gate. Decide: the swap window closes at end of U2 (first Tailwind classes in `<DevHud/>`). Lock the choice before U2 commits.
- [Affects R14, R15] [Verification] **HUD observer-effect verification has no falsification threshold.** "Verify Lighthouse numbers don't change meaningfully" lacks a numeric criterion. Decide the threshold (e.g., `<5%` delta on LCP between HUD-on and HUD-off); if exceeded, redesign before the talk rather than ship a HUD that distorts the metrics it reports.
- [Affects R8, U10] [Reliability] **Demo reproducibility 1y+ is not guaranteed by current setup.** `pnpm install --frozen-lockfile` still hits the registry; tarball yanks, Node 22 EOL (April 2027), or Next.js 15.5 patch unpublishes can break the post-talk repo. Decide: store offline `pnpm pack` artifacts in-repo for the five tags, or document expected shelf-life ("guaranteed reproducible through Q4 2026; afterward see `deps/` cache").

---

## Output Structure

The plan creates a new directory hierarchy under `web/` (replacing the existing Vite scaffold) and adds a small `mocks/` and `lib/` underneath. SST infra and shared packages survive largely untouched; the existing `domains/` and `packages/core/src/deposit/*` are deleted. Tree below shows the expected output shape after U1–U10 land.

```
react-rsc/
├── docs/
│   ├── brainstorms/
│   │   ├── rsc-research-digest.md             (existing)
│   │   └── rsc-trading-dashboard-demo-requirements.md  (existing)
│   └── plans/
│       └── 2026-04-27-001-feat-rsc-trading-dashboard-demo-plan.md  (this file)
├── packages/
│   ├── core/                  (kept; src/deposit/* deleted; may host shared utilities)
│   ├── sst-extensions/        (kept as-is)
│   └── tsconfig/              (kept as-is)
├── web/                       (rewritten as Next.js 15 App Router app)
│   ├── app/
│   │   ├── layout.tsx         (root layout — RSC; mounts <DevHud/>)
│   │   ├── page.tsx           (dashboard — RSC layout grid)
│   │   ├── loading.tsx        (route shell skeleton)
│   │   ├── error.tsx          (error boundary)
│   │   └── _components/
│   │       ├── PriceChart.tsx       ('use client' — lightweight-charts wrapper)
│   │       ├── OrderBook.tsx        ('use client' — subscribes to mock stream)
│   │       ├── OrderTicket.tsx      ('use client' — useOptimistic + form)
│   │       ├── NewsPanel.tsx        (RSC — server-fetched from JSON fixture)
│   │       ├── RecentTrades.tsx     (RSC — async, wrapped in <Suspense>)
│   │       └── DevHud.tsx           ('use client' — perf overlay)
│   ├── app/_actions/
│   │   └── placeTrade.ts            ('use server' — Server Action)
│   ├── lib/
│   │   ├── perf.ts                  (mark/measure helpers, web-vitals piping)
│   │   ├── prng.ts                  (Mulberry32)
│   │   └── store.ts                 (HUD store via useSyncExternalStore)
│   ├── mocks/
│   │   ├── feed.ts                  (deterministic mock + tick-rate knob + ws-shaped subscribe API)
│   │   ├── news.json                (pseudo-analyst notes fixture)
│   │   └── seed.ts                  (initial state generator)
│   ├── public/                      (favicon, minimal assets)
│   ├── styles/
│   │   └── globals.css              (Tailwind imports + few utility classes)
│   ├── tests/                       (Vitest specs for lib/ and mocks/ utilities only)
│   ├── next.config.mjs
│   ├── postcss.config.mjs           (Tailwind v4)
│   ├── tsconfig.json
│   └── package.json
├── infra/                           (DELETED — transaction-coupled)
├── domains/                         (DELETED entirely)
├── scripts/
│   ├── aws_sso.sh                   (kept, useful only if deploying)
│   ├── set_sst_stage.sh             (kept)
│   └── demo.sh                      (NEW — prints tag-by-tag progression for stage)
├── biome.json                       (kept; routeTree.gen.ts override harmless)
├── mise.toml                        (kept; trpc:panel task removed)
├── package.json                     (root; @purple-stack/transaction devDep removed)
├── pnpm-workspace.yaml              (catalog extended)
├── README.md                        (REWRITTEN — talk + tags map)
├── sst.config.ts                    (deposit stack import removed; tRPC DevCommand removed; sst.aws.StaticSite swapped for sst.aws.Nextjs or web removed)
└── tsconfig.json                    (root; domains/transaction reference removed)
```

This tree is a scope declaration, not a constraint — the implementing agent may adjust placement (e.g., promote `web/lib/perf.ts` to `packages/core/src/perf` if shared) when implementation reveals a better fit.

---

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

The build progression is the heart of the demo. Each tag is a complete, runnable state; the diff between consecutive tags is the lesson. Hero metrics map step-by-step:

| Step | Tag | Architectural change | Hero metric on HUD | Expected direction |
|---|---|---|---|---|
| 1 | `step-1-naive-csr` | All panels `'use client'`; data fetched in `useEffect` after mount; no Suspense; no optimistic | LCP, JS bytes shipped | Baseline (slow, big) |
| 2 | `step-2-suspense-streaming` | Static shell renders immediately; Suspense boundaries on slow async sections; data fetching colocated server-side for non-interactive panels | LCP (especially secondary content), interactivity gap | LCP drops dramatically (Makarevich's 4.4s → 1.28s archetype) |
| 3 | `step-3-optimistic-ui` | Order ticket adopts `useOptimistic`; `placeTrade` Server Action; trade UI updates instantly on click | Time-to-trade | Drops to ≈0ms |
| 4 | `step-4-rsc-boundary` | `'use client'` pushed to leaves; news, recent trades, root layout become true RSC; bundle ships only what's interactive | JS bytes shipped, TTFB, hydration time | JS bytes drop; TTFB stable; hydration time drops at chart leaf |
| 5 | `step-5-honest-limits` | Three failure demos: WebSocket-as-RSC (fails live), CSR-cached vs RSC reload (CSR wins), tick-rate stress (server load degrades) | LCP across reloads, server response time under stress | RSC underperforms in each scenario; client-island fix shown |

The dashboard's panel-to-archetype mapping is fixed across all five tags; only the *implementation* of each panel changes between tags.

```
╔════════════════════════╦══════════════════════╗
║ Price chart            ║ Order book           ║
║ (client island)        ║ (client+ws-style)    ║
╠════════════════════════╬══════════════════════╣
║ Order ticket           ║ News / research      ║
║ (optimistic)           ║ (RSC)                ║
╠════════════════════════╩══════════════════════╣
║ Recent trades                                 ║
║ (RSC streamed via Suspense)                   ║
╚═══════════════════════════════════════════════╝
```

The mock data layer feeds all client islands via a small WebSocket-shaped subscription API (`subscribe(channel, cb)`) so step-5's "swap mock for real WS, show RSC fails" demo is structural rather than theatrical. The HUD overlay, gated by `NEXT_PUBLIC_HUD=1`, observes Web Vitals + custom marks in a singleton store and renders fixed-position over the dashboard.

```mermaid
graph LR
  Mock[Deterministic mock<br/>Mulberry32 + tick knob] -->|subscribe()| Book[OrderBook]
  Mock -->|subscribe()| Chart[PriceChart]
  Mock -->|subscribe()| Trades[RecentTrades]
  Fixture[news.json fixture] -->|server fetch| News[NewsPanel RSC]
  Action[placeTrade Server Action] -->|throws or succeeds| Ticket[OrderTicket useOptimistic]
  WebVitals[next/web-vitals] -->|onMetric| Store[HUD store<br/>useSyncExternalStore]
  Marks[performance.mark<br/>at hydration + click] --> Store
  Store --> Hud[DevHud overlay]
```

---

## Implementation Units

Ten units, lightly grouped. U-IDs are stable (no renumber on reorder/split).

### Foundation (U1–U4)

- U1. **Repo cleanup**

**Goal:** Remove demo-irrelevant content from the Purple Stack v4 scaffold so the repo reads as a clean React-Brno demo artifact, while preserving all reusable tooling.

**Requirements:** R4, R5, R6, R8

**Dependencies:** None

**Files:**
- Delete: `domains/transaction/**`
- Delete: `infra/api.ts`, `infra/src/apiHandler.ts`
- Delete: `packages/core/src/deposit/**` (deposit logic + tests)
- Delete: `packages/trpc-api/**`
- Delete: `web/src/**`, `web/public/**`, `web/index.html`, `web/vite.config.ts`, `web/tsconfig.node.json`, `web/sst-env.d.ts`
- **Keep** (do not delete in U1): `web/package.json` and `web/tsconfig.json`. They remain as the existing Vite stubs until U2 overwrites them. This keeps the repo buildable between U1 and U2: `pnpm install` still resolves the `web` workspace member, `pnpm typecheck` still finds `./web`'s referenced project. Without this guard, U1's atomic commit would leave the repo in an unbuildable intermediate state and the verification step `pnpm install succeeds` would fail.
- Modify: `package.json` (root) — remove `@purple-stack/transaction` and `@purple-stack/trpc-api` from devDeps; remove `sst:remove`/`sst:deploy` only if not deploying (decision deferred — keep for now)
- Modify: `pnpm-workspace.yaml` — remove unused catalog entries (`@tanstack/react-router`, `@trpc/server`, `@trpc/client`, `vite` if no Vite app remains anywhere)
- Modify: `packages/core/package.json` — remove the `./deposit` entry from the `exports` map (the file it references is being deleted; the package's exports surface is empty until U-future repurposes core for fintech utilities)
- Modify: `tsconfig.json` (root) — remove `./domains/transaction` and `./packages/trpc-api` references
- Modify: `sst.config.ts` — remove deposit stack import, remove `tRPC` `DevCommand`. Web resource is removed in this unit (replaced as `sst.aws.Nextjs` in U2 if deploying, or removed entirely)
- Modify: `mise.toml` — remove `trpc:panel` task
- Delete: `.cursor/rules/domain-integration.mdc`
- Delete: `domains/transaction/.cursor/rules/vertical-slice-architecture.mdc`
- Delete: `web/src/routeTree.gen.ts` (if not already inside `web/src/`)

**Approach:**
- Atomic commit — single "chore: remove transaction domain + Vite scaffold" commit, no functional changes mixed in
- Run `pnpm install` after `pnpm-workspace.yaml` edits to regenerate the lockfile cleanly
- Run `pnpm lint:fix` and `pnpm typecheck` to confirm the trim leaves a green tree (typecheck will fail on remaining references; fix any stragglers before committing)
- `sst-env.d.ts` files regenerate automatically on next `sst dev`/`sst deploy`; leave stale or delete

**Patterns to follow:**
- Match Biome formatting (`mise run lint:fix` after edits)
- Workspace catalog rule (`.cursor/rules/dependency-management.mdc`)

**Test scenarios:**
- Test expectation: none — repo cleanup, no behavioral change.

**Verification:**
- `pnpm install` succeeds
- `pnpm typecheck` passes (zero TS errors after trim)
- `pnpm lint` passes
- `git status` shows only the intended deletions/modifications
- `tree -L 2 -I node_modules` matches the expected post-trim shape

---

- U2. **Next.js 15.5 scaffold + Tailwind v4 + tooling integration**

**Goal:** Stand up `web/` as a Next.js 15.5 App Router app with Tailwind v4, integrated into Purple Stack's pnpm catalog, Biome, mise tasks, and TypeScript project references.

**Requirements:** R1, R4, R6, R7, R8

**Dependencies:** U1

**Files:**
- Create: `web/package.json` (Next.js 15.5 deps via `catalog:`; package name `@purple-stack/web` retained)
- Create: `web/tsconfig.json` (extends `@purple-stack/tsconfig/base.json` where compatible; falls back to Next.js defaults if friction)
- Create: `web/next.config.mjs`
- Create: `web/postcss.config.mjs` (Tailwind v4)
- Create: `web/styles/globals.css` (`@import "tailwindcss";` + minimal base styles)
- Create: `web/app/layout.tsx` (root layout; imports globals.css; mounts `<DevHud/>` placeholder div)
- Create: `web/app/page.tsx` (placeholder — empty grid div, will be filled in U5)
- Modify: `pnpm-workspace.yaml` — add to default catalog: `next: 15.5.x`, `lightweight-charts: 5.2.x`, `tailwindcss: ^4`, `@tailwindcss/postcss: ^4`, `postcss: ^8`, `vitest: 3.2.x`, `jsdom: 25.x`, `@testing-library/react: 16.x`. (Bare `web-vitals` is **not** added — Key Decisions specify `useReportWebVitals` from `next/web-vitals`, which ships with Next.js.)
- Create: `web/vitest.config.ts` — environment: `jsdom` (required for U3, U4, U5 unit + smoke specs)
- Add to `web/package.json` `scripts`: `"test": "vitest --run"` so `pnpm test --filter @purple-stack/web` works and the root `pnpm test` fans out correctly
- Modify: `tsconfig.json` (root) — re-add `./web` reference pointing at the new `web/tsconfig.json`
- Modify: `package.json` (root) — no changes if scripts are unchanged

**Approach:**
- Use `pnpm dlx create-next-app@15.5.x web` as a starting point, then *destructure* — keep the scaffolded `app/`, `next.config.mjs`, `postcss.config.mjs`, but rewrite `package.json` to consume from catalog and adjust `tsconfig.json` to extend Purple Stack's base
- Tailwind v4 is the new minimal-config flavor (`@import "tailwindcss";` in `globals.css`, no `tailwind.config.js` required for default theme); confirm version compatibility with Next.js 15.5
- Add `'NEXT_PUBLIC_HUD'` env var to `.env.example` (or a new `web/.env.example`) gated to `'1'` for HUD visibility
- Verify `pnpm dev` from repo root via `pnpm --filter @purple-stack/web dev` boots Next.js cleanly
- Verify `pnpm typecheck` passes across all workspaces

**Patterns to follow:**
- Workspace catalog rule (`.cursor/rules/dependency-management.mdc`)
- Code-quality rule (`.cursor/rules/code-quality.mdc`) — run `mise run check` after edits
- Biome conventions (tab indent, single quotes, no trailing commas, semicolons-as-needed)

**Test scenarios:**
- Test expectation: none — scaffolding/config; behavior covered by subsequent units.

**Verification:**
- `pnpm install` succeeds
- `pnpm dev --filter @purple-stack/web` boots Next.js 15.5 on default port and renders an empty page
- `pnpm typecheck` and `pnpm lint` both pass
- Tailwind classes (`text-sm`, `bg-zinc-900`) render as expected on a quick smoke check
- `cat web/package.json | jq '.dependencies.next'` returns `"catalog:"`

---

- U3. **Mock data layer (deterministic + WebSocket-shaped)**

**Goal:** Build a deterministic in-process mock that emits price ticks, order-book updates, and recent-trade events through a WebSocket-shaped subscription API. Tick rate is configurable. Output is reproducible across runs given the same seed.

**Requirements:** R17, R18, R19, R3

**Dependencies:** U2

**Files:**
- Create: `web/lib/prng.ts` (Mulberry32 implementation)
- Create: `web/mocks/seed.ts` (initial state generator: starting price, order-book depth, recent-trade history)
- Create: `web/mocks/feed.ts` (tick generator + `subscribe(channel, cb)` API + tick-rate knob; reads `?tick=` query param if exposed)
- Create: `web/mocks/news.json` (pseudo-analyst notes fixture — short tone-of-market bullets; ~10 entries)
- Create: `web/tests/prng.test.ts`
- Create: `web/tests/feed.test.ts`

**Approach:**
- Mulberry32: 12-line PRNG, 32-bit state, returns float in [0, 1). Seed via constructor argument; expose `next()` and `reset(newSeed)`.
- Price walk: `price = price * (1 + drift + sigma * (rng() - 0.5))` per tick; clamp to a sane range. Symbol-agnostic.
- Order book: derive ask/bid stack from current price ± noise; depth ~10 levels each side.
- Recent trades: append per tick with tick-id + size + side; cap history at 50.
- Subscription API: `feed.subscribe(channel: 'price' | 'book' | 'trades', cb)` returns `unsubscribe()` fn. Internal `setInterval` driven by `ticksPerSecond` from a module-level config.
- Tick-rate knob: exposed as `feed.setTickRate(rate)` where `rate` is **always numeric** (milliseconds-per-tick). Consumed via UI control or `?tick=10` query param at `app/page.tsx` boundary. Common values: `100` (relaxed), `50`, `10` (fast), `5` (stress). The label "stress" is UI/HUD vocabulary only — never a literal value passed to `setTickRate`. Step-5 (c) uses `?tick=5`, not `?tick=stress`.
- HMR safety (critical for dev rehearsal): Next.js Fast Refresh re-evaluates `feed.ts` on save without calling user-defined teardown — without explicit cleanup, each save accumulates a fresh `setInterval` while the old one keeps firing on a dead subscriber list, doubling/tripling effective tick rate within a few rehearsal saves and distorting on-stage HUD numbers. Namespace the singleton on `globalThis` and clear the prior interval before re-initializing:

  ```ts
  // directional only — illustrates the HMR-safe pattern
  const g = globalThis as { __feed?: FeedSingleton }
  if (g.__feed?.timer !== undefined) {
    clearInterval(g.__feed.timer)
  }
  g.__feed = createFeedSingleton({ /* … */ })
  ```

  Verify by saving `feed.ts` 3+ times during dev and confirming HUD numbers do not double.
- Determinism: PRNG seed is fixed at module import (e.g., `0xCAFEBABE`); a `feed.reset()` re-seeds. No `Math.random()` or `Date.now()` inside the simulator — tick index serves as time.

**Technical design:**

```ts
// directional only — illustrates the subscription API shape
type Channel = 'price' | 'book' | 'trades'
type Tick = { id: number; price: number; book: BookLevel[]; trade?: Trade }

interface MockFeed {
  subscribe(ch: Channel, cb: (data: unknown) => void): () => void
  setTickRate(rate: number): void
  reset(seed?: number): void
}
```

**Patterns to follow:**
- Immutability rule (global coding style) — return new state objects per tick, never mutate in place
- Named interfaces for exported shapes; types for unions
- Zod for any boundary validation if data crosses the wire (not strictly needed here since the mock is in-process)

**Test scenarios:**
- Happy path: `feed.subscribe('price', cb)` invokes `cb` once per tick with a numeric price
- Happy path: same seed produces same first 100 ticks (determinism)
- Edge case: `feed.setTickRate(0)` halts emission; `setTickRate(>0)` resumes
- Edge case: `feed.reset()` returns to the seeded initial state
- Edge case: unsubscribing stops receiving callbacks
- Error path: `feed.subscribe(invalidChannel)` throws TypeError (or returns no-op — pick one consistently)
- Integration: with two subscribers on `'price'`, both receive each tick in the same order

**Verification:**
- `pnpm test --filter @purple-stack/web` passes the new specs
- Manual smoke: a small consumer that logs 10 ticks at 100ms shows reproducible output across two runs

---

- U4. **HUD overlay with web-vitals + custom timings**

**Goal:** Always-visible perf overlay that surfaces LCP, TTFB, JS bytes shipped, Hydration time, and Time-to-trade. Numbers update live. HUD is gated by `NEXT_PUBLIC_HUD=1`.

**Requirements:** R14, R15, R16

**Dependencies:** U2

**Files:**
- Create: `web/lib/store.ts` (singleton state with `subscribe()` + `getSnapshot()`; consumed via `useSyncExternalStore`)
- Create: `web/lib/perf.ts` (helpers: `markHydrationStart/End`, `markTradeClick/TradeCommitted`, `bytesShipped()` walking `performance.getEntriesByType('resource')`)
- Create: `web/app/_components/DevHud.tsx` (`'use client'`, mounts `useReportWebVitals` from `next/web-vitals`, subscribes to store, renders fixed-position panel)
- Modify: `web/app/layout.tsx` — mount `<DevHud/>` near `</body>`, gated by env var
- Create: `web/tests/perf.test.ts` (unit tests for `bytesShipped`, mark/measure helpers using mocked `performance` API)

**Approach:**
- Store: `useSyncExternalStore` over a small object `{ lcp, ttfb, fcp, inp, cls, jsBytes, hydrationMs, timeToTradeMs }`. Subscribers receive snapshot updates on every change.
- web-vitals piping: `useReportWebVitals((metric) => { store.set(metric.name.toLowerCase(), metric.value) })`. Use `next/web-vitals`, never the bare `web-vitals` package directly (avoids double-registering observers).
- JS bytes shipped: `performance.getEntriesByType('resource').filter(e => e.name.endsWith('.js')).reduce((s, e) => s + e.transferSize, 0)`. Update on `load` + on subsequent navigations via `performance.getEntries()`.
- Hydration time: `lib/perf.ts` exposes `markHydrationStart()` (called at the top of a root client boundary) and `markHydrationEnd()` (called inside that boundary's `useEffect`). `performance.measure('hydration', 'hydrationStart', 'hydrationEnd')`. The chart's own `useEffect` after `lightweight-charts` initializes calls `markChartHydrated()` for a more meaningful per-component number. Display the chart-leaf number prominently.
- Time-to-trade: `markTradeClick()` called in `OrderTicket` button onClick; `markTradeCommitted()` called inside `useOptimistic`'s reducer the first time it returns an optimistic state. Measure between marks.
- HUD UI: fixed-position bottom-right, `text-xs`, monospace, dark background, low-opacity until hover. Five rows: LCP, TTFB, JS bytes, Hydration, Time-to-trade. Show hyphen if not yet measured.
- Gate: `if (process.env.NEXT_PUBLIC_HUD !== '1') return null;` at the top of `<DevHud/>`. Set in `web/.env.local` for stage runs.

**Technical design:**

```ts
// directional only
export const store = {
  state: { lcp: undefined, ttfb: undefined, /* ... */ },
  subscribe(cb: () => void): () => void { /* … */ },
  getSnapshot() { return store.state },
  set<K extends keyof Snapshot>(k: K, v: Snapshot[K]) { /* … */ }
}
```

**Patterns to follow:**
- Immutability — `store.set` produces a new snapshot object so `useSyncExternalStore` notices
- No `console.log` in production paths (Cursor rule)
- Tailwind utility classes for layout, no custom CSS

**Test scenarios:**
- Happy path: `store.set('lcp', 1234)` updates `getSnapshot().lcp`; subscribers fire once
- Happy path: `bytesShipped()` returns sum of `.js` `transferSize` from `performance.getEntriesByType('resource')` (mocked)
- Edge case: `store.set` with the same value does NOT re-fire subscribers (referential equality)
- Edge case: `markTradeCommitted` before `markTradeClick` returns 0 or sentinel rather than negative
- Integration: when `NEXT_PUBLIC_HUD !== '1'`, `<DevHud/>` returns `null` (rendered output empty)

**Verification:**
- `pnpm test --filter @purple-stack/web` passes
- Manual: with `NEXT_PUBLIC_HUD=1` set, the HUD appears bottom-right after the page mounts; LCP populates within a few seconds; reload increases TTFB visibly under throttled connection
- Manual: with `NEXT_PUBLIC_HUD` unset, the HUD does not render

---

### Initial dashboard build (U5)

- U5. **Naive 5-panel dashboard — `step-1-naive-csr` baseline**

**Goal:** Implement the five-panel dashboard layout with every panel marked `'use client'`, fetching data on mount, no Suspense boundaries, no optimistic UI. This becomes the `step-1-naive-csr` annotated tag — the slowest, largest baseline.

**Requirements:** R1, R2, R3, R9, R14, R17

**Dependencies:** U2, U3, U4

**Files:**
- Create: `web/app/page.tsx` (server component shell that *renders* client panels; in this step, the shell is minimal and panels do all the work client-side)
- Create: `web/app/_components/PriceChart.tsx` (`'use client'`; hand-rolled `lightweight-charts` wrapper; subscribes to `feed.subscribe('price', ...)` after mount via `useEffect`)
- Create: `web/app/_components/OrderBook.tsx` (`'use client'`; subscribes to `feed.subscribe('book', ...)`)
- Create: `web/app/_components/OrderTicket.tsx` (`'use client'`; uncontrolled form; on submit, calls a stub `placeTrade()` that sleeps 600ms; updates local state after; no `useOptimistic` yet)
- Create: `web/app/_components/NewsPanel.tsx` (`'use client'`; fetches `/api/news` or imports `news.json` *via dynamic import in `useEffect`*; behaves as if it's a client-side fetch)
- Create: `web/app/_components/RecentTrades.tsx` (`'use client'`; subscribes to `feed.subscribe('trades', ...)`)
- Modify: `web/app/layout.tsx` — wrap `{children}` in a Tailwind grid container; ensure HUD is mounted

**Approach:**
- The whole page is effectively an SPA wrapped in Next.js — all data flows via client-side `useEffect` hooks
- Charts: hand-rolled wrapper. `useRef` for container; **single `useLayoutEffect`** that creates the chart, adds the series, sets initial data, subscribes to `feed.subscribe('price', tick => series.update(...))`, and returns a cleanup that calls `chart.remove()` and unsubscribes. Pass `autoSize: true` in chart options. The single-effect pattern (per TradingView's official advanced React tutorial) is StrictMode-safe: the dev double-mount creates+destroys the chart cleanly each pass. A *split* create/data effect would race because the data effect's `series` reference goes stale across the StrictMode remount.
- News: even though `news.json` is a static import, force the "client fetch" feel by `await import('@/mocks/news.json')` inside `useEffect` so the diff to step-2 (RSC server-fetch) is visible in the lesson
- Order ticket: simple form, local `submitting` state, fake server delay; on commit, append to recent trades via a side channel (or skip — depends on whether the audience needs to see trades flow back)
- HUD numbers should look bad in this step: LCP slow (waterfalls everywhere), JS bytes large (everything client), Time-to-trade ≈ 600ms (no optimistic)

**Patterns to follow:**
- "Push 'use client' to the leaf" — *deliberately violate it in this step* to establish the baseline. Layout is also `'use client'` here for the lesson's sake (later steps will lift it back to RSC).
- Immutable updates inside event handlers / state setters

**Execution note:** None — this step is a "canonical naive baseline"; the lesson is in the *delta to step-2*, not in writing optimal code.

**Test scenarios:**
- Test expectation: minimal — these are demo panels, not production code (per scope boundary). The `lib/` and `mocks/` units they consume are tested in U3/U4. Verification is manual via running the page and reading the HUD.
- One smoke test in `web/tests/page.smoke.test.tsx` — render the page in JSDOM, assert all five panels appear in the DOM. Catches gross regressions during later refactors.

**Verification:**
- `pnpm dev --filter @purple-stack/web` renders the dashboard with all five panels
- HUD shows: LCP ≥ 1.5s on Fast 3G throttle, JS bytes ≥ 200KB, Time-to-trade ≈ 600ms after a click, hydration ≥ 100ms
- Tag annotated: `git tag -a step-1-naive-csr -m "Baseline: naive client-only dashboard. All panels 'use client'. Establish slow/heavy starting metrics."`

---

### Build progression (U6–U8)

- U6. **Step 2 — Suspense + streaming refactor**

**Goal:** Add `<Suspense>` boundaries around the slow async sections (news, recent trades) and move their data fetching to the server. The static shell renders immediately; the slow panels stream in. Hero metric: secondary content LCP drops dramatically (Makarevich's 4.4s → 1.28s archetype).

**Requirements:** R10, R14, R15, R16

**Dependencies:** U5

**Files:**
- Modify: `web/app/layout.tsx` — drop `'use client'` directive (it was added in U5 to deliberately establish the naive baseline; lifting it here is part of step-2's bundle-shrink delta and lays the groundwork for U8's full RSC boundary push). Layout becomes RSC from this step forward.
- Modify: `web/app/page.tsx` — keep as a server component now (drop any incidental `'use client'`); render five panels with `<Suspense fallback={...}>` around `<NewsPanel/>` and `<RecentTrades/>`
- Modify: `web/app/_components/NewsPanel.tsx` — convert to async server component; `import news from '@/mocks/news.json'` at module top; render bullets directly. *Drop `'use client'`.*
- Modify: `web/app/_components/RecentTrades.tsx` — convert to async server component that awaits a stub server-side data source. Note: in this step the chart/order-book/order-ticket are *still* `'use client'` — they remain client islands; only the static-content panels become RSC. Step-4 deepens this further.
- Create: `web/app/loading.tsx` — route-level skeleton for the initial shell

**Approach:**
- Suspense placement: one boundary per *independent data dependency*. Single boundary at top is the anti-pattern; popcorn-on-every-leaf is the other. Follow research recommendation: news + recent trades each get their own `<Suspense>`; chart, order book, order ticket are not async (they subscribe via `useEffect` post-hydration), so they don't need server-side suspending.
- For RSC server-side data: news is synchronous (JSON import), recent trades simulates a slow fetch with `await new Promise(r => setTimeout(r, 800))` then returns an initial slice from the mock seed. The artificial delay is the lesson — without Suspense, the whole page waits 800ms; with Suspense, the shell paints in <100ms and the panel streams in 800ms later.
- Make sure `web/app/page.tsx`'s top doesn't accidentally inherit `'use client'` from any imported component — that would re-flatten the boundary

**Patterns to follow:**
- Push `'use client'` to leaves: `app/page.tsx` and `app/layout.tsx` are RSC; only the chart, order book, order ticket retain `'use client'` at this step
- Server-side data colocation: `NewsPanel` reads `news.json` at the component scope, no API hop

**Test scenarios:**
- Test expectation: rerun `web/tests/page.smoke.test.tsx` — adjust to render with Suspense boundaries; assert fallback content appears initially. Behavior verification is runtime/HUD.

**Verification:**
- `pnpm dev` — initial paint shows the chart + order book + order ticket immediately, news/recent-trades skeletons; news appears synchronously after first frame; recent trades streams in ~800ms later
- HUD shows: LCP drops from step-1 baseline (target: secondary content LCP under 1.5s); interactivity gap drops (target: ≈50ms with Suspense vs ≈2.5s in step-1); JS bytes mostly unchanged from step-1
- Tag annotated: `git tag -a step-2-suspense-streaming -m "Add Suspense boundaries on slow-data panels. Static shell paints immediately; news+trades stream in. Secondary LCP drops dramatically."`

---

- U7. **Step 3 — `useOptimistic` + `placeTrade` Server Action**

**Goal:** Order ticket gains instant click-to-feedback via `useOptimistic`. A `placeTrade` Server Action handles the real submission. Hero metric: Time-to-trade collapses from ≈600ms (step-1/2) to ≈0ms.

**Requirements:** R11, R14, R15, R16

**Dependencies:** U6

**Files:**
- Create: `web/app/_actions/placeTrade.ts` (`'use server'`; validates with Zod; sleeps 600ms (simulated broker latency); returns success or **throws** on error so `useOptimistic` auto-reverts)
- Modify: `web/app/_components/OrderTicket.tsx` — adopt `useOptimistic`; submit via `<form action={placeTrade}>`; render submitted+pending state with reduced opacity + "(sending…)" suffix
- Modify: `web/lib/perf.ts` — wire `markTradeClick()` at the form's submit handler entry, `markTradeCommitted()` inside the `useOptimistic` updater on first call

**Approach:**
- `useActionState(placeTrade, initialState)` for state + pending; pair with `useOptimistic` for instant visual feedback
- Server action validates with Zod; on validation failure, throw (auto-revert). On real-world failure (broker says no), throw a typed error; client `useActionState` exposes the error for display
- The client UX: clicking "Buy" shows the trade in the recent trades list immediately (optimistically appended), with reduced opacity. After 600ms server-side, the optimistic state is reconciled — either the trade stays (with full opacity) or rolls back (entry disappears).
- **Partial-success handling** (production-realistic, audience-relevant): the server action separates trade *placement* from *revalidation* error semantics:
  - Validation failure (Zod parse) → throw, optimistic state reverts; audience sees the entry disappear cleanly.
  - Trade-placement failure (broker says no) → throw, optimistic state reverts.
  - **Revalidation failure** (`revalidatePath` errors after a successful trade) → log server-side, **do not throw**. Returning success keeps the optimistic state committed; the client picks up real server state on the next natural re-render. Throwing here would revert UI for a trade that actually placed — the worst possible UX in a fintech product, and an obvious Q&A landmine if not handled. This separation is itself worth surfacing if Q&A goes there.
- Time-to-trade: `markTradeClick` fires synchronously on click; `markTradeCommitted` fires inside the optimistic updater on first invocation. Difference is ≈0ms (microtask boundary).
- Common pitfall to avoid (and demo-able): if `placeTrade` returned `{ ok: false }` instead of throwing, optimistic state would stay stuck. This is the wrong-way pattern that step 5's honest-limits beat will deliberately demonstrate.

**Patterns to follow:**
- Server action error handling: throw typed errors for auto-revert; return shape only for success metadata
- `useFormStatus` in a child of `<form>` (not the form itself) if a separate "submitting" indicator is wanted

**Test scenarios:**
- Happy path: `placeTrade(formData)` with valid Zod-parseable input returns success after ≈600ms
- Error path: invalid input throws (`safeParse` failure → thrown error); client sees auto-revert
- Integration: the form's optimistic state appears within a microtask of click; resolved state updates after 600ms

**Verification:**
- `pnpm dev` — clicking "Buy" shows an optimistic entry in recent trades immediately, with reduced opacity; after 600ms, the entry transitions to full opacity (commit) or disappears (revert on simulated error)
- HUD Time-to-trade reads ≈ 0ms after a click
- Tag annotated: `git tag -a step-3-optimistic-ui -m "Order ticket adopts useOptimistic + placeTrade Server Action. Time-to-trade ≈ 0ms."`

---

- U8. **Step 4 — RSC boundary push to leaves**

**Goal:** Push `'use client'` as deep into the tree as possible. Lift the dashboard layout, news, recent trades, and supporting structure to RSC. Only the truly interactive leaves (chart, order book, order ticket, HUD) retain `'use client'`. Hero metrics: JS bytes shipped drops; hydration time at non-leaf components disappears.

**Requirements:** R12, R14, R15, R16

**Dependencies:** U7

**Files:**
- Modify: `web/app/page.tsx` — already RSC after U6; verify and tighten any incidental client-side wrappers
- Modify: `web/app/layout.tsx` — confirm RSC; mount `<DevHud/>` as a single client island via `children` prop pattern if needed
- Modify: `web/app/_components/NewsPanel.tsx` — already RSC after U6; tighten
- Modify: `web/app/_components/RecentTrades.tsx` — keep RSC for the *initial render*; the *live updates* still come from a small client island that subscribes to the mock feed and prepends to the server-rendered initial slice. Pattern: RSC fetches initial 50 trades; a `'use client'` `<TradesLiveTail/>` component subscribes to the mock and renders new trades above the initial slice.
- Create (potentially): `web/app/_components/TradesLiveTail.tsx` (`'use client'`) — small leaf that handles the live subscription only
- Modify: `web/app/_components/PriceChart.tsx` — leave `'use client'`. Add a comment that this is *the only client boundary required* by lightweight-charts.
- Modify: `web/app/_components/OrderBook.tsx` — leave `'use client'`
- Modify: `web/app/_components/OrderTicket.tsx` — leave `'use client'`

**Approach:**
- Verify with `next build && next start && next analyze` (or `@next/bundle-analyzer`) that the JS bundle in `step-4` is meaningfully smaller than `step-3`
- The "RSC fetches initial slice + client tail subscribes to live updates" pattern for recent trades is the talk's most valuable architectural lesson — fast first paint (RSC), live updates (client island), zero waterfall
- Mark explicitly any place where adding `'use client'` would cascade: e.g., a context provider that's only used by the chart should *itself* be a tiny client component co-located with the chart, not at the root

**Patterns to follow:**
- "Push 'use client' to the leaf" — research-recommended canonical pattern
- Server children passed via `children` prop into client wrappers stay on the server (for any provider need)

**Test scenarios:**
- Test expectation: rerun `web/tests/page.smoke.test.tsx`; assert the page still renders all five panels. JS-bundle-size assertion via `next analyze` is a manual verification, not an automated test.
- Smoke (manual): in dev tools, confirm `client-` chunks are smaller in step-4 vs step-3

**Verification:**
- `pnpm dev` — dashboard behaves identically to step-3 from a user perspective
- HUD shows: JS bytes shipped drops (target: 30%+ reduction from step-3); hydration time at the chart leaf is unchanged or marginally lower; LCP holds
- `next analyze` (run manually before tagging) shows the layout, news, and recent-trades initial render are not in client chunks
- Tag annotated: `git tag -a step-4-rsc-boundary -m "Push 'use client' to leaves. Layout, news, recent-trades initial render are RSC. JS bundle drops; live tail remains a client island."`

---

### Honest limits (U9)

- U9. **Step 5 — three honest-limits demos with `step-5a-rsc-ws-fail` failed-attempt tag**

**Goal:** Demonstrate three architectural failure modes that establish where RSC does not fit: (a) a live WebSocket-as-RSC attempt that fails, (b) CSR cached LCP beats RSC on warm reload, (c) tick-rate stress reveals server-load scaling.

**Requirements:** R13, R14, R15, R16

**Dependencies:** U8

**Files:**
- Create: `web/app/_components/OrderBookRsc.tsx` (the deliberate failure: an `async` server component attempting to subscribe to the mock-feed-but-as-WebSocket; will hang or buffer + close). This file is staged on its *own commit* and tagged `step-5a-rsc-ws-fail` separately, then **rolled back** in the main step-5 commit
- Create (or restore): the working `OrderBook` after the rollback
- Modify (one-off): introduce a tiny SW or routing trick to demonstrate CSR-cached vs RSC reload (suggest: a query param `?csr=1` that flips key panels back to client-side fetching for a side-by-side run; instrument the HUD to label which mode it's in)
- Modify (one-off): `web/mocks/feed.ts` — expose a `setTickRate('stress')` value that drives ticks at e.g. 5ms; add a UI control in the HUD or a `?tick=5` query param

**Approach:**
- **Failure (a) workflow on stage:**
  1. Speaker runs `git switch -C step-5a-stage step-4-rsc-boundary` (force-creates a working branch from the prior tag; `-C` makes it idempotent across rehearsals — no detached-HEAD dance, no "branch already exists" errors)
  2. Adds `web/app/_components/OrderBookRsc.tsx` as an async server component that does `await someWebSocket.firstMessage()` (or imports a real `ws` server in dev mode). Runs the page. The Suspense boundary either hangs forever or resolves with one snapshot then closes.
  3. Speaker captures this as `git commit` and `git tag -a step-5a-rsc-ws-fail -m "Failed attempt: OrderBook as async RSC. Hangs because RSC streaming is one-shot per request."`
  4. Speaker switches to the prepared main step-5 head: `git switch step-5-honest-limits` (the working step-5 branch — pre-built before the talk — with the client-island OrderBook implementation). Demo lands the lesson: RSC is one-shot per response; long-lived push channels need client subscriptions.
- **Failure (b) — CSR cached vs RSC reload:**
  - Toggle: query param `?csr=1` makes news/recent-trades panels client-fetched (like step-1), `?csr=0` (default) keeps RSC
  - Demo: hit `?csr=1`, reload twice (once cold, once warm). Reload twice with `?csr=0`. HUD labels which mode it's in. CSR warm reload LCP wins. (Mirrors Makarevich's 800ms CSR cached vs 750ms RSC + Suspense data — close, but CSR comes out ahead under realistic cache conditions.)
- **Failure (c) — server load under tick stress:**
  - Speaker cranks the tick rate to 5ms via the HUD slider or query param. Opens 3 browser tabs against the same dev server. HUD on each tab shows server response time degrading as RSC re-renders pile up. Lesson: RSC re-renders happen on every request — you pay for them.

**Patterns to follow:**
- Annotated tags for both `step-5a-rsc-ws-fail` (the failed attempt) and `step-5-honest-limits` (the main head with the three demos in working state)
- Keep the failed `OrderBookRsc.tsx` file ONLY on the `step-5a-rsc-ws-fail` tag; the main step-5 head should NOT contain it

**Execution note:** Live-rehearsed failure (per origin requirements). Rehearse the WebSocket-as-RSC failure at least 5x before the talk so the exact error message and the "now I'll show you the fix" beat land smoothly.

**Test scenarios:**
- Test expectation: none for the honest-limits demos themselves — these are presentation behaviors, not unit-testable functions. Verification is manual + rehearsal-based.

**Verification:**
- `git checkout step-5a-rsc-ws-fail && pnpm dev` — reproduces the WebSocket-as-RSC failure (hang or buffered-then-closed); error is consistent and narratable
- `git checkout step-5-honest-limits && pnpm dev` — three demos run cleanly:
  - `?csr=1` reloaded twice: HUD labels CSR mode; warm LCP < 1s
  - `?csr=0` reloaded twice: HUD labels RSC mode; warm LCP > 1s
  - Tick stress: open 3 tabs, crank to `?tick=5`; HUD response-time numbers visibly increase across tabs
- Both tags are annotated and `git show step-5-honest-limits` displays the message

---

### Polish (U10)

- U10. **README rewrite + demo navigation scripts + `docs/solutions/` seed (optional)**

**Goal:** Repo reads as a polished, fork-and-explore artifact. Audience (post-talk) can clone, run `pnpm demo:1` through `pnpm demo:5`, and reproduce the entire progression. README maps each tag to its lesson. Optionally seeds `docs/solutions/` with captured learnings (deferred to follow-up if time-constrained).

**Requirements:** R8, R20, R21

**Dependencies:** U9

**Files:**
- Modify (rewrite): `README.md`
- Create: `scripts/demo.sh` (prints `git log --oneline step-1-naive-csr..HEAD` so audience sees the progression)
- Modify: `package.json` (root) — add `"demo:1"` … `"demo:5"` scripts wrapping `git switch -C live-N step-N-... && pnpm install --frozen-lockfile && pnpm --filter @purple-stack/web dev`. Use `git switch -C` (force-create branch) instead of `git checkout` so re-running `pnpm demo:N` mid-rehearsal is idempotent — `-C` overwrites any existing `live-N` branch from a prior run, avoiding the "branch already exists" failure.
- (Optional follow-up, see Scope Boundaries → Deferred to Follow-Up Work) `docs/solutions/*` learning capture is **not** part of U10's commit. If pursued post-talk, target topics: RSC Suspense placement, RSC leaf pattern, web-vitals HUD architecture, deterministic mock data.

**Approach:**
- README structure: title + abstract excerpt; "What you'll learn" bullets; "Tags" section with one paragraph per tag explaining what's added and what to watch in the HUD; setup instructions (`mise install`, `pnpm install`, `pnpm demo:1`); "External references" linking to the brainstorm digest
- The `pnpm demo:N` scripts must use `git checkout` not `git switch` if any tag-checkout corner cases need detached-HEAD; alternatively `git checkout -b live-N <tag>` so the speaker can edit live without warnings
- The optional `docs/solutions/*` files capture the learnings the ce-learnings-researcher recommended seeding. Deferred to post-talk if the build runs hot.

**Patterns to follow:**
- Annotated tags for every progression step (already done in U5–U9)
- Clear reproducibility: `pnpm install --frozen-lockfile` is the demo entry point; lockfile must be committed at every tag

**Test scenarios:**
- Test expectation: none — documentation and tooling.

**Verification:**
- `pnpm demo:1` through `pnpm demo:5` each boot the dev server cleanly
- `git tag -n` lists all five `step-*` tags + `step-5a-rsc-ws-fail` with annotated messages
- `cat README.md | head -50` reads as a polished talk artifact
- `bash scripts/demo.sh` prints the tag-by-tag progression

---

## System-Wide Impact

- **Interaction graph.** RSC tree → client islands at the leaves (chart, order book, order ticket, HUD). Server Action (`placeTrade`) → optimistic update path → reconciliation. Mock feed → client subscribers via WebSocket-shaped API. Web Vitals + custom marks → singleton store → `useSyncExternalStore` → HUD render.
- **Error propagation.** Server Action throws → `useActionState` exposes error → optimistic state auto-reverts. Client island errors (chart create/destroy failures) caught by route-level `error.tsx` boundary. RSC fetch errors during streaming → Suspense fallback shows on resolve, then `error.tsx` boundary engages. The honest-limits demo *deliberately* fails one path (WebSocket-as-RSC) to teach what RSC cannot do.
- **State lifecycle risks.** Mock feed's `setInterval` must clear on hot-module replacement during dev (otherwise duplicated tick streams). HUD store is module-scoped — survives HMR cleanly. Server Actions revalidate via `revalidatePath`/`revalidateTag`; if omitted, optimistic updates may "stick" (talk-relevant footgun, called out in step-3).
- **API surface parity.** No external API surface in the demo (no public endpoints, no consumers outside this repo). Server Actions are the only server-side surface; type-safety is end-to-end through `useActionState`.
- **Integration coverage.** Mock feed + chart + HUD interact across rendering modes; the `step-4` RSC boundary push is the most cross-cutting refactor. Manual rehearsal of the full demo at every tag is the integration test.
- **Unchanged invariants.** Purple Stack tooling (mise tasks, Biome rules, pnpm catalog protocol, TS project references for surviving packages) — none of these change. The new `web/` package conforms to the workspace-catalog rule. SST infrastructure (regions, stage-from-branch, AWS SSO scripts) is preserved untouched; deploy is opt-in via `pnpm sst:deploy` after the demo lands.

---

## Risks & Dependencies

| Risk | Mitigation |
|---|---|
| `sst.aws.Nextjs` + Next.js 15.5 streaming + Server Actions through CloudFront has known caveats (`OPEN_NEXT_FORCE_NON_EMPTY_RESPONSE=true`, possible 403s on POST). | Defer deploy to optional post-talk; demo runs locally. If deploying, smoke test streaming + a placeTrade POST end-to-end before announcing the URL. Pin `openNextVersion` explicitly if SST 4.3.6's default is stale. |
| `useOptimistic` rollback only fires on `throw`. Returning `{ ok: false }` leaves optimistic state stuck. | Server actions in error paths *throw* (Key Decision). The wrong-way pattern is itself demoed in step 5 as a teaching beat. |
| Tag drift between local and remote during rehearsal — accidental amends break the tag. | Use annotated tags only after a clean head; never `git tag -f` once the tag is referenced from the README. Re-tagging policy: append a suffix (e.g., `step-3-optimistic-ui-v2`) rather than force-update. |
| Conference WiFi dies. Demo runs locally — but `pnpm install --frozen-lockfile` from a fresh checkout still hits the registry. | Pre-install all five tags' deps (single `package.json` across tags makes this trivial); pre-warm `next build` for each tag if possible; bring a dependency-mirroring laptop / `pnpm offline` cache. |
| `lightweight-charts` v5.2.0 + React 19 in App Router — community wrappers stale, hand-rolled wrapper introduces lifecycle bugs (chart created twice in StrictMode dev double-render, never cleaned up). | Cleanup in `useLayoutEffect`'s return must call `chart.remove()`. Test in `next dev` with StrictMode AND in `next start` (production); production is what the HUD numbers in the talk should reflect. |
| Tailwind v4 introduces unfamiliar config; implementer struggles. | Tailwind v4 is *less* configuration than v3 (`@import "tailwindcss"` and you're done). If friction emerges in U2, swap to CSS Modules — same RSC compatibility, more familiar. Reversibility documented in Key Decisions. |
| HUD render itself perturbs the metrics it reports (observer effect). | Render HUD with `position: fixed` + `pointer-events: none` (or only when hovered); the HUD is small (5 numbers, monospaced); its layout cost is negligible. Verify by running with `NEXT_PUBLIC_HUD=0` and confirming Lighthouse numbers don't change meaningfully. |
| Mock feed `setInterval` leaks across HMR boundaries during dev, causing tick duplication that distorts on-stage demos. | Module-level singleton with explicit cleanup in `feed.reset()`; ensure HMR-safe initialization (use `globalThis` namespacing pattern). Document the failure mode in `docs/solutions/deterministic-mock-data.md` if seeded. |
| Slack research opt-in surfaced no internal context. | None required — this is a fresh demo build with no prior internal artifact. Flag the absence in the brainstorm doc and proceed. |

---

## Documentation / Operational Notes

- **Slides.** David's talk slides reference Makarevich's perf table, Comeau's "no re-rendering" framing, Abramov's "data comes from above" mental model — all sourced from `docs/brainstorms/rsc-research-digest.md`. Live HUD numbers are *our own measurements*; slides may show Makarevich's numbers as cross-comparison.
- **Lighthouse capture.** Manual procedure for v1: at each tag, run `next build && next start`, run Lighthouse against `http://localhost:3000`, capture before/after PNGs for steps 1→2, 2→3, 3→4, 4→5. Embed in slides. CI automation deferred to follow-up.
- **README** (rewritten in U10) is the post-talk takeaway; viewers clone, run `pnpm demo:1`, and reproduce.
- **`docs/solutions/`** seeding (rsc-suspense-placement, leaf-pattern, web-vitals-hud-architecture, deterministic-mock-data) is recommended by ce-learnings-researcher and deferred to U10 (or post-talk follow-up). Captures should land within a week of the talk while context is fresh.
- **Cursor rules** at `.cursor/rules/code-quality.mdc` + `dependency-management.mdc` survive unchanged. `.cursor/rules/domain-integration.mdc` is deleted in U1 (transaction-coupled).
- **Memory snapshot** for future Claude sessions: `~/.claude/projects/-Users-dchocholaty-Documents-CodingFiles-GitWorkspace-react-rsc/memory/david-role-stack.md` already captures David's role + Purple Stack v4 stack details.

---

## Sources & References

- **Origin document:** [docs/brainstorms/rsc-trading-dashboard-demo-requirements.md](../brainstorms/rsc-trading-dashboard-demo-requirements.md)
- **External research digest:** [docs/brainstorms/rsc-research-digest.md](../brainstorms/rsc-research-digest.md)
- Next.js 15.5 release notes — https://nextjs.org/blog/next-15-5
- Next.js Server and Client Components — https://nextjs.org/docs/app/getting-started/server-and-client-components
- Next.js Forms with Server Actions — https://nextjs.org/docs/app/guides/forms
- Next.js streaming — https://nextjs.org/docs/app/guides/streaming
- React `useOptimistic` reference — https://react.dev/reference/react/useOptimistic
- React 19 release notes — https://react.dev/blog/2024/12/05/react-19
- TradingView lightweight-charts (advanced React) — https://tradingview.github.io/lightweight-charts/tutorials/react/advanced
- GoogleChrome/web-vitals — https://github.com/GoogleChrome/web-vitals
- SST `sst.aws.Nextjs` — https://sst.dev/docs/component/aws/nextjs/
- OpenNext compatibility — https://opennext.js.org/aws/compatibility
- pnpm catalogs — https://pnpm.io/catalogs
- Watch: React `useOptimistic` issues #31967, #31595 — https://github.com/facebook/react/issues
- Repo Cursor rules: `.cursor/rules/code-quality.mdc`, `.cursor/rules/dependency-management.mdc`
- Repo files referenced throughout: `pnpm-workspace.yaml`, `package.json`, `tsconfig.json`, `sst.config.ts`, `mise.toml`, `biome.json`
