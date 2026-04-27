'use server'

import { z } from 'zod'

const PlaceTradeSchema = z.object({
	side: z.enum(['buy', 'sell']),
	size: z.coerce.number().positive()
})

export interface PlaceTradeResult {
	readonly ok: true
	readonly tradeId: string
	readonly side: 'buy' | 'sell'
	readonly size: number
	readonly serverTimestamp: number
}

const SERVER_LATENCY_MS = 600

let sequence = 0

function nextTradeId(): string {
	sequence += 1
	return `t-${sequence.toString(36).padStart(4, '0')}`
}

/**
 * Step-3 server action. Validates with Zod and *throws* on failure so that
 * useOptimistic auto-reverts the pending UI — the talk's optimistic-rollback
 * lesson depends on this contract.
 *
 * The wrong-way pattern (returning `{ ok: false }` and leaving optimistic state
 * stuck) is deliberately demonstrated in step-5 as the honest-limits beat.
 */
export async function placeTrade(
	formData: FormData
): Promise<PlaceTradeResult> {
	const parsed = PlaceTradeSchema.safeParse({
		side: formData.get('side'),
		size: formData.get('size')
	})
	if (!parsed.success) {
		const message = parsed.error.issues[0]?.message ?? 'Invalid trade input'
		throw new Error(message)
	}

	await new Promise((resolve) => setTimeout(resolve, SERVER_LATENCY_MS))

	return {
		ok: true,
		tradeId: nextTradeId(),
		side: parsed.data.side,
		size: parsed.data.size,
		serverTimestamp: Date.now()
	}
}
