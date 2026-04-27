'use client'

import { useEffect, useState } from 'react'
import { feed } from '@/mocks/feed'
import type { Trade } from '@/mocks/seed'

const VISIBLE_TRADES = 12

interface TradesLiveTailProps {
	readonly initialTrades: readonly Trade[]
}

/**
 * Tiny client island that owns only the live-tail behavior. The wrapping
 * section, header, and initial slice are rendered by the parent RSC — keeping
 * the client surface to the smallest piece that actually needs subscriptions.
 */
export function TradesLiveTail({ initialTrades }: TradesLiveTailProps) {
	const [trades, setTrades] = useState<readonly Trade[]>(initialTrades)

	useEffect(() => {
		return feed.subscribe('trades', (trade) => {
			setTrades((prev) => [trade, ...prev].slice(0, VISIBLE_TRADES))
		})
	}, [])

	return (
		<div className="grid grid-cols-[auto_1fr_auto_auto] gap-x-3 gap-y-1 font-mono text-[11px] tabular-nums">
			<HeaderRow />
			{trades.length === 0 ? (
				<div className="col-span-4 text-zinc-600">awaiting prints…</div>
			) : (
				trades.map((trade) => <TradeRow key={trade.id} trade={trade} />)
			)}
		</div>
	)
}

function HeaderRow() {
	return (
		<>
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
		</>
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
