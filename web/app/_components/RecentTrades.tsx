'use client'

import { useEffect, useState } from 'react'
import { feed } from '@/mocks/feed'
import type { Trade } from '@/mocks/seed'

const VISIBLE_TRADES = 12

export function RecentTrades() {
	const [trades, setTrades] = useState<readonly Trade[]>(
		() => feed.getSnapshot().trades
	)

	useEffect(() => {
		setTrades(feed.getSnapshot().trades)
		return feed.subscribe('trades', (trade) => {
			setTrades((prev) => [trade, ...prev].slice(0, VISIBLE_TRADES))
		})
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
				<span className="text-[10px] uppercase tracking-wider text-zinc-500">
					RSC streamed · Suspense
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
					trades
						.slice(0, VISIBLE_TRADES)
						.map((trade) => <TradeRow key={trade.id} trade={trade} />)
				)}
			</div>
		</section>
	)
}

interface TradeRowProps {
	readonly trade: Trade
}

function TradeRow({ trade }: TradeRowProps) {
	const sideClass = trade.side === 'buy' ? 'text-emerald-400' : 'text-rose-400'
	return (
		<>
			<div className={sideClass}>{trade.side}</div>
			<div className="text-zinc-200">{trade.price.toFixed(2)}</div>
			<div className="text-zinc-300">{trade.size.toFixed(2)}</div>
			<div className="text-zinc-500">#{trade.tickId}</div>
		</>
	)
}
