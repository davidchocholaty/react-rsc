import { describe, expect, it } from 'vitest'
import { mulberry32 } from '@/lib/prng'

describe('mulberry32', () => {
	it('returns floats in [0, 1)', () => {
		const rng = mulberry32(1)
		for (let i = 0; i < 200; i += 1) {
			const value = rng()
			expect(value).toBeGreaterThanOrEqual(0)
			expect(value).toBeLessThan(1)
		}
	})

	it('is deterministic given the same seed', () => {
		const a = mulberry32(0xcafebabe)
		const b = mulberry32(0xcafebabe)
		for (let i = 0; i < 100; i += 1) {
			expect(a()).toBe(b())
		}
	})

	it('produces independent streams for distinct seeds', () => {
		const a = mulberry32(1)
		const b = mulberry32(2)
		const seqA = Array.from({ length: 10 }, () => a())
		const seqB = Array.from({ length: 10 }, () => b())
		expect(seqA).not.toEqual(seqB)
	})

	it('handles seed 0 without collapsing to a single value', () => {
		const rng = mulberry32(0)
		const values = new Set(Array.from({ length: 32 }, () => rng()))
		expect(values.size).toBeGreaterThan(1)
	})
})
