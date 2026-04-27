/**
 * HUD store — single source of truth for the on-screen perf overlay. Consumed
 * via `useSyncExternalStore`. Snapshots are replaced (not mutated) on every
 * write so React notices via referential equality; identical writes are no-ops
 * so subscribers don't fire spuriously.
 */
export interface HudSnapshot {
	readonly lcp: number | undefined
	readonly ttfb: number | undefined
	readonly fcp: number | undefined
	readonly inp: number | undefined
	readonly cls: number | undefined
	readonly jsBytes: number | undefined
	readonly hydrationMs: number | undefined
	readonly chartHydrationMs: number | undefined
	readonly timeToTradeMs: number | undefined
}

const INITIAL: HudSnapshot = {
	lcp: undefined,
	ttfb: undefined,
	fcp: undefined,
	inp: undefined,
	cls: undefined,
	jsBytes: undefined,
	hydrationMs: undefined,
	chartHydrationMs: undefined,
	timeToTradeMs: undefined
}

type Listener = () => void

interface HudStore {
	getSnapshot(): HudSnapshot
	getServerSnapshot(): HudSnapshot
	subscribe(listener: Listener): () => void
	set<K extends keyof HudSnapshot>(key: K, value: HudSnapshot[K]): void
	reset(): void
}

function createHudStore(): HudStore {
	let state: HudSnapshot = INITIAL
	const listeners = new Set<Listener>()

	function emit(): void {
		for (const listener of listeners) listener()
	}

	return {
		getSnapshot: () => state,
		getServerSnapshot: () => INITIAL,
		subscribe(listener) {
			listeners.add(listener)
			return () => {
				listeners.delete(listener)
			}
		},
		set(key, value) {
			if (state[key] === value) return
			state = { ...state, [key]: value }
			emit()
		},
		reset() {
			if (state === INITIAL) return
			state = INITIAL
			emit()
		}
	}
}

declare global {
	// eslint-disable-next-line no-var
	var __hudStore: HudStore | undefined
}

function bootStore(): HudStore {
	const g = globalThis as { __hudStore?: HudStore }
	if (!g.__hudStore) g.__hudStore = createHudStore()
	return g.__hudStore
}

export const hudStore: HudStore = bootStore()

export const __testing = { createHudStore, INITIAL }
