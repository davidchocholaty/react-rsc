'use client'

import { useEffect, useState } from 'react'
import { feed } from '@/mocks/feed'
import { generateTradeHistory, type Trade } from '@/mocks/seed'

const CSR_FETCH_LATENCY_MS = 50
const HISTORY_SEED = 0xbadcafe0
const VISIBLE_TRADES = 12

/**
 * Honest-limits (b) — CSR variant of RecentTrades. Generates the same initial
 * slice that the RSC version awaits server-side, but does it in a single
 * client-side tick simulating a warm cache hit.
 */
export function RecentTradesClient() {
	const [trades, setTrades] = useState<readonly Trade[]>([])

	useEffect(() => {
		let cancelled = false
		const seedId = window.setTimeout(() => {
			if (cancelled) return
			setTrades(generateTradeHistory(HISTORY_SEED, VISIBLE_TRADES))
		}, CSR_FETCH_LATENCY_MS)
		const unsubscribe = feed.subscribe('trades', (trade) => {
			if (cancelled) return
			setTrades((prev) => [trade, ...prev].slice(0, VISIBLE_TRADES))
		})
		return () => {
			cancelled = true
			window.clearTimeout(seedId)
			unsubscribe()
		}
	}, [])

	return (
		<section
			aria-label="Recent trades"
			className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-900/40 p-3"
		>
			<header className="flex items-baseline justify-between text-xs text-zinc-400">
				<span className="font-semibold tracking-wide text-zinc-200">
					RECENT TRADES
				</span>
				<span className="text-[10px] uppercase tracking-wider text-amber-400">
					CSR · client-fetched
				</span>
			</header>
			<div className="grid grid-cols-[auto_1fr_auto_auto] gap-x-3 gap-y-1 font-mono text-[11px] tabular-nums">
				<div className="text-[10px] uppercase tracking-wider text-zinc-500">
					side
				</div>
				<div className="text-[10px] uppercase tracking-wider text-zinc-500">
					price
				</div>
				<div className="text-[10px] uppercase tracking-wider text-zinc-500">
					size
				</div>
				<div className="text-[10px] uppercase tracking-wider text-zinc-500">
					tick
				</div>
				{trades.length === 0 ? (
					<div className="col-span-4 text-zinc-600">awaiting prints…</div>
				) : (
					trades.map((trade) => {
						const sideClass =
							trade.side === 'buy' ? 'text-emerald-400' : 'text-rose-400'
						return (
							<div key={trade.id} className="contents">
								<div className={sideClass}>{trade.side}</div>
								<div className="text-zinc-200">{trade.price.toFixed(2)}</div>
								<div className="text-zinc-300">{trade.size.toFixed(2)}</div>
								<div className="text-zinc-500">#{trade.tickId}</div>
							</div>
						)
					})
				)}
			</div>
		</section>
	)
}
