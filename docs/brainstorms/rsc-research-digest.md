---
date: 2026-04-26
topic: rsc-research-digest
---

# React Server Components — External Research Digest

Structured grounding for the React Brno presentation, gathered from 9 articles + videos shared during brainstorming. Companion to `rsc-trading-dashboard-demo-requirements.md`.

**Research value: high** — Multiple primary sources (benchmarked case studies, the React team's own framing from Dan Abramov, practitioner postmortems, and a critical engineering blog) converge on concrete performance numbers, named architectural patterns, and well-documented anti-patterns directly applicable to the demo arc.

---

## Source 1 — Carl Mobarezi, Medium: RSC vs SSR

**URL:** https://medium.com/@carlmobarezi/react-server-components-vs-server-side-rendering-03dbcd0d4378

**Core thesis.** RSC is component-level rendering, SSR is full-page rendering. The framing is evolutionary: SPA → SSR → RSC.

**Performance data.** FCP target anchor: 1.8s or less at 75th percentile (Google threshold). Conceptual, not benchmarked.

**Use cases.** Pages where some sections (headers, sidebars) are data-independent and can render while slower data loads.

**Limitations.** SSR's "uncanny valley" applies to naive RSC: HTML visible but not interactive until JS hydrates.

**Memorable framings.** "Individual components on the server" — clean elevator definition.

---

## Source 2 — Tymek Zapała, tymzap.com: 5 Differences Between RSC and SSR

**URL:** https://www.tymzap.com/blog/5-differences-between-react-server-components-and-server-side-rendering

**Core thesis.** RSC and SSR are complementary, not competing. **"The interesting word in 'server components' is 'components', not 'server.'"** SSR requires full-bundle delivery for hydration; RSC eliminates JavaScript for non-interactive portions entirely.

**Performance data.** Bundle savings (qualitative): server components avoid shipping libraries like `date-fns` to the client. SSR's double-render produces hydration-mismatch bugs (`localStorage`, `window`); RSC eliminates this category for server-only components.

**Use cases.** Heavy computation/data-fetching components that don't need interactivity. Static page sections (the "islands" pattern). Fine-grained control over what executes client-side.

**Limitations.** RSC has no `useEffect`, `useState`, hooks. Restructuring is hard if interactivity is added to an existing server component.

**Memorable framings.**
- "The interesting word in 'server components' is 'components', not 'server.'" → strong stage quote.
- "Islands of interactivity" — most pages are static; RSC's architecture matches that reality.

---

## Source 3 — Nadia Makarevich, developerway.com: RSC Performance

**URL:** https://www.developerway.com/posts/react-server-components-performance

**Core thesis.** RSC + streaming + Suspense does not automatically improve performance. Benefits only materialize when data fetching is rewritten server-side, Suspense boundaries are deliberately placed, and the app is architected server-first from the start. **Lift-and-shift migrations can actively worsen metrics.**

**Performance data.** Most numerically rich source in the set. Benchmarks across rendering strategies (no-cache / cached):

| Strategy | LCP | Sidebar LCP | Messages LCP | Interactivity Gap |
|---|---|---|---|---|
| Client-Side Rendering | 4.1s / 800ms | 4.7s / 1.5s | 5.1s / 2s | 0ms |
| SSR + Client Data Fetch | 1.61s / 800ms | 4.7s / 1.5s | 5.1s / 2s | 2.39s |
| SSR + Server Data Fetch | 2.16s / 1.24s | 2.16s / 1.24s | 2.16s / 1.24s | 2.44s |
| App Router Lift-Shift | 1.28s / 650ms | 4.4s / 1.5s | 4.9s / 2s | 2.52s |
| App Router + RSC + Suspense | 1.28s / 750ms | **1.28s / 750ms** | **1.28s / 1.1s** | **2.52s / 50ms** |

Key insight: RSC + Suspense reduces secondary content LCP from 4.4–5.1s to 1.28s. Interactivity gap drops from 2.52s to 50ms when Suspense boundaries are properly placed. **Interactivity gap is unavoidable for SSR and naive RSC** — only code-splitting minimizes it. CSR is the only strategy with 0ms interactivity gap.

**Use cases.** Multi-route apps where progressive rendering across pages justifies the architectural overhaul. Apps where secondary content LCP is the bottleneck. Server-first new builds, not migrations.

**Limitations / anti-patterns.**
1. Lift-and-shift migration: App Router without rewriting data fetching → zero improvement, possible regression.
2. Missing Suspense boundaries: entire app blocks server rendering, eliminating all streaming benefits — single most common implementation mistake.
3. Mixed client/server trees without clear hierarchy: `'use client'` bubbles up too aggressively, eliminates bundle benefits.
4. Overestimating bundle savings: in real apps, `'use client'` propagates widely.
5. **CSR is faster on repeat visits**: a well-built SPA's 800ms cached LCP outperforms SSR/RSC across the board.

**Memorable framings.** *"Server Components by themselves don't improve performance if the app is a mix of Client and Server components. They don't reduce bundle size enough to have any measurable performance impact."*

---

## Source 4 — Preply Engineering: INP Optimization Without RSC

**URL:** https://medium.com/preply-engineering/how-preply-improved-inp-on-a-next-js-application-without-react-server-components-and-app-router-491713149875

**Core thesis.** Preply achieved significant INP improvements through data-driven optimization of existing Pages Router code, not RSC migration. RSC migration to App Router showed "only slight" improvements on the Home page. Performance wins require weeks of measurement, not framework upgrades.

**Performance data.**
- Search page INP: ~250ms → 175ms (30% improvement)
- Home page INP: ~250ms → 185ms (26% improvement)
- React 18 upgrade alone: 460ms → 323ms (–137ms)
- Hydration duration: 120ms average
- Keyboard typing INP: 632ms → 72ms after debouncing (–89%)
- Virtualizing long lists: –40ms INP
- Debouncing keyboard events: –20ms INP
- Memoizing heavy components: –30ms INP
- Estimated annual savings from INP: ~$200K

**Use cases.** RSC most impactful when combined with rewriting data fetching to be server-first.

**Limitations.**
- `useDeferredValue` did not help for components heavy on DOM reconciliation.
- Removing dead code (15% reduction) showed no INP gains — bundle size and INP are decoupled.
- The `await-interaction-response` package "hides root problems instead of removing existing performance bottlenecks" — anti-pattern.

**Memorable framings.**
- *"Performance optimizations on existing big products usually require weeks of analysis and only hours to fix."*
- *"INP proves to be a great metric — it acts as a true litmus test."*
- INP and bundle size are largely decoupled — critical framing for the demo's "honest limits" step.

---

## Source 5 — Stack Overflow: RSC vs SSR Thread

**URL:** https://stackoverflow.com/questions/76325862/what-is-the-difference-between-react-server-components-rsc-and-server-side-ren

*WebFetch was blocked; reconstructed via WebSearch.*

**Core thesis.** RSC and SSR are "two separate and orthogonal features" sharing the word "server" but differing fundamentally in scope. SSR = full-page rendering; RSC = component-level rendering.

**Use cases.** RSC for granular component-level control. SSR for full-page HTML for SEO and initial load.

**Limitations.** SSR runs components twice (server + client hydration); RSC eliminates dual-run for server-only components.

**Memorable framings.** *"RSC doesn't need hydration because the rendered parts are static and do not include client-side JavaScript."*

---

## Source 6 — YouTube: "The Difference Between RSC & SSR" (xoi-bDY_gmU)

**URL:** https://www.youtube.com/watch?v=xoi-bDY_gmU

*Transcript not fetchable; reconstructed via WebSearch.*

**Core thesis.** "Just because they have the word 'server' in them doesn't make them similar." RSC compiles to a stream of tagged JSON; SSR produces full HTML.

**Use cases.** RSC for components that "never run or are even hydrated on the client" — zero bundle impact.

**Memorable framings.** RSC streams "tagged JSON" — closest to a protocol-level description, useful for a "how it actually works" slide.

---

## Source 7 — Josh Comeau, joshwcomeau.com: Making Sense of React Server Components

**URL:** https://www.joshwcomeau.com/react/server-components/

**Core thesis.** RSC is a paradigm shift, not a replacement for SSR but built atop it. Central value: eliminating the client-server data-fetching "bounce" — waterfalls collapse because the server component can access the database directly.

**Performance data.** Qualitative bundle reduction. Comeau cautions: gains are *"less exciting"* than the philosophical shift; modern apps are already fast enough that bundle savings are not the headline win. Heavy libraries (syntax highlighters) become zero-cost server-side.

**Use cases.**
- Heavy libraries with server-side logic (highlighters, date libs, markdown parsers).
- Database queries directly in components — no API layer.
- Server-exclusive operations: credentials, secrets, DB access.
- Static content with non-interactive rendering.

**Limitations.**
- Client Components cannot render Server Components past a certain depth — boundary placement is constrained.
- **Server Components have no re-rendering**: props lock at initial render; cannot respond to state changes.
- HTML file size trades off against JS bundle size.
- Framework lock-in: only Next.js App Router fully supported as of writing.

**Memorable framings.**
- *"Hydration is like watering the dry HTML with the water of interactivity and event handlers."* (Dan Abramov, quoted by Comeau).
- RSC enables *"things that would be too cost-prohibitive to include in a JS bundle"* to run server-side *"for free."*
- **"No re-rendering" is the sharpest "honest limits" framing**: a trading price ticker is structurally incompatible with RSC.

---

## Source 8 — Reddit r/reactjs: Server-Side Components Skepticism

**URL:** https://www.reddit.com/r/reactjs/comments/15cuydp/please_explain_me_why_server_side_components/

*WebFetch was blocked; reconstructed via WebSearch.*

**Core thesis.** Community skepticism thread. RSC introduces a mandatory architectural decision (server vs client component) that did not exist before, increasing cognitive load. Library compatibility is the most cited blocker (CSS-in-JS, Context, hooks).

**Use cases.** Dashboards/reports fetching large datasets, scenarios prioritizing security over interactivity.

**Limitations.**
- No WebSockets or continuous updates: *"RSCs do not support continuous updates, such as through WebSockets. In these cases, a client-side fetching or polling approach would be necessary."*
- Increased server load: every user request triggers server rendering; can strain backend.
- Library ecosystem gaps at adoption: CSS-in-JS, hook-dependent packages, React Context.

**Memorable framings.** *"RSC does not support continuous updates, such as through WebSockets"* — clearest single-sentence "honest limits" line for the trading dashboard.

---

## Source 9 — Dan Abramov, RemixConf 2023: "React from Another Dimension"

**URL:** https://www.youtube.com/watch?v=zMf_xeGPn6s

*Two-pass research. First pass: YouTube transcript not fetchable, reconstructed from JS Party #311. Second pass (2026-04-27): Gemini CLI returned a richer reading, but its web-search grounding hit repeated quota errors during the run — structural claims about the talk's setup are reliable; **per-quote verification is Gemini-asserted but not transcript-confirmed**. Watch the relevant ~30s segment before putting any quote on a slide.*

**Core thesis.** Alternate-history thought experiment: what if React had been invented in **2008** as a server-side library competing with PHP and Rails? Dan demos a Notes app running on **Windows XP / Internet Explorer 6** to show that RSC's HTML/serialized output works in a 20-year-old browser. The point: RSC is a return to the multi-page-app model's simplicity (server as source of truth) enhanced by React's component composition.

The deeper claim is that RSC is "the missing piece that unifies server and client" — a single, continuous component tree where the network boundary is nearly transparent. Not just SSR-2.0 or bundle-size reduction; a structural shift that lets React solve the client-server waterfall without losing high-fidelity interactivity.

**Use cases.** Eliminating client-server waterfalls. Automatic code-splitting. Static generation, server-based execution, or hybrid. Selective hydration (islands within the RSC tree).

**Limitations.** Async components on the client are deliberately not supported (state changes must remain instant). Benefits minimal for SPAs without server-side routing awareness.

**Memorable framings.** *(Status notation: V = Gemini reports verbatim, gemini-claimed but transcript-unconfirmed; J = corroborated in JS Party #311 interview text)*

- *"What if React originally only worked on the server and not on the client?"* — opening hook. **(V)**
- *"UI is a function of data and state that's partially applied over the network."* — used specifically when explaining Server Actions: `.bind()` an ID server-side, pass to a client button = partial application across the network. **(V, J)**
- *"Like htmx with a component model."* — bridge framing for HTMX-curious devs. **(V, J)**
- *"Data always comes from above"* (RSC) vs *"data comes from the side"* (SPA, via `useEffect`). Mental-model slide candidate. **(V, J)**
- *"Server Components are just components that run on the server. They don't have any bundle size on the client."* — explains why the IE6 demo works. **(V)**
- *"You don't need to hydrate the whole page. You only hydrate the parts that need interactivity."* — islands framing within RSC. **(V)**
- *"Refetch, don't synchronize."* — sharp Redux/Apollo critique; reframes state management as server-driven UI fragments rather than client-mirrored state. **(V)**
- *"The goal is to make the server and the client work together seamlessly."* — concluding vision. **(V)**

**For slide use.** "(V, J)" quotes have the strongest provenance — they appear consistently across both Gemini's reading of this talk and the verified JS Party transcript. "(V)"-only quotes need spot-verification by watching the relevant moment before stage use.

---

## Cross-Cutting Synthesis

### Common framings (multi-source agreement)

1. **RSC and SSR are orthogonal, not competing** (Sources 1, 2, 5, 6, 7). The definitional confusion is a talk opportunity in itself.
2. **RSC's primary value is architectural, not narrowly performance** (Sources 3, 7, 9). Performance only materializes with full architectural commitment.
3. **Bundle size reduction is overstated in practice** (Sources 3 + supplementary sources). Mixed client/server trees yield "no measurable" bundle savings.
4. **Suspense boundaries are the make-or-break implementation detail** (Sources 3, 7, 9). Missing them is the single most common failure mode.
5. **Lift-and-shift migrations backfire** (Sources 3, 4). App Router migration without rewriting data fetching: no gains, possible regression.

### Numbers that recur (highest slide credibility)

| Metric | Value | Source |
|---|---|---|
| CSR cached LCP | 800ms | Makarevich |
| SSR + client fetch LCP (uncached) | 1.61s | Makarevich |
| App Router + RSC + Suspense LCP | 1.28s | Makarevich |
| Secondary content LCP (RSC + Suspense) | 1.28s vs 4.4–5.1s | Makarevich |
| Interactivity gap (SSR) | ~2.4–2.5s | Makarevich |
| Interactivity gap (RSC + Suspense) | 50ms | Makarevich |
| INP from keyboard debouncing | 632ms → 72ms | Preply |
| React 18 upgrade INP | –137ms | Preply |

### Strongest "honest limits" angles

Multi-source convergence makes these the most defensible step 5 content:

1. **No state, no re-rendering, no WebSockets.** RSC is architecturally incapable of responding to state changes (Comeau, Reddit). A live price ticker is structurally incompatible.
2. **Repeat-visit performance: CSR wins.** Warm-cache CSR (800ms) beats every server-side strategy (Makarevich). A trading dashboard where users are logged in all day is precisely the repeat-visit scenario.
3. **Server load scales with request rate.** Every request triggers server rendering (Reddit). For dashboards updating every second per user, real operational cost.
4. **INP is not improved by RSC alone.** App Router migration showed "only slight" Home page INP gains (Preply). Debouncing/memoization matter more than RSC for INP.
5. **Optimistic UI is a client-side primitive.** RSC's no-re-rendering constraint forces the optimistic layer into a client island. The teaching moment: RSC wraps the boundary; it does not own the interactive edge.

### Concrete demo techniques

- **Suspense boundary placement** as the key variable: same app, with and without proper boundaries — secondary LCP 4.4s vs 1.28s.
- **"Push `'use client'` to the leaf"**: containers and layouts stay server; only interactive buttons/inputs get the directive — prevents cascade bloat.
- **Data fetching colocation**: server component reads from DB directly — no API hop, no waterfall.
- **Streaming shell pattern**: static shell renders immediately, Suspense wraps slow data sections.
- **Client island for optimistic updates**: order ticket is `'use client'` with `useOptimistic`; RSC wraps surrounding context.
- **WebSocket "honest limits" demo**: attempt price ticker as RSC, fail (no continuous updates), show client-island fix.

---

## Sources

- Carl Mobarezi — RSC vs SSR (Medium)
- Tymek Zapała — 5 Differences Between RSC and SSR
- Nadia Makarevich — RSC Performance Benchmarks (developerway.com)
- Preply Engineering — INP Without RSC (Medium)
- Stack Overflow — RSC vs SSR Thread *(WebFetch blocked; search-reconstructed)*
- YouTube — "The Difference Between RSC & SSR" (xoi-bDY_gmU) *(transcript-blocked; search-reconstructed)*
- Josh Comeau — Making Sense of React Server Components
- Reddit r/reactjs — Server-Side Components Skepticism *(WebFetch blocked; search-reconstructed)*
- YouTube — Dan Abramov "React from Another Dimension" RemixConf 2023 (zMf_xeGPn6s) *(transcript-blocked; reconstructed via JS Party #311)*
