import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockFeed } from '@/mocks/feed'

describe('createMockFeed', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('emits one price tick per interval to subscribers', () => {
		const feed = createMockFeed({ seed: 1, tickRateMs: 100 })
		feed.start()
		const seen: number[] = []
		feed.subscribe('price', (tick) => seen.push(tick.price))

		vi.advanceTimersByTime(100)
		expect(seen).toHaveLength(1)
		expect(typeof seen[0]).toBe('number')

		vi.advanceTimersByTime(300)
		expect(seen).toHaveLength(4)
		feed.stop()
	})

	it('produces identical first 100 price ticks for the same seed', () => {
		const a = createMockFeed({ seed: 0xcafebabe, tickRateMs: 1 })
		const b = createMockFeed({ seed: 0xcafebabe, tickRateMs: 1 })
		const seenA: number[] = []
		const seenB: number[] = []
		a.subscribe('price', (t) => seenA.push(t.price))
		b.subscribe('price', (t) => seenB.push(t.price))
		a.start()
		b.start()
		vi.advanceTimersByTime(100)
		a.stop()
		b.stop()
		expect(seenA).toEqual(seenB)
		expect(seenA.length).toBeGreaterThanOrEqual(100)
	})

	it('halts emission when setTickRate(0) is called and resumes on >0', () => {
		const feed = createMockFeed({ seed: 1, tickRateMs: 100 })
		feed.start()
		const seen: number[] = []
		feed.subscribe('price', (t) => seen.push(t.price))

		vi.advanceTimersByTime(100)
		expect(seen).toHaveLength(1)

		feed.setTickRate(0)
		vi.advanceTimersByTime(500)
		expect(seen).toHaveLength(1)

		feed.setTickRate(50)
		vi.advanceTimersByTime(100)
		expect(seen.length).toBeGreaterThanOrEqual(3)
		feed.stop()
	})

	it('reset() restores the seeded initial state', () => {
		const feed = createMockFeed({ seed: 7, tickRateMs: 100 })
		feed.start()
		vi.advanceTimersByTime(500)
		const before = feed.getSnapshot()
		expect(before.tickId).toBeGreaterThan(0)

		feed.reset()
		const after = feed.getSnapshot()
		expect(after.tickId).toBe(0)
		expect(after.price).toBe(before.price === 100 ? before.price : 100)
		expect(after.trades).toEqual([])
		feed.stop()
	})

	it('stops calling a subscriber after unsubscribe', () => {
		const feed = createMockFeed({ seed: 1, tickRateMs: 100 })
		feed.start()
		const cb = vi.fn()
		const unsubscribe = feed.subscribe('price', cb)

		vi.advanceTimersByTime(200)
		expect(cb).toHaveBeenCalledTimes(2)

		unsubscribe()
		vi.advanceTimersByTime(500)
		expect(cb).toHaveBeenCalledTimes(2)
		feed.stop()
	})

	it('throws TypeError for unknown channels', () => {
		const feed = createMockFeed({ seed: 1, tickRateMs: 100 })
		expect(() => feed.subscribe('nope' as any, () => undefined)).toThrow(
			TypeError
		)
	})

	it('delivers ticks to two subscribers in the same order', () => {
		const feed = createMockFeed({ seed: 1, tickRateMs: 100 })
		feed.start()
		const a: number[] = []
		const b: number[] = []
		feed.subscribe('price', (t) => a.push(t.price))
		feed.subscribe('price', (t) => b.push(t.price))
		vi.advanceTimersByTime(500)
		expect(a).toEqual(b)
		expect(a.length).toBeGreaterThanOrEqual(5)
		feed.stop()
	})

	it('emits book snapshots with 10 bid and 10 ask levels', () => {
		const feed = createMockFeed({ seed: 1, tickRateMs: 100 })
		feed.start()
		let received: {
			bids: readonly unknown[]
			asks: readonly unknown[]
		} | null = null
		feed.subscribe('book', (snap) => {
			received = snap
		})
		vi.advanceTimersByTime(100)
		expect(received).not.toBeNull()
		const snap = received as unknown as {
			bids: readonly unknown[]
			asks: readonly unknown[]
		}
		expect(snap.bids).toHaveLength(10)
		expect(snap.asks).toHaveLength(10)
		feed.stop()
	})
})
