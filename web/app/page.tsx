'use client'

import { useEffect } from 'react'
import { NewsPanel } from '@/app/_components/NewsPanel'
import { OrderBook } from '@/app/_components/OrderBook'
import { OrderTicket } from '@/app/_components/OrderTicket'
import { PriceChart } from '@/app/_components/PriceChart'
import { RecentTrades } from '@/app/_components/RecentTrades'
import { markHydrationEnd, markHydrationStart } from '@/lib/perf'

// Step-1 baseline: page is a client component; every panel below is also a
// client island. The shape is the lesson — U6 lifts shell + slow panels back
// to the server.
export default function DashboardPage() {
	useEffect(() => {
		markHydrationStart()
		markHydrationEnd()
	}, [])

	return (
		<main className="grid min-h-screen grid-cols-1 gap-3 p-4 lg:grid-cols-2">
			<DashboardHeader />
			<PriceChart />
			<OrderBook />
			<OrderTicket />
			<NewsPanel />
			<div className="lg:col-span-2">
				<RecentTrades />
			</div>
		</main>
	)
}

function DashboardHeader() {
	return (
		<header className="flex items-baseline justify-between rounded-md border border-zinc-800 bg-zinc-900/40 px-4 py-2 lg:col-span-2">
			<div>
				<h1 className="text-sm font-semibold tracking-wide text-zinc-100">
					RSC Trading Dashboard
				</h1>
				<p className="text-[11px] text-zinc-500">
					symbol: BRNO/EUR · session demo · step-1-naive-csr
				</p>
			</div>
			<span className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-amber-400">
				naive CSR
			</span>
		</header>
	)
}
