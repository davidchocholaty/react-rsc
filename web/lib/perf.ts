import { hudStore } from '@/lib/store'

/**
 * Performance helpers feeding the HUD store.
 *
 * web-vitals captures LCP/TTFB/INP/CLS/FCP via Next.js `useReportWebVitals`
 * (see DevHud). Hydration time and time-to-trade are not exposed by web-vitals
 * in App Router; we capture them with `performance.mark` / `performance.measure`
 * around the relevant boundaries. JS bytes shipped is derived by walking
 * `performance.getEntriesByType('resource')` and summing `.js` transferSize.
 */

export const HYDRATION_START = 'hud:hydration:start'
export const HYDRATION_END = 'hud:hydration:end'
export const CHART_HYDRATION_START = 'hud:chart-hydration:start'
export const CHART_HYDRATION_END = 'hud:chart-hydration:end'
export const TRADE_CLICK = 'hud:trade:click'
export const TRADE_COMMITTED = 'hud:trade:committed'

function hasPerformance(): boolean {
	return (
		typeof performance !== 'undefined' && typeof performance.mark === 'function'
	)
}

export function markHydrationStart(): void {
	if (!hasPerformance()) return
	performance.mark(HYDRATION_START)
}

export function markHydrationEnd(): void {
	if (!hasPerformance()) return
	performance.mark(HYDRATION_END)
	const measure = safeMeasure('hud:hydration', HYDRATION_START, HYDRATION_END)
	if (measure !== undefined) hudStore.set('hydrationMs', measure)
}

export function markChartHydrationStart(): void {
	if (!hasPerformance()) return
	performance.mark(CHART_HYDRATION_START)
}

export function markChartHydrationEnd(): void {
	if (!hasPerformance()) return
	performance.mark(CHART_HYDRATION_END)
	const measure = safeMeasure(
		'hud:chart-hydration',
		CHART_HYDRATION_START,
		CHART_HYDRATION_END
	)
	if (measure !== undefined) hudStore.set('chartHydrationMs', measure)
}

export function markTradeClick(): void {
	if (!hasPerformance()) return
	performance.mark(TRADE_CLICK)
}

export function markTradeCommitted(): void {
	if (!hasPerformance()) return
	performance.mark(TRADE_COMMITTED)
	const measure = safeMeasure('hud:trade', TRADE_CLICK, TRADE_COMMITTED)
	// markTradeCommitted may fire before markTradeClick on the very first paint
	// (e.g. an optimistic state seeded before the user has clicked). Clamp at 0
	// rather than reporting a negative time.
	if (measure !== undefined) hudStore.set('timeToTradeMs', Math.max(0, measure))
}

interface ResourceEntry {
	readonly name: string
	readonly transferSize?: number
	readonly encodedBodySize?: number
}

export function bytesShipped(): number {
	if (!hasPerformance() || typeof performance.getEntriesByType !== 'function') {
		return 0
	}
	const entries = performance.getEntriesByType(
		'resource'
	) as unknown as ReadonlyArray<ResourceEntry>
	let total = 0
	for (const entry of entries) {
		if (!entry.name.endsWith('.js')) continue
		// transferSize === 0 means the resource was served from cache; fall back
		// to encodedBodySize so the HUD reflects the bytes the page actually
		// uses, not just bytes that crossed the wire on this navigation.
		const transfer = entry.transferSize ?? 0
		total += transfer > 0 ? transfer : (entry.encodedBodySize ?? 0)
	}
	return total
}

function safeMeasure(
	name: string,
	startMark: string,
	endMark: string
): number | undefined {
	if (typeof performance.measure !== 'function') return undefined
	try {
		const measure = performance.measure(name, startMark, endMark)
		const duration =
			typeof measure?.duration === 'number'
				? measure.duration
				: extractDurationFallback(name)
		return Number.isFinite(duration) ? duration : undefined
	} catch {
		// Marks may be missing if the start mark hasn't fired yet (very early
		// in the page lifecycle). Swallow and try again on the next call.
		return undefined
	}
}

function extractDurationFallback(name: string): number | undefined {
	if (typeof performance.getEntriesByName !== 'function') return undefined
	const entries = performance.getEntriesByName(name, 'measure')
	const last = entries[entries.length - 1]
	return last && typeof last.duration === 'number' ? last.duration : undefined
}
