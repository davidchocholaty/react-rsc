# Capture session — at-home prep for React Brno

Single playbook for everything you need to record before stage. Output: **5 video clips + 1 screenshot pair** that get embedded in the Canva deck (replaces all live demos).

**Total time:** ~45 min.

---

## Pre-flight (10 min, do once)

1. **Plug in laptop.** Battery silently throttles CPU and changes how the clips look.
2. **Quit everything else.** Slack, Cursor, Spotify, Docker, other browsers — background load adds visible jank to the recording.
3. **Use a clean Chrome profile** (or Incognito). Extensions add visible JS work — even adblock.
4. **Verify HUD env:** `cat web/.env.local` should show `NEXT_PUBLIC_HUD=1`.
5. **Configure DevTools once and don't touch it:**
   - Open DevTools (Cmd+Opt+I)
   - Network tab → ☑ Disable cache → throttling dropdown → **Slow 4G**
   - Performance tab → CPU dropdown → **6× slowdown**
   - Leave DevTools docked in the same position for every clip
6. **Open QuickTime:** File → New Screen Recording → "Selection" mode framing the Chrome window (omit OS menu bar for cleaner clips). Don't start recording yet.

The throttling matters because step 1's slowness, step 2's streaming reveal, and step 13's hang all need the *visual* of running under network/CPU pressure. Without throttling, a fast machine will paint these too quickly to read on stage.

---

## Capture pattern (every clip follows this shape)

```
pnpm demo:N:prod                  # rebuild + start, ~30–60 s
1. hard reload (Cmd+Shift+R)
2. start QuickTime recording
3. wait / interact per step (specifics below)
4. stop, Cmd+T to trim to ~10–15 s, export step-N.mov
Ctrl+C                            # stop server before next step
```

---

## Step 1 — `step-1.mov` (~5 min)

```bash
pnpm demo:1:prod
```

Hard reload, hold ~15 s. Watch the slow paint and HUD's slow LCP fill in. Trim to clean cuts on either side.

---

## Step 2 — `step-2.mov` (~5 min)

```bash
pnpm demo:2:prod
```

Hard reload, record the **full reveal** — shell paints first → skeletons → real panels stream in. The reveal IS the lesson; trim so the clip starts right before the reload.

---

## Step 3 — `step-3.mov` (~5 min)

```bash
pnpm demo:3:prod
```

Hard reload, wait for full paint, then click **Place BUY** 2–3× with ~1–2 s gaps. The pending row appears instantly each time. Trim to start ~1 s before the first click.

---

## Step 4 — Coverage screenshot pair (~10 min)

The headline visual for slide 11 is the **DevTools Coverage diff**, not a clip.

### `coverage-3-vs-4.png`

1. With step 4 still running: open DevTools → Coverage tab. (If hidden: ⋮ menu → More tools → Coverage.)
2. Click "Start instrumenting coverage and reload page". Wait for reload to complete.
3. Screenshot the Coverage panel showing total JS bytes (Cmd+Shift+4 region). Save as `coverage-step-4.png`.
4. Ctrl+C the step-4 server.
5. `pnpm demo:3:prod`. Repeat steps 1–3. Save as `coverage-step-3.png`.
6. Compose side-by-side in Preview (or any image editor): step 3 left, step 4 right. Output: `coverage-3-vs-4.png`. Annotate the JS-bytes-dropped delta in red if you want.

### Optional `step-4.mov`

With step 4 running again, record ~10 s of cold reload showing the dashboard painting with the smaller bundle. Useful but not required — the Coverage screenshot carries slide 11.

---

## Step 13 — `step-13.mov` + screenshot (~10 min)

```bash
git switch -C live-5a step-5a-rsc-ws-fail
pnpm install --frozen-lockfile
pnpm --filter @purple-stack/web build
pnpm --filter @purple-stack/web start
```

**Clip — `step-13.mov`:** hard reload. The order book panel hangs on Suspense fallback "awaiting first ws message…" while the rest of the dashboard renders normally. Hold ~12 s — let the audience see the order book *never resolves*.

**Screenshot — `step-13-orderbook-hang.png`:** same frame as the clip, captured as a still image (Cmd+Shift+4 area). Used as the slide-13 fallback if Canva inline video fails on stage.

**Switch back:**

```bash
git switch -
```

---

## Drop assets into Canva

1. Open the deck `react_brno`.
2. Per slide with an embedded clip (slides 6, 7, 8, 11 optional, 13): Uploads tab → upload `.mov` → drag onto slide → right-click → "Auto play on slide enter".
3. Same flow for static images: `coverage-3-vs-4.png` (slide 11), `step-13-orderbook-hang.png` (slide 13 fallback).
4. Test in Presenter Mode (Present → Standard) — confirm clips auto-play and don't lag on slide change.

---

## Troubleshooting

- **HUD's LCP row stays "—" in the recording** → click anywhere on the page or scroll. LCP fires on the first largest paint event after observer starts.
- **`__hudStore` is `undefined` if you check the console mid-clip** → `NEXT_PUBLIC_HUD=1` not set. Update `web/.env.local`, restart `pnpm demo:N:prod`.
- **`pnpm demo:N:prod` clobbers your working tree** → it runs `git switch -C live-N`. Stash or commit before running.
- **Clip is too large for Canva** → QuickTime → File → Export As → 720p. Should drop most clips below 10 MB.
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

Then transcribe + drop into Canva, rehearse, ship.
