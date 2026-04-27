import { Suspense } from 'react'
import { NewsPanel, NewsPanelSkeleton } from '@/app/_components/NewsPanel'
import { NewsPanelClient } from '@/app/_components/NewsPanelClient'
import { OrderBook } from '@/app/_components/OrderBook'
import { OrderTicket } from '@/app/_components/OrderTicket'
import { PriceChart } from '@/app/_components/PriceChart'
import {
	RecentTrades,
	RecentTradesSkeleton
} from '@/app/_components/RecentTrades'
import { RecentTradesClient } from '@/app/_components/RecentTradesClient'
import { TickRateSyncer } from '@/app/_components/TickRateSyncer'

interface DashboardSearchParams {
	readonly csr?: string
	readonly tick?: string
}

interface DashboardPageProps {
	readonly searchParams: Promise<DashboardSearchParams>
}

export default async function DashboardPage({
	searchParams
}: DashboardPageProps) {
	const params = await searchParams
	const csrMode = params.csr === '1'
	const tickMs = parseTickMs(params.tick)

	return (
		<main className="grid min-h-screen grid-cols-1 gap-3 p-4 lg:grid-cols-2">
			<TickRateSyncer tickMs={tickMs} />
			<DashboardHeader csrMode={csrMode} tickMs={tickMs} />
			<PriceChart />
			<OrderBook />
			<OrderTicket />
			{csrMode ? (
				<NewsPanelClient />
			) : (
				<Suspense fallback={<NewsPanelSkeleton />}>
					<NewsPanel />
				</Suspense>
			)}
			<div className="lg:col-span-2">
				{csrMode ? (
					<RecentTradesClient />
				) : (
					<Suspense fallback={<RecentTradesSkeleton />}>
						<RecentTrades />
					</Suspense>
				)}
			</div>
		</main>
	)
}

function parseTickMs(raw: string | undefined): number | undefined {
	if (raw === undefined) return undefined
	const parsed = Number.parseInt(raw, 10)
	if (!Number.isFinite(parsed) || parsed <= 0) return undefined
	return parsed
}

interface DashboardHeaderProps {
	readonly csrMode: boolean
	readonly tickMs: number | undefined
}

function DashboardHeader({ csrMode, tickMs }: DashboardHeaderProps) {
	const modeLabel = csrMode ? 'CSR · client cache' : 'RSC · server stream'
	const modeColor = csrMode ? 'text-amber-400' : 'text-violet-400'
	return (
		<header className="flex flex-wrap items-baseline justify-between gap-2 rounded-md border border-zinc-800 bg-zinc-900/40 px-4 py-2 lg:col-span-2">
			<div>
				<h1 className="text-sm font-semibold tracking-wide text-zinc-100">
					RSC Trading Dashboard
				</h1>
				<p className="text-[11px] text-zinc-500">
					symbol: BRNO/EUR · session demo · step-5-honest-limits
				</p>
			</div>
			<div className="flex items-center gap-2">
				{tickMs !== undefined ? (
					<span className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-rose-400">
						tick {tickMs} ms
					</span>
				) : null}
				<span
					className={`rounded border border-zinc-800 bg-zinc-950 px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${modeColor}`}
				>
					{modeLabel}
				</span>
			</div>
		</header>
	)
}
