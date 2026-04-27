---
date: 2026-04-26
topic: rsc-trading-dashboard-demo
---

# RSC Trading Dashboard — Presentation Demo

Demo application for the React Brno talk *"Streaming the Future: Building High-Performance Financial UIs with RSC."* Built into this repository, replacing the existing Purple Stack v4 scaffolding's demo content while preserving the team's tooling.

## Problem Frame

David is presenting at React Brno (~20–30 min slot) on React Server Components, framed through a fintech / trading-dashboard lens. The committed abstract names three pillars: optimistic updates, Suspense + streaming, and the architectural shift toward server-first systems.

Internal team review (FE Friends meetup, 2026-04-15) plus external research convergence both push the talk toward a more honest framing than the abstract suggests: **a trading dashboard is partially a poor RSC fit** — high-frequency interaction, WebSocket-territory data, and optimistic UI all fight RSC's no-re-rendering constraint. That tension is the talk's strongest teaching surface, not a weakness to hide.

The audience is intermediate-to-advanced React developers who will compare RSC to existing solutions (SPA, classic SSR, alternative meta-frameworks like TanStack Start). They want concrete performance numbers, library compatibility caveats, and a usable mental model for when to adopt — not a marketing pitch.

This document captures the durable demo decisions; companion file `rsc-research-digest.md` holds the external grounding (perf benchmarks, quotes, multi-source synthesis) and is referenced inline.

---

## Requirements

**Demo application surface**

- R1. Single-symbol fintech trading dashboard with five panels, each mapping to a distinct architectural archetype:
  - Price chart — client island using `lightweight-charts` (TradingView, canvas-based); the chart leaf is the only `'use client'` boundary in this panel, so the parent layout stays server-rendered
  - Order book — client island fed by a mock WebSocket-style stream
  - Order ticket — client island using `useOptimistic` for instant submission feedback
  - News / research feed — RSC, server-fetched at request time from a local JSON fixture of pseudo-analyst notes (short tone-of-market bullets); makes the "no API layer needed" pattern visible in the diff
  - Recent trades — RSC streamed via `Suspense`
- R2. Symbol is decorative; the data layer is symbol-agnostic. Specific symbol (EUR/USD, BTC/USD, AAPL, etc.) chosen during implementation purely on visual grounds.
- R3. Visual aesthetic should read as plausible fintech without claiming domain accuracy — no real broker integration, no real market data.

**Demo composition reference layout**

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

**Repository setup**

- R4. Demo lives inside this repository (`react-rsc`), inheriting Purple Stack v4 tooling: `mise.toml`, `biome.json`, `pnpm-workspace.yaml` and its catalog (React 19.2.0, Zod, TanStack pinned), `infra/`, `sst.config.ts`, `scripts/`, root `tsconfig.json`, `packages/tsconfig`, `packages/sst-extensions`.
- R5. Existing `domains/transaction/*` (deposit + withdrawal features) is removed before implementation — unrelated to the demo and dilutes the post-talk repo as a teaching artifact.
- R6. Existing Vite-based `web/` content is removed; the directory is replaced by a Next.js 15 App Router app. The Vite scaffold is not preserved as a step-1 baseline because it is generic, not a trading dashboard — the progression is built inside the Next.js app via tags.
- R7. `pnpm-workspace.yaml` catalog is extended at planning time to add Next.js (and any web-vitals / charting deps).
- R8. The repo is published publicly post-talk as a takeaway artifact. Each progression step is a tag; the README links to the slides and to this requirements document.

**Build progression — five tagged commits / branches**

The talk walks through each tag, runs the running app, and points at the live HUD. Each tag is rehearsable independently and stable on stage.

- R9. `step-1-naive-csr` — All components marked `'use client'`; data fetched on mount via client-side calls; no Suspense; no optimistic UI. Establishes the baseline metrics.
- R10. `step-2-suspense-streaming` — Suspense boundaries placed on slow-data panels (news, recent trades). Static shell renders immediately; data sections stream in. Demonstrates Makarevich's secondary-LCP win (4.4s → 1.28s archetype).
- R11. `step-3-optimistic-ui` — Order ticket adopts `useOptimistic`; trade submission shows instant client UI feedback before server confirmation. Reveals the architectural truth that optimistic UI is a *client-side* primitive RSC cannot own.
- R12. `step-4-rsc-boundary` — `'use client'` is pushed to leaves; news/research and recent-trades panels become true RSC; bundle size, TTFB, and hydration time measured. Demonstrates "push `'use client'` to the leaf."
- R13. `step-5-honest-limits` — Demonstrates at least three RSC failure modes:
  1. **WebSocket-as-RSC fails.** Attempt to make the order book a streaming RSC live on stage; show why it cannot subscribe to continuous updates; revert to the client-island approach. Delivered as a live, rehearsed failure (rehearsed at least 5x so the exact error is known and narratable with confidence). The failed attempt is also saved as its own tag (e.g., `step-5a-rsc-ws-fail`) so post-talk readers can reproduce the failure mode.
  2. **CSR cached beats RSC on warm reload.** With service-worker cache or repeat navigation, the HUD reveals the counterintuitive truth: a well-built SPA's 800ms cached LCP outperforms RSC. (Mirrors Makarevich's data.)
  3. **Server load under tick-rate stress.** Crank the mock data tick-rate knob; open multiple tabs; show server response time degrading as RSC re-renders pile up.

**Performance instrumentation**

- R14. In-app HUD overlay always visible during the running demo, displaying:
  - **LCP** — Largest Contentful Paint
  - **TTFB** — Time to First Byte
  - **JS bytes shipped** — total JS transferred to client
  - **Hydration time** — measured via React profiler hooks or `web-vitals` custom timing
  - **Time-to-trade** — custom timing: click → UI feedback (zero with optimistic, N ms without)
- R15. HUD numbers update live as the running app changes (tag switches require a re-run; HUD persists across runs).
- R16. Pre-baked Lighthouse before/after comparison slides (PNG screenshots embedded in talk slides) for steps 1→2, 2→3, 3→4, 4→5. Authoritative third-party numbers complement the live HUD.

**Data layer**

- R17. Deterministic in-process mock data layer with a configurable tick-rate knob. Default tick rates: 100ms / 50ms / 10ms / "stress." No real WebSocket feeds on stage.
- R18. Tick-rate is exposed as a UI control (or query param) so the talk can crank it during the step-5 limits demo.
- R19. Data layer is symbol-agnostic; selected symbol drives only display labels.

**Talk delivery**

- R20. Demo runs locally on stage (no live deploy required); SST infrastructure stays in the repo for optional post-talk deployment.
- R21. The talk references external research (rsc-research-digest.md) for benchmark numbers — particularly Makarevich's table — but the live HUD shows our own numbers, not borrowed ones.

---

## Success Criteria

- Audience leaves with a concrete mental model of where RSC excels (server-cacheable, content-heavy, non-interactive UI) and where it doesn't (high-frequency state, WebSockets, repeat-visit performance, optimistic UI).
- Each progression step's hero metric visibly moves on the HUD; nothing requires the audience to take David's word for it.
- Step 5 ("honest limits") leaves at least one specific RSC failure mode imprinted — not "RSC has caveats" but "you cannot do X." The WebSocket-as-RSC failure is the most visceral candidate.
- Repo is ergonomic for post-talk fork-and-explore: tags switch cleanly, README explains what each step demonstrates, no setup beyond `pnpm install && pnpm dev`.
- Colleague feedback from 2026-04-15 meeting is addressed: comparison framings exist (slides reference SPA, classic SSR, RSC); live perf testing is real (HUD); practical limits are demonstrated (step 5); library compatibility caveats are surfaced in the limits section.

---

## Scope Boundaries

- **Out: real broker integration, real market data feeds, real authentication.** The demo is a teaching artifact, not a product.
- **Out: multi-user / multi-account simulation.** Single-user only.
- **Out: live deployment as part of demo execution.** SST stays for optional post-talk deploy; on-stage runs are local.
- **Out: cross-framework comparison built into the demo.** TanStack Start, Remix, and SPA-only comparisons stay on slides — the demo is single-stack (Next.js App Router) for narrative clarity.
- **Out: company-specific content from MyAxiory or Walletory.** No internal screens, schemas, or branding; the demo is a fictional dashboard.
- **Out: testing strategy for the demo itself.** A presentation demo does not need 80% coverage; the global testing rules apply to the production code style we model, not to the demo's own test suite.

---

## Key Decisions

- **Demo narrative shape: build progression arc** (5 tagged commits), over single integrated dashboard, three vignettes, or side-by-side toggle. Reason: cleanest causal story for the audience — "this change → this metric moved."
- **Delivery mode: tagged-commit walk** over live coding, recorded captures, or hybrid. Reason: rehearsable, conference-WiFi-resilient, and the repo doubles as a takeaway.
- **Composition: single-symbol focus** with five panels, each a distinct archetype, over multi-symbol watchlist or pro-terminal heavy. Reason: tightest narrative, panel-by-panel narration, smallest build surface for five polished steps.
- **Metrics: hybrid HUD + Lighthouse slides** over HUD-only, slides-only, or DevTools-driven. Reason: audience sees live numbers move *and* gets authoritative third-party comparison.
- **Data layer: deterministic in-process mock with tick-rate knob** over real WebSocket / API feeds. Reason: stage reliability and the ability to dramatize limits by cranking the rate.
- **Stack: Next.js 15 App Router inside this monorepo**, replacing existing `domains/transaction/*` and `web/`, preserving Purple Stack tooling. Reason: matches abstract's Next.js framing while keeping team-credible tooling and providing a "what real adoption looks like" subtext.
- **Framing: honest hybrid** ("RSC where it excels + where it doesn't") over RSC-as-savior. Reason: matches both colleague feedback and external research convergence; the limits discussion *is* the strongest teaching content.
- **Charting library: `lightweight-charts` (TradingView)** over Recharts or canvas-driven custom. Reason: canvas-based, so `'use client'` stays at the chart leaf — step-4 RSC boundary stays clean. Recharts would force `'use client'` to cascade up several levels because it is React-component-deep, muddying the boundary lesson; the cascade story still gets told in step-5 limits via narration.
- **News/research panel content: pseudo-analyst notes from a local JSON fixture**, server-fetched in the RSC component. Reason: makes the "RSC reads from data source directly, no API layer" pattern visible in the diff; reads as plausible fintech without claiming domain accuracy.
- **WebSocket-as-RSC failure (step 5): live, rehearsed**, with the failed attempt also saved as its own tag. Reason: visceral teaching moment that pre-recorded delivery would undercut; the tag lets post-talk readers reproduce the failure rather than take David's word for it.

---

## Dependencies / Assumptions

- React 19.2.0 (already pinned in `pnpm-workspace.yaml` catalog) is RSC-mature.
- Next.js 15 App Router supports the patterns demonstrated (`useOptimistic`, server components, Suspense streaming, server actions). Assumed available; not yet pinned in catalog — added during planning.
- TypeScript strict mode applies; coding-style global rules govern (Zod for boundary validation, no `any`, immutable updates, named interfaces for component props, no `console.log` in committed demo code).
- Biome handles lint + format (already configured at repo root).
- pnpm workspace catalog is the single source of truth for shared dep versions; new deps added there.
- SST 4.3.6 supports Next.js deployment via `sst.aws.Nextjs` — *unverified for current AWS Lambda runtime constraints*; planning will confirm.
- Audience is React Brno developers (intermediate to advanced); no need to teach JSX, hooks, or basic SSR concepts.
- Talk length is 20–30 min per the FE Friends meeting (2026-04-15); the abstract uses "lightning session" loosely.
- The five-panel composition is small enough to build through five polished tags within the talk's preparation window. Planning confirms total scope.
- External research (`rsc-research-digest.md`) is the canonical reference for borrowed numbers and quotes.

---

## Outstanding Questions

### Resolve Before Planning

(none — all blocking questions resolved during brainstorming; see Key Decisions)

### Deferred to Planning

- [Affects R17, R13] [Technical] Mock data architecture: server-side generator with SSE / RSC streaming, vs client-side generator with WebSocket-style API. Affects whether step 5's "WebSocket-as-RSC fails" demo is structural (real HTTP/RSC limitation surfaces) or simulated.
- [Affects R14, R15] [Technical] Custom HUD implementation — how to expose `web-vitals` measurements consistently across RSC and CSR rendering paths; whether Time-to-trade is measured via React profiler API or `performance.mark` / `performance.measure`.
- [Affects R5, R8] [Technical] Whether to delete `domains/transaction/*` or archive it on a separate branch. Git history preserves the original Purple Stack content either way; cleaner repo wins.
- [Affects R6, R20] [Needs research] Confirm `sst.aws.Nextjs` compatibility with Next.js 15 App Router as of April 2026.
- [Affects R16] [Technical] Lighthouse capture procedure — local CI script or manual capture before the talk. Affects reproducibility if numbers need to be regenerated.

---

## Next Steps

`Resolve Before Planning` is empty; ready for implementation planning.

`-> /ce-plan` for structured implementation planning.

## References

- Companion: `docs/brainstorms/rsc-research-digest.md` — full external grounding.
- Source meeting notes: FE Friends meetup, 2026-04-15 (provided in conversation).
- Talk abstract: *"Streaming the Future: Building High-Performance Financial UIs with RSC"* — David Chocholatý, Purple Technology, React Brno.
