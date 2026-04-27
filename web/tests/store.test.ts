import { describe, expect, it, vi } from 'vitest'
import { __testing } from '@/lib/store'

const { createHudStore } = __testing

describe('hudStore', () => {
	it('exposes immutable snapshots that update on set()', () => {
		const store = createHudStore()
		const before = store.getSnapshot()
		store.set('lcp', 1234)
		const after = store.getSnapshot()
		expect(after).not.toBe(before)
		expect(after.lcp).toBe(1234)
		expect(before.lcp).toBeUndefined()
	})

	it('notifies subscribers exactly once per actual change', () => {
		const store = createHudStore()
		const listener = vi.fn()
		store.subscribe(listener)
		store.set('lcp', 1234)
		expect(listener).toHaveBeenCalledTimes(1)
	})

	it('does not re-notify subscribers when the value is unchanged', () => {
		const store = createHudStore()
		store.set('lcp', 1234)
		const listener = vi.fn()
		store.subscribe(listener)
		store.set('lcp', 1234)
		expect(listener).not.toHaveBeenCalled()
	})

	it('stops notifying after unsubscribe', () => {
		const store = createHudStore()
		const listener = vi.fn()
		const unsubscribe = store.subscribe(listener)
		unsubscribe()
		store.set('lcp', 100)
		expect(listener).not.toHaveBeenCalled()
	})

	it('reset() restores the initial snapshot and notifies subscribers', () => {
		const store = createHudStore()
		store.set('lcp', 1234)
		const listener = vi.fn()
		store.subscribe(listener)
		store.reset()
		expect(store.getSnapshot().lcp).toBeUndefined()
		expect(listener).toHaveBeenCalledTimes(1)
	})

	it('returns a stable INITIAL reference for the server snapshot', () => {
		const store = createHudStore()
		expect(store.getServerSnapshot()).toBe(store.getServerSnapshot())
	})
})
