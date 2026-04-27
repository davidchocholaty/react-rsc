import { Suspense } from 'react'
import { NewsPanel, NewsPanelSkeleton } from '@/app/_components/NewsPanel'
import { OrderBook } from '@/app/_components/OrderBook'
import { OrderTicket } from '@/app/_components/OrderTicket'
import { PriceChart } from '@/app/_components/PriceChart'
import {
	RecentTrades,
	RecentTradesSkeleton
} from '@/app/_components/RecentTrades'

// Step-2: page is a server component. Static shell paints immediately; slow
// async panels (news, recent-trades) suspend independently and stream in.
// Chart, order book, and order ticket remain 'use client' — they're truly
// interactive leaves and don't suspend at the server.
export default function DashboardPage() {
	return (
		<main className="grid min-h-screen grid-cols-1 gap-3 p-4 lg:grid-cols-2">
			<DashboardHeader />
			<PriceChart />
			<OrderBook />
			<OrderTicket />
			<Suspense fallback={<NewsPanelSkeleton />}>
				<NewsPanel />
			</Suspense>
			<div className="lg:col-span-2">
				<Suspense fallback={<RecentTradesSkeleton />}>
					<RecentTrades />
				</Suspense>
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
					symbol: BRNO/EUR · session demo · step-2-suspense-streaming
				</p>
			</div>
			<span className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-cyan-400">
				suspense streaming
			</span>
		</header>
	)
}
