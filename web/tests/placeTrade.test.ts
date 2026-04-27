import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { placeTrade } from '@/app/_actions/placeTrade'

function asFormData(entries: Record<string, string>): FormData {
	const fd = new FormData()
	for (const [key, value] of Object.entries(entries)) {
		fd.set(key, value)
	}
	return fd
}

describe('placeTrade server action', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('returns a successful placement after the simulated server delay', async () => {
		const promise = placeTrade(asFormData({ side: 'buy', size: '1.5' }))
		await vi.advanceTimersByTimeAsync(600)
		const result = await promise
		expect(result.ok).toBe(true)
		expect(result.side).toBe('buy')
		expect(result.size).toBe(1.5)
		expect(result.tradeId).toMatch(/^t-/)
	})

	it('throws when side is invalid', async () => {
		await expect(
			placeTrade(asFormData({ side: 'sideways', size: '1' }))
		).rejects.toThrow(/Invalid|enum|expected/i)
	})

	it('throws when size is non-positive', async () => {
		await expect(
			placeTrade(asFormData({ side: 'buy', size: '0' }))
		).rejects.toThrow()
	})

	it('throws when size is missing', async () => {
		await expect(placeTrade(asFormData({ side: 'buy' }))).rejects.toThrow()
	})
})
