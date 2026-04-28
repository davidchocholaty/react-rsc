# Capture session — at-home prep for React Brno

Single playbook for everything you need to record before stage. Two outputs:

- **5 video clips + 1 screenshot pair** that get embedded in the Canva deck (mandatory — replaces all live demos)
- **(Optional) HUD measurements** for slide 12 if you want your own numbers alongside Makarevich's

| Scope | Time |
|---|---|
| Clips only | ~45 min |
| Clips + minimum measurements (steps 1+2 LCP for slide 12 row 1→2) | ~60 min |
| Clips + full PROTOCOL.md measurements (all 5 steps × N=5) | ~150 min |

**Recommended: clips only.** Measurements are bonus credibility for slide 12. The deck does not depend on them.

---

## Pre-flight (10 min, do once)

1. **Plug in laptop.** Battery silently throttles CPU and invalidates the run.
2. **Quit everything else.** Slack, Cursor, Spotify, Docker, other browsers — background load skews variance more than network throttling does.
3. **Use a clean Chrome profile** (or Incognito). Extensions skew `jsBytes` — even adblock.
4. **Verify HUD env:** `cat web/.env.local` should show `NEXT_PUBLIC_HUD=1`.
5. **Configure DevTools once and don't touch it:**
   - Open DevTools (Cmd+Opt+I)
   - Network tab → ☑ Disable cache → throttling dropdown → **Slow 4G**
   - Performance tab → CPU dropdown → **6× slowdown**
   - Leave DevTools docked in the same position for every clip
6. **Open QuickTime:** File → New Screen Recording → "Selection" mode framing the Chrome window (omit OS menu bar for cleaner clips). Don't start recording yet.

---

## Capture pattern (every step follows this shape)

```
pnpm demo:N:prod                  # rebuild + start, ~30–60 s
# ─ clip ──────────────────────────────────
1. hard reload (Cmd+Shift+R)
2. start QuickTime recording
3. wait / interact per step (specifics below)
4. stop, Cmd+T to trim to ~10–15 s, export step-N.mov
# ─ measurement (optional, ×3 cold runs) ──
for run in 1..3:
  hard reload
  wait ~15 s for HUD's lcp row to stop changing
  click somewhere (populates inp; for steps 3+, click Place BUY)
  DevTools Console: copy(JSON.stringify(__hudStore.getSnapshot(), null, 2))
  paste into docs/talk/measurements/measurements.json → step{N}.runs[]
# ─ stop server ───────────────────────────
Ctrl+C
```

---

## Step 1 — slow CSR baseline (~5 min)

```bash
pnpm demo:1:prod
```

**Clip — `step-1.mov`:** hard reload, hold ~15 s, watch slow paint and HUD's slow LCP fill in.

**Measurement focus:** this is the baseline LCP for slide 12's 1→2 row.

---

## Step 2 — Suspense + streaming (~5 min)

```bash
pnpm demo:2:prod
```

**Clip — `step-2.mov`:** hard reload, record the **full reveal** — shell paints first → skeletons → real panels stream in. The reveal IS the lesson.

**Measurement focus:** the LCP improvement vs step 1 is the slide 12 row 1→2 number.

---

## Step 3 — optimistic UI (~5 min)

```bash
pnpm demo:3:prod
```

**Clip — `step-3.mov`:** hard reload, wait for full paint, then click **Place BUY** 2–3× with ~1–2 s gaps. Trim to start ~1 s before the first click.

**Measurement note:** click Place BUY once before each measurement capture — that's what populates `timeToTradeMs` in the snapshot. Step 1 doesn't have this metric instrumented; skip the timeToTrade field for step 1 captures.

---

## Step 4 — RSC at the leaves (~10 min — most setup work)

The headline visual for slide 11 is the **DevTools Coverage diff**, not the clip. Do this in two halves:

### Headline visual — `coverage-3-vs-4.png`

1. With step 4 running (you're already there), open DevTools → Coverage tab. (If hidden: ⋮ menu → More tools → Coverage.)
2. Click "Start instrumenting coverage and reload page". Wait for reload to complete.
3. Screenshot the Coverage panel showing total JS bytes (Cmd+Shift+4 region). Save as `coverage-step-4.png`.
4. Ctrl+C the step-4 server.
5. `pnpm demo:3:prod`. Repeat steps 1–3. Save as `coverage-step-3.png`.
6. Compose side-by-side in Preview (or any image editor): step 3 left, step 4 right. Output: `coverage-3-vs-4.png`. Annotate the JS-bytes-dropped delta in red if you want.

### Optional clip — `step-4.mov`

With step 4 running again (or skip if you already moved on), record ~10 s of cold reload showing the dashboard painting with the smaller bundle. Useful but not required — the Coverage screenshot carries slide 11.

---

## Step 13 — WebSocket-as-RSC failure (~10 min — branch switching)

```bash
git switch -C live-5a step-5a-rsc-ws-fail
pnpm install --frozen-lockfile
pnpm --filter @purple-stack/web build
pnpm --filter @purple-stack/web start
```

**Clip — `step-13.mov`:** hard reload. The order book panel hangs on Suspense fallback "awaiting first ws message…" while the rest of the dashboard renders normally. Hold ~12 s — let the audience see the order book *never resolves*.

**Screenshot — `step-13-orderbook-hang.png`:** same frame as the clip, captured as a still image (Cmd+Shift+4 area). Used as the slide-13 fallback if Canva inline video fails on stage.

**Switch back:** `git switch -`

---

## (Optional) Aggregate measurements — only if you captured runs

```bash
node docs/talk/measurements/summarize.mjs
```

Walks `measurements.json`, computes the median of each metric per step, writes back into the `summary` blocks. Reports which slots got summaries.

Update `_meta` in `measurements.json`:

```json
"capturedBy": "David Chocholatý",
"capturedAt": "2026-04-27",
"hardware": "MacBook Pro M4 Pro, 24 GB"
```

Commit `measurements.json`. If you want to add your numbers as a column on slide 12, restore the second column to that table with your medians.

### What subset earns what on slide 12

| Slide-12 row | Captures needed | Effort |
|---|---|---|
| 1→2 LCP delta | Step 1 + Step 2 cold reloads (×3 each) | ~10 min |
| 2→3 time-to-trade | None — qualitative ("visible in `step-3.mov`") | 0 min |
| 3→4 jsBytes drop | Step 3 + Step 4 cold reloads (×3 each), or just Coverage screenshot | covered above |
| warm reload CSR vs RSC | Step 5b CSR + RSC × cold + warm × ×3 = 12 captures | ~30 min |

The **minimum-effort, highest-credibility addition** is just steps 1+2 with N=3 — that gives you the LCP row alongside Makarevich's number.

---

## Drop assets into Canva

1. Open the deck `react_brno`.
2. Per slide with an embedded clip (slides 6, 7, 8, 11 optional, 13): Uploads tab → upload `.mov` → drag onto slide → right-click → "Auto play on slide enter".
3. Same flow for static images: `coverage-3-vs-4.png` (slide 11), `step-13-orderbook-hang.png` (slide 13 fallback).
4. Test in Presenter Mode (Present → Standard) — confirm clips auto-play and don't lag on slide change.

---

## Troubleshooting

- **HUD's LCP row stays "—"** → click anywhere on the page or scroll. LCP fires on the first largest paint event after observer starts.
- **`__hudStore` is `undefined` in DevTools Console** → check `NEXT_PUBLIC_HUD=1` in `web/.env.local`, restart `pnpm demo:N:prod`.
- **`timeToTradeMs` is undefined for step 3+ captures** → must click Place BUY before capturing the snapshot.
- **`pnpm demo:N:prod` clobbers your working tree** → it runs `git switch -C live-N`. Stash uncommitted edits before each step.
- **Clip is too large for Canva** → QuickTime → File → Export As → 720p. Should drop most clips below 10 MB.
- **Run-to-run variance >2×** → discard the outlier, run a 6th capture. Web Vitals are inherently noisy under throttling — that's why median > mean.
- **Coverage tab shows 0 bytes** → click "Start instrumenting" *then* reload. Coverage only records during instrumentation.

---

## Output checklist

After the capture session you should have:

- [ ] `step-1.mov` — slow paint under throttling
- [ ] `step-2.mov` — streaming reveal
- [ ] `step-3.mov` — Place BUY clicks with instant feedback
- [ ] `step-4.mov` — *optional* — cold reload with smaller bundle
- [ ] `coverage-3-vs-4.png` — DevTools Coverage diff (mandatory for slide 11)
- [ ] `step-13.mov` — order book hung in Suspense
- [ ] `step-13-orderbook-hang.png` — same frame as still image (clip fallback)
- [ ] *(optional)* populated `runs[]` in `measurements.json` + `summary` blocks via `summarize.mjs`

Then transcribe + drop into Canva, rehearse, ship.
