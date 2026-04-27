# Measurement protocol — capturing the speed ladder for slide 18

Goal: capture stable, reproducible HUD readings for each of the 5 progression steps under matched throttling, so the talk's slide 18 has committed numbers (not just live values that vary on stage).

The HUD store is exposed globally as `__hudStore` (see `web/lib/store.ts:71-82`). All captures pull from there via the DevTools console.

---

## Pre-flight setup (do once before all captures)

1. **Enable the HUD** by ensuring `web/.env.local` contains:

   ```
   NEXT_PUBLIC_HUD=1
   ```

2. **Use a clean Chromium / Chrome profile** (or Incognito) so extensions don't add JS load. Close other tabs.

3. **Open DevTools → Network tab**, set throttling to **Slow 4G** (or the closest preset; Makarevich uses the same).
4. **DevTools → Performance → CPU**: set throttling to **6× slowdown** (matches Makarevich's lab settings).
5. **Disable cache** in the Network tab while measuring **cold** loads. Re-enable for **warm** loads.
6. Have this protocol open in a separate window (or printed) so you can paste readings into `measurements.json` between runs.

---

## The capture snippet (one-liner, paste into Console)

After every reload, **wait until LCP fires** (typically 5–10 s under throttling — the HUD's LCP row stops updating). Then in DevTools console:

```js
copy(JSON.stringify(__hudStore.getSnapshot(), null, 2))
```

This copies the full HUD snapshot to your clipboard as pretty-printed JSON. Paste it into the matching slot in `measurements.json`.

Snapshot shape (from `web/lib/store.ts`):

```ts
{
  lcp: number | undefined            // ms — Largest Contentful Paint
  ttfb: number | undefined           // ms — Time To First Byte
  fcp: number | undefined            // ms — First Contentful Paint
  inp: number | undefined            // ms — Interaction to Next Paint (only after first interaction)
  cls: number | undefined            // ratio — Cumulative Layout Shift
  jsBytes: number | undefined        // bytes — sum of .js transferSize from PerformanceResourceTiming
  hydrationMs: number | undefined    // ms — root hydration boundary (see web/lib/perf.ts)
  chartHydrationMs: number | undefined  // ms — chart-component hydration
  timeToTradeMs: number | undefined  // ms — Place BUY click → optimistic commit
}
```

Some fields will be `undefined` per step because earlier steps don't yet have the corresponding instrumentation. That's expected — record them as `undefined` (becomes `null` in JSON) and the speed-ladder script ignores them.

---

## Run protocol — 5 runs per step, take median

For each step, do **5 cold reloads** and record each snapshot. Take the **median** as the reported value. Throw out the slowest run if it's a clear outlier (>2× the median).

Why 5 runs: Web Vitals are noisy at the single-run level. Median-of-5 gives stability without burning your evening.

---

## Step 1 — `step-1-naive-csr` (CSR baseline)

**Start the app:**

```bash
pnpm demo:1:prod
```

Wait for `next start` to print "Ready". Open `http://localhost:3000` (or whatever port `next start` printed).

**Per run (×5):**

1. Open DevTools → Network → check "Disable cache" + Slow 4G + 6× CPU.
2. Hard reload (Cmd/Ctrl + Shift + R).
3. Wait ~10 s for HUD's LCP to settle.
4. Click **Place BUY** once. Wait for the row to settle (~600 ms after click). This populates `timeToTradeMs`.
5. Console: `copy(JSON.stringify(__hudStore.getSnapshot(), null, 2))`.
6. Paste into `measurements.json` → `step1.runs[N]`.

**Stop the app** (Ctrl+C) before moving on.

---

## Step 2 — `step-2-suspense-streaming`

```bash
pnpm demo:2:prod
```

Same protocol as step 1. The big metric to watch: secondary-content visible time (the news/recent-trades panels stream in). LCP should drop substantially vs. step 1.

---

## Step 3 — `step-3-optimistic-ui`

```bash
pnpm demo:3:prod
```

Same protocol. The big metric: `timeToTradeMs` should now read near 0. Click Place BUY 3× with ~2 s between clicks; the snapshot will reflect the most recent click. Capture after the last click.

---

## Step 4 — `step-4-rsc-boundary`

```bash
pnpm demo:4:prod
```

Same protocol. Watch `jsBytes` — should drop modestly vs. step 3. Also note **DevTools → Coverage** panel separately; screenshot it for slide 17.

---

## Step 5 — `step-5-honest-limits`

This step has three sub-protocols.

### 5a — WebSocket-as-RSC failure (qualitative; no metrics)

```bash
git switch -C live-5a step-5a-rsc-ws-fail
pnpm install --frozen-lockfile
pnpm --filter @purple-stack/web build
pnpm --filter @purple-stack/web start
```

Reload the page. The order-book panel hangs forever (Suspense fallback). **Screenshot this** for slide 23. There are no HUD numbers to capture — this is a regression demo.

Switch back: `git switch -` then `pnpm demo:5:prod`.

### 5b — cached CSR vs cold RSC

```bash
pnpm demo:5:prod
```

Run **two scenarios**, each with cold + warm reloads. **For warm reloads, uncheck "Disable cache" in Network.**

#### Scenario CSR (`?csr=1`)

1. Visit `http://localhost:3000/?csr=1`.
2. **Cold**: Disable cache, hard reload. Wait. `copy(JSON.stringify(__hudStore.getSnapshot()))`. Paste into `measurements.json` → `step5b.csr.cold.runs[N]`.
3. **Warm**: Re-enable cache, soft reload (F5). Wait. Capture into `step5b.csr.warm.runs[N]`.
4. Repeat 5×.

#### Scenario RSC (`?csr=0`)

5. Visit `http://localhost:3000/?csr=0`.
6. **Cold** + **Warm** as above. Capture into `step5b.rsc.cold.runs[N]` / `step5b.rsc.warm.runs[N]`.

The point: CSR's warm reload should beat RSC's cold reload by a wide margin, and even CSR's warm vs. RSC's warm should be close (Makarevich: 800 ms vs 750 ms — a margin so thin that without server caching it inverts).

### 5c — tick-rate stress (qualitative; client-side load)

```bash
pnpm demo:5:prod
```

Open `http://localhost:3000/?tick=5` in **3 tabs simultaneously**. After ~30 s, capture `__hudStore.getSnapshot()` from each tab. Numbers will be visibly worse than baseline. Save the three snapshots into `step5c.tabs[N]`. Take a screenshot for slide 25.

---

## After captures — integrate into the deck

1. Run `node docs/talk/measurements/summarize.mjs` (write this script if you want — see below) OR manually compute medians and fill `measurements.json` → `summary` block.
2. Update **slide 18 (Speed ladder)** in `canva-fill.md`. Replace each row's "Before → After" cell:
   - Steps 1→2: use your `step1.summary.lcpSecondary` → `step2.summary.lcpSecondary` (or whatever proxy makes sense for "secondary content visible time")
   - Steps 2→3: use your `step2.summary.timeToTradeMs` → `step3.summary.timeToTradeMs` (likely `~600 → ~0`)
   - Steps 3→4: use your `step3.summary.jsBytes` → `step4.summary.jsBytes` (in kB)
   - Step 5b: use your `step5b.csr.warm.summary.lcp` vs `step5b.rsc.warm.summary.lcp`
3. Commit `measurements.json` so the numbers are in version control. Slide 18 then cites "this codebase, captured 2026-04-XX, throttled Slow 4G + 6× CPU" alongside the Makarevich cross-reference.
4. **If your numbers diverge >50% from Makarevich's**: that's interesting and worth a callout, not a bug. Hardware varies. Trust your numbers, cite Makarevich's as cross-check.

---

## Optional: a tiny helper script

If you want to skip the manual median, here is a script you can drop into `docs/talk/measurements/summarize.mjs`:

```js
import { readFileSync, writeFileSync } from 'node:fs'

const data = JSON.parse(readFileSync('./measurements.json', 'utf8'))

function median(values) {
  const filtered = values.filter(v => typeof v === 'number')
  if (filtered.length === 0) return null
  const sorted = [...filtered].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

function summarizeRuns(runs) {
  if (!runs || runs.length === 0) return null
  const keys = ['lcp', 'ttfb', 'fcp', 'inp', 'cls', 'jsBytes', 'hydrationMs', 'chartHydrationMs', 'timeToTradeMs']
  return Object.fromEntries(keys.map(k => [k, median(runs.map(r => r[k]))]))
}

for (const stepKey of ['step1', 'step2', 'step3', 'step4']) {
  if (data[stepKey]?.runs) data[stepKey].summary = summarizeRuns(data[stepKey].runs)
}

if (data.step5b) {
  for (const variant of ['csr', 'rsc']) {
    for (const reload of ['cold', 'warm']) {
      if (data.step5b[variant]?.[reload]?.runs) {
        data.step5b[variant][reload].summary = summarizeRuns(data.step5b[variant][reload].runs)
      }
    }
  }
}

if (data.step5c?.tabs) data.step5c.summary = summarizeRuns(data.step5c.tabs)

writeFileSync('./measurements.json', JSON.stringify(data, null, 2) + '\n')
console.log('Summary block updated.')
```

Run from `docs/talk/measurements/`:

```bash
cd docs/talk/measurements
node summarize.mjs
```

---

## Troubleshooting

- **`__hudStore is undefined`** → the HUD didn't render. Check `NEXT_PUBLIC_HUD=1` in `web/.env.local`, restart `pnpm demo:N:prod`.
- **`lcp` is undefined after 30 s** → LCP only fires once a "largest contentful paint" exists. Make sure the page has actually rendered something visible.
- **`inp` always undefined** → INP fires on the first user interaction. Click anywhere on the page before capturing.
- **`timeToTradeMs` undefined on step 1** → step 1's order ticket doesn't instrument the trade-click marks. Skip this metric for step 1.
- **Numbers vary wildly between runs** → noisy signals are expected. That's why N=5 + median. If the run-to-run variance is >2×, increase to N=10.
