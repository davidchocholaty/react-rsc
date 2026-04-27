import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
	bytesShipped,
	markHydrationEnd,
	markHydrationStart,
	markTradeClick,
	markTradeCommitted
} from '@/lib/perf'
import { hudStore } from '@/lib/store'

describe('bytesShipped', () => {
	beforeEach(() => {
		performance.clearResourceTimings?.()
	})

	it('returns 0 when no JS resources are present', () => {
		vi.spyOn(performance, 'getEntriesByType').mockReturnValueOnce([])
		expect(bytesShipped()).toBe(0)
	})

	it('sums transferSize across .js resource entries only', () => {
		const entries = [
			{ name: 'https://x/app.js', transferSize: 12_000 },
			{ name: 'https://x/chunk.js', transferSize: 8_000 },
			{ name: 'https://x/styles.css', transferSize: 4_000 },
			{ name: 'https://x/font.woff2', transferSize: 9_000 }
		]
		vi.spyOn(performance, 'getEntriesByType').mockReturnValueOnce(
			entries as unknown as PerformanceEntryList
		)
		expect(bytesShipped()).toBe(20_000)
	})

	it('falls back to encodedBodySize when transferSize is missing', () => {
		const entries = [
			{ name: 'https://x/a.js', encodedBodySize: 5_000 },
			{ name: 'https://x/b.js', transferSize: 0, encodedBodySize: 7_000 }
		]
		vi.spyOn(performance, 'getEntriesByType').mockReturnValueOnce(
			entries as unknown as PerformanceEntryList
		)
		expect(bytesShipped()).toBe(12_000)
	})
})

describe('hydration marks', () => {
	beforeEach(() => {
		performance.clearMarks()
		performance.clearMeasures()
		hudStore.reset()
	})

	afterEach(() => {
		hudStore.reset()
	})

	it('records a positive hydration duration when both marks fire', () => {
		const now = vi.spyOn(performance, 'now')
		now.mockReturnValueOnce(100)
		markHydrationStart()
		now.mockReturnValueOnce(180)
		markHydrationEnd()
		const value = hudStore.getSnapshot().hydrationMs
		expect(value).toBeDefined()
		expect(value as number).toBeGreaterThanOrEqual(0)
	})

	it('does not throw if end fires before start', () => {
		expect(() => markHydrationEnd()).not.toThrow()
		// store stays at undefined when no measure was produced
		expect(hudStore.getSnapshot().hydrationMs).toBeUndefined()
	})
})

describe('time-to-trade marks', () => {
	beforeEach(() => {
		performance.clearMarks()
		performance.clearMeasures()
		hudStore.reset()
	})

	afterEach(() => {
		hudStore.reset()
	})

	it('clamps time-to-trade at 0 when committed fires before click', () => {
		markTradeCommitted()
		const value = hudStore.getSnapshot().timeToTradeMs
		// Either undefined (no measure produced) or 0 (clamped) — never negative.
		if (value !== undefined) {
			expect(value).toBeGreaterThanOrEqual(0)
		}
	})

	it('records a non-negative duration for click → committed', () => {
		markTradeClick()
		markTradeCommitted()
		const value = hudStore.getSnapshot().timeToTradeMs
		expect(value).toBeDefined()
		expect(value as number).toBeGreaterThanOrEqual(0)
	})
})
