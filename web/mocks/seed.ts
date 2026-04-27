import { mulberry32, type Rng } from '@/lib/prng'

export type Side = 'buy' | 'sell'

export interface BookLevel {
	readonly price: number
	readonly size: number
}

export interface BookSnapshot {
	readonly bids: readonly BookLevel[]
	readonly asks: readonly BookLevel[]
}

export interface Trade {
	readonly id: number
	readonly tickId: number
	readonly price: number
	readonly size: number
	readonly side: Side
}

export interface PriceTick {
	readonly tickId: number
	readonly price: number
}

export interface FeedSnapshot {
	readonly tickId: number
	readonly price: number
	readonly book: BookSnapshot
	readonly trades: readonly Trade[]
}

export const INITIAL_PRICE = 100
const BOOK_DEPTH = 10
const PRICE_STEP = 0.05
const MAX_TRADES = 50

export interface InitialState {
	readonly tickId: number
	readonly price: number
	readonly book: BookSnapshot
	readonly trades: readonly Trade[]
	readonly nextTradeId: number
}

export function createInitialState(seed: number): InitialState {
	const rng = mulberry32(seed)
	return {
		tickId: 0,
		price: INITIAL_PRICE,
		book: deriveBook(INITIAL_PRICE, rng),
		trades: [],
		nextTradeId: 0
	}
}

export function deriveBook(price: number, rng: Rng): BookSnapshot {
	const bids: BookLevel[] = []
	const asks: BookLevel[] = []
	for (let level = 1; level <= BOOK_DEPTH; level += 1) {
		bids.push({
			price: roundTo2(price - PRICE_STEP * level),
			size: roundTo2(1 + rng() * 9)
		})
		asks.push({
			price: roundTo2(price + PRICE_STEP * level),
			size: roundTo2(1 + rng() * 9)
		})
	}
	return { bids, asks }
}

export function appendTrade(
	trades: readonly Trade[],
	trade: Trade
): readonly Trade[] {
	const next = [trade, ...trades]
	return next.length > MAX_TRADES ? next.slice(0, MAX_TRADES) : next
}

export function roundTo2(value: number): number {
	return Math.round(value * 100) / 100
}

/**
 * Deterministically generate `count` historical trades from a seed. Used by
 * server components (RecentTrades RSC initial render) and the chart's history
 * pre-seed — both want stable output independent of the live feed singleton.
 */
export function generateTradeHistory(
	seed: number,
	count: number
): readonly Trade[] {
	const rng = mulberry32(seed)
	let price = INITIAL_PRICE
	const trades: Trade[] = []
	for (let i = 0; i < count; i += 1) {
		const noise = 0.0025 * (rng() - 0.5)
		price = roundTo2(price * (1 + 0.0001 + noise))
		const side: Side = rng() < 0.5 ? 'buy' : 'sell'
		const offset = side === 'buy' ? 0.05 : -0.05
		const size = roundTo2(0.5 + rng() * 4.5)
		trades.push({
			id: i,
			tickId: i + 1,
			price: roundTo2(price + offset),
			size,
			side
		})
	}
	return trades.reverse()
}
