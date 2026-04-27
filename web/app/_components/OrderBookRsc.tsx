import type { BookSnapshot } from '@/mocks/seed'

/**
 * step-5a — the failed attempt.
 *
 * This is the wrong way to model a long-lived push channel inside React Server
 * Components: the order book is rendered as an async server component that
 * awaits a "WebSocket first message" before resolving. The talk's beat:
 *
 *   1. Speaker shows this code.
 *   2. Page hangs on the Suspense boundary (or buffers, then closes).
 *   3. Speaker says: RSC streams a single response per request. A WebSocket
 *      is bidirectional and long-lived. Trying to model the second with the
 *      first is a category error — the RSC boundary either never resolves
 *      or resolves once and stops, neither of which gives you a live book.
 *   4. Speaker switches to step-5-honest-limits and the working OrderBook
 *      client island returns.
 *
 * In practice we simulate the failure with a never-resolving Promise rather
 * than a real `ws` server so the failure mode reproduces consistently across
 * stage networks. The lesson is structural either way.
 */
async function awaitFirstWebSocketMessage(): Promise<BookSnapshot> {
	return new Promise<BookSnapshot>(() => {
		// Intentionally never resolves. Suspense holds the fallback indefinitely.
	})
}

export async function OrderBookRsc() {
	const book = await awaitFirstWebSocketMessage()
	return (
		<section
			aria-label="Order book"
			className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-900/40 p-3"
		>
			<header className="flex items-baseline justify-between text-xs text-zinc-400">
				<span className="font-semibold tracking-wide text-zinc-200">
					ORDER BOOK
				</span>
				<span className="text-[10px] uppercase tracking-wider text-rose-400">
					RSC · ws fail
				</span>
			</header>
			<div className="font-mono text-[11px] tabular-nums text-zinc-300">
				bids: {book.bids.length} · asks: {book.asks.length}
			</div>
		</section>
	)
}

export function OrderBookRscFallback() {
	return (
		<section
			aria-label="Order book"
			className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-900/40 p-3"
		>
			<header className="flex items-baseline justify-between text-xs text-zinc-400">
				<span className="font-semibold tracking-wide text-zinc-200">
					ORDER BOOK
				</span>
				<span className="text-[10px] uppercase tracking-wider text-rose-400">
					awaiting first ws message…
				</span>
			</header>
			<div className="space-y-1">
				{Array.from({ length: 8 }, (_, index) => (
					<div
						key={`order-book-rsc-skeleton-${index}`}
						className="h-3 rounded bg-zinc-800/40"
					/>
				))}
			</div>
		</section>
	)
}
