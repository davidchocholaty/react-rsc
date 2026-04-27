import { Suspense } from 'react'
import { NewsPanel, NewsPanelSkeleton } from '@/app/_components/NewsPanel'
import {
	OrderBookRsc,
	OrderBookRscFallback
} from '@/app/_components/OrderBookRsc'
import { OrderTicket } from '@/app/_components/OrderTicket'
import { PriceChart } from '@/app/_components/PriceChart'
import {
	RecentTrades,
	RecentTradesSkeleton
} from '@/app/_components/RecentTrades'

// SSG can't complete when an async RSC never resolves — that's the *demo* in
// dev/runtime, but it would lock `next build` indefinitely and make the tag
// hard to reproduce. Force dynamic rendering so build skips static gen and
// the failure shows up only when a request hits it (which is the intent).
export const dynamic = 'force-dynamic'

// step-5a — failed attempt. The order book is rendered as an async RSC that
// awaits a "first WebSocket message". The Suspense boundary hangs on stage,
// teaching that RSC streams a single response per request and is structurally
// unsuited to long-lived push channels. The fix lands at step-5-honest-limits
// where OrderBook returns to its client-island form.
export default function DashboardPage() {
	return (
		<main className="grid min-h-screen grid-cols-1 gap-3 p-4 lg:grid-cols-2">
			<DashboardHeader />
			<PriceChart />
			<Suspense fallback={<OrderBookRscFallback />}>
				<OrderBookRsc />
			</Suspense>
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
					symbol: BRNO/EUR · session demo · step-5a-rsc-ws-fail
				</p>
			</div>
			<span className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-rose-400">
				ws-as-rsc fail
			</span>
		</header>
	)
}
