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
	const trades = await loadInitialTrades()
	return <RecentTradesShell trades={trades} live={false} />
}

interface RecentTradesShellProps {
	readonly trades: readonly Trade[]
	readonly live: boolean
}

export function RecentTradesShell({ trades, live }: RecentTradesShellProps) {
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
					{live ? 'RSC initial · client tail' : 'RSC streamed · Suspense'}
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
