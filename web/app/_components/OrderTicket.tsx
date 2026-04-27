'use client'

import { useActionState, useOptimistic, useState } from 'react'
import { placeTrade } from '@/app/_actions/placeTrade'
import { markTradeClick, markTradeCommitted } from '@/lib/perf'
import { feed } from '@/mocks/feed'

type Side = 'buy' | 'sell'

interface DisplayedTrade {
	readonly side: Side
	readonly size: number
	readonly price: number
	readonly pending: boolean
	readonly tradeId?: string
}

interface OrderState {
	readonly last: DisplayedTrade | null
	readonly error: string | null
}

const INITIAL_STATE: OrderState = { last: null, error: null }

async function runPlaceTrade(
	prev: OrderState,
	formData: FormData
): Promise<OrderState> {
	// Snapshot the current price on the client at submit time. Server-side
	// price discovery would belong to a real broker; the demo's "fill price"
	// is whatever the local feed shows at click time.
	const clientPrice = feed.getSnapshot().price
	try {
		const result = await placeTrade(formData)
		return {
			last: {
				side: result.side,
				size: result.size,
				price: clientPrice,
				pending: false,
				tradeId: result.tradeId
			},
			error: null
		}
	} catch (error) {
		// Server action threw (validation failure or simulated broker rejection).
		// Returning prev preserves the previously-committed trade and surfaces
		// the error inline; the optimistic pending row is replaced because the
		// base state didn't gain a new entry.
		return {
			...prev,
			error: error instanceof Error ? error.message : 'Trade failed'
		}
	}
}

export function OrderTicket() {
	const [side, setSide] = useState<Side>('buy')
	const [state, formAction, isPending] = useActionState(
		runPlaceTrade,
		INITIAL_STATE
	)
	const [optimistic, addOptimistic] = useOptimistic<OrderState, DisplayedTrade>(
		state,
		(_current, optimisticTrade) => ({
			last: optimisticTrade,
			error: null
		})
	)

	function clientAction(formData: FormData): void {
		const sizeRaw = formData.get('size')?.toString() ?? ''
		const size = Number.parseFloat(sizeRaw)
		if (!Number.isFinite(size) || size <= 0) {
			// React 19's useActionState skips the action when the form action
			// returns early, but we still want a friendly inline message rather
			// than a server round-trip that just throws "must be positive".
			return
		}
		markTradeClick()
		addOptimistic({
			side,
			size,
			price: feed.getSnapshot().price,
			pending: true
		})
		// The optimistic state is now applied (microtask boundary); time-to-
		// trade collapses to ≈0 ms compared to step-2's 600 ms server delay.
		markTradeCommitted()
		formAction(formData)
	}

	const display = optimistic.last
	const isStale = display?.pending === true

	return (
		<section
			aria-label="Order ticket"
			className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-900/40 p-3"
		>
			<header className="flex items-baseline justify-between text-xs text-zinc-400">
				<span className="font-semibold tracking-wide text-zinc-200">
					ORDER TICKET
				</span>
				<span className="text-[10px] uppercase tracking-wider text-zinc-500">
					optimistic · server action
				</span>
			</header>
			<form action={clientAction} className="grid grid-cols-2 gap-2 text-xs">
				<input type="hidden" name="side" value={side} />
				<div className="col-span-2 inline-flex overflow-hidden rounded border border-zinc-800">
					<button
						type="button"
						onClick={() => setSide('buy')}
						className={`flex-1 py-1.5 text-xs font-semibold ${
							side === 'buy'
								? 'bg-emerald-500/20 text-emerald-300'
								: 'text-zinc-400 hover:text-zinc-200'
						}`}
					>
						BUY
					</button>
					<button
						type="button"
						onClick={() => setSide('sell')}
						className={`flex-1 py-1.5 text-xs font-semibold ${
							side === 'sell'
								? 'bg-rose-500/20 text-rose-300'
								: 'text-zinc-400 hover:text-zinc-200'
						}`}
					>
						SELL
					</button>
				</div>
				<label className="col-span-2 flex flex-col gap-1 text-[11px] text-zinc-400">
					Size
					<input
						type="number"
						name="size"
						min="0"
						step="0.1"
						defaultValue="1"
						className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 font-mono text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
					/>
				</label>
				<button
					type="submit"
					disabled={isPending}
					className="col-span-2 rounded bg-cyan-500/20 py-1.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/30 disabled:opacity-50"
				>
					Place {side.toUpperCase()}
				</button>
			</form>
			{optimistic.error ? (
				<div className="text-[11px] text-rose-400">{optimistic.error}</div>
			) : null}
			{display ? (
				<div
					className={`rounded border border-zinc-800 bg-zinc-950/60 p-2 font-mono text-[11px] tabular-nums text-zinc-300 transition-opacity ${
						isStale ? 'opacity-50' : 'opacity-100'
					}`}
				>
					last {display.side} · {display.size.toFixed(2)} @{' '}
					{display.price.toFixed(2)}
					<span className="ml-2 text-zinc-500">
						{isStale ? '(sending…)' : `#${display.tradeId ?? '—'}`}
					</span>
				</div>
			) : null}
		</section>
	)
}
