import { TradesLiveTail } from '@/app/_components/TradesLiveTail'
import { generateTradeHistory, type Trade } from '@/mocks/seed'

const RECENT_TRADES_HISTORY_SEED = 0xbadcafe0
const VISIBLE_TRADES = 12
const SERVER_DELAY_MS = 800

async function loadInitialTrades(): Promise<readonly Trade[]> {
	// Simulated server-side data fetch. Step-2's lesson: with no Suspense, the
	// page waits 800 ms before painting; with Suspense, the static shell paints
	// in <100 ms and only this panel streams in 800 ms later.
	await new Promise((resolve) => setTimeout(resolve, SERVER_DELAY_MS))
	return generateTradeHistory(RECENT_TRADES_HISTORY_SEED, VISIBLE_TRADES)
}

export async function RecentTrades() {
	const initialTrades = await loadInitialTrades()
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
					RSC initial · client tail
				</span>
			</header>
			<TradesLiveTail initialTrades={initialTrades} />
		</section>
	)
}

export function RecentTradesSkeleton() {
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
					streaming…
				</span>
			</header>
			<div className="space-y-1">
				{Array.from({ length: 6 }, (_, index) => (
					<div
						key={`trades-skeleton-${index}`}
						className="h-3 rounded bg-zinc-800/40"
					/>
				))}
			</div>
		</section>
	)
}
