'use client'

import { useEffect } from 'react'
import { DEFAULT_TICK_MS, feed } from '@/mocks/feed'

interface TickRateSyncerProps {
	readonly tickMs: number | undefined
}

/**
 * Honest-limits (c) — tick-rate stress.
 *
 * Reads ?tick=N from the URL via the parent server component and applies it
 * to the client-side mock feed. With tickMs=5 and three browser tabs open,
 * the audience watches the HUD numbers degrade — the lesson the plan calls
 * out as "RSC re-renders pile up on every request".
 *
 * Note: this is a *client* feed, so the load shows on the client first;
 * the plan's review surfaced this honestly. The metric the audience reads
 * on the HUD is real client work, not synthetic server load.
 */
export function TickRateSyncer({ tickMs }: TickRateSyncerProps) {
	useEffect(() => {
		const target =
			tickMs !== undefined && Number.isFinite(tickMs) && tickMs > 0
				? tickMs
				: DEFAULT_TICK_MS
		feed.setTickRate(target)
		return () => {
			feed.setTickRate(DEFAULT_TICK_MS)
		}
	}, [tickMs])
	return null
}
