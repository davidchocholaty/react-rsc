'use client'

import { type FormEvent, useState } from 'react'
import { markTradeClick, markTradeCommitted } from '@/lib/perf'
import { feed } from '@/mocks/feed'

const PLACE_TRADE_LATENCY_MS = 600

interface SubmittedTrade {
	readonly side: 'buy' | 'sell'
	readonly size: number
	readonly price: number
	readonly tickId: number
}

async function placeTradeStub(): Promise<void> {
	// Step-1 baseline: trade placement is a plain client-side delay. Step-3
	// (U7) replaces this with a Server Action and useOptimistic so the click
	// feedback collapses to ~0ms.
	await new Promise((resolve) => setTimeout(resolve, PLACE_TRADE_LATENCY_MS))
}

export function OrderTicket() {
	const [side, setSide] = useState<'buy' | 'sell'>('buy')
	const [size, setSize] = useState('1')
	const [submitting, setSubmitting] = useState(false)
	const [last, setLast] = useState<SubmittedTrade | null>(null)
	const [error, setError] = useState<string | null>(null)

	async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
		event.preventDefault()
		setError(null)
		const parsed = Number.parseFloat(size)
		if (!Number.isFinite(parsed) || parsed <= 0) {
			setError('Size must be a positive number')
			return
		}

		markTradeClick()
		setSubmitting(true)
		try {
			await placeTradeStub()
			const snapshot = feed.getSnapshot()
			setLast({
				side,
				size: parsed,
				price: snapshot.price,
				tickId: snapshot.tickId
			})
			markTradeCommitted()
		} finally {
			setSubmitting(false)
		}
	}

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
					optimistic
				</span>
			</header>
			<form onSubmit={onSubmit} className="grid grid-cols-2 gap-2 text-xs">
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
						min="0"
						step="0.1"
						value={size}
						onChange={(event) => setSize(event.target.value)}
						className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 font-mono text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
					/>
				</label>
				<button
					type="submit"
					disabled={submitting}
					className="col-span-2 rounded bg-cyan-500/20 py-1.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/30 disabled:opacity-50"
				>
					{submitting ? 'sending…' : `Place ${side.toUpperCase()}`}
				</button>
			</form>
			{error ? <div className="text-[11px] text-rose-400">{error}</div> : null}
			{last ? (
				<div className="rounded border border-zinc-800 bg-zinc-950/60 p-2 font-mono text-[11px] tabular-nums text-zinc-300">
					last {last.side} · {last.size.toFixed(2)} @ {last.price.toFixed(2)}
					<span className="ml-2 text-zinc-500">tick #{last.tickId}</span>
				</div>
			) : null}
		</section>
	)
}
