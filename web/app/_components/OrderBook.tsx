'use client'

import { useEffect, useState } from 'react'
import { feed } from '@/mocks/feed'
import type { BookSnapshot } from '@/mocks/seed'

const VISIBLE_LEVELS = 8

export function OrderBook() {
	const [book, setBook] = useState<BookSnapshot | null>(null)

	useEffect(() => {
		setBook(feed.getSnapshot().book)
		return feed.subscribe('book', (snapshot) => {
			setBook(snapshot)
		})
	}, [])

	return (
		<section
			aria-label="Order book"
			className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-900/40 p-3"
		>
			<header className="flex items-baseline justify-between text-xs text-zinc-400">
				<span className="font-semibold tracking-wide text-zinc-200">
					ORDER BOOK
				</span>
				<span className="text-[10px] uppercase tracking-wider text-zinc-500">
					client + ws-style
				</span>
			</header>
			<div className="grid grid-cols-2 gap-2 font-mono text-[11px] tabular-nums">
				<div>
					<div className="mb-1 text-[10px] uppercase tracking-wider text-zinc-500">
						BIDS
					</div>
					{book ? (
						book.bids.slice(0, VISIBLE_LEVELS).map((level) => (
							<div
								key={`bid-${level.price}`}
								className="flex justify-between text-emerald-400"
							>
								<span>{level.price.toFixed(2)}</span>
								<span className="text-zinc-400">{level.size.toFixed(2)}</span>
							</div>
						))
					) : (
						<EmptyRows />
					)}
				</div>
				<div>
					<div className="mb-1 text-[10px] uppercase tracking-wider text-zinc-500">
						ASKS
					</div>
					{book ? (
						book.asks.slice(0, VISIBLE_LEVELS).map((level) => (
							<div
								key={`ask-${level.price}`}
								className="flex justify-between text-rose-400"
							>
								<span>{level.price.toFixed(2)}</span>
								<span className="text-zinc-400">{level.size.toFixed(2)}</span>
							</div>
						))
					) : (
						<EmptyRows />
					)}
				</div>
			</div>
		</section>
	)
}

function EmptyRows() {
	return (
		<div className="space-y-1">
			{Array.from({ length: VISIBLE_LEVELS }, (_, index) => (
				<div key={`empty-${index}`} className="h-3 rounded bg-zinc-800/40" />
			))}
		</div>
	)
}
