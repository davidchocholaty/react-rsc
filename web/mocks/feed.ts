import { mulberry32, type Rng } from '@/lib/prng'
import {
	appendTrade,
	type BookSnapshot,
	createInitialState,
	deriveBook,
	type FeedSnapshot,
	type PriceTick,
	roundTo2,
	type Side,
	type Trade
} from '@/mocks/seed'

export type Channel = 'price' | 'book' | 'trades'

export interface MockFeed {
	subscribe(ch: 'price', cb: (data: PriceTick) => void): () => void
	subscribe(ch: 'book', cb: (data: BookSnapshot) => void): () => void
	subscribe(ch: 'trades', cb: (data: Trade) => void): () => void
	setTickRate(rateMs: number): void
	reset(seed?: number): void
	getSnapshot(): FeedSnapshot
	start(): void
	stop(): void
}

export interface CreateFeedOptions {
	readonly seed?: number
	readonly tickRateMs?: number
}

export const DEFAULT_SEED = 0xcafebabe
export const DEFAULT_TICK_MS = 100
const VALID_CHANNELS: readonly Channel[] = ['price', 'book', 'trades']

const PRICE_DRIFT = 0.0001
const PRICE_SIGMA = 0.0025
const PRICE_MIN = 50
const PRICE_MAX = 200
const TRADE_PROBABILITY = 0.6

interface Subscribers {
	price: Set<(data: PriceTick) => void>
	book: Set<(data: BookSnapshot) => void>
	trades: Set<(data: Trade) => void>
}

function createSubscribers(): Subscribers {
	return { price: new Set(), book: new Set(), trades: new Set() }
}

interface FeedState {
	readonly tickId: number
	readonly price: number
	readonly book: BookSnapshot
	readonly trades: readonly Trade[]
	readonly nextTradeId: number
}

function nextPrice(price: number, rng: Rng): number {
	const noise = PRICE_SIGMA * (rng() - 0.5)
	const moved = price * (1 + PRICE_DRIFT + noise)
	return roundTo2(Math.min(PRICE_MAX, Math.max(PRICE_MIN, moved)))
}

function maybeTrade(
	rng: Rng,
	tickId: number,
	id: number,
	book: BookSnapshot
): Trade | undefined {
	if (rng() >= TRADE_PROBABILITY) return undefined
	const side: Side = rng() < 0.5 ? 'buy' : 'sell'
	const tradePrice = side === 'buy' ? book.asks[0].price : book.bids[0].price
	const size = roundTo2(0.5 + rng() * 4.5)
	return { id, tickId, price: tradePrice, size, side }
}

export function createMockFeed(options: CreateFeedOptions = {}): MockFeed {
	const initialSeed = options.seed ?? DEFAULT_SEED
	const initialTickMs = options.tickRateMs ?? DEFAULT_TICK_MS

	let rng: Rng = mulberry32(initialSeed)
	let state: FeedState = createInitialState(initialSeed)
	let subscribers: Subscribers = createSubscribers()
	let tickRateMs = initialTickMs
	let timer: ReturnType<typeof setInterval> | null = null

	function tick(): void {
		const price = nextPrice(state.price, rng)
		const book = deriveBook(price, rng)
		const trade = maybeTrade(rng, state.tickId + 1, state.nextTradeId, book)
		const trades = trade ? appendTrade(state.trades, trade) : state.trades

		state = {
			tickId: state.tickId + 1,
			price,
			book,
			trades,
			nextTradeId: trade ? state.nextTradeId + 1 : state.nextTradeId
		}

		for (const cb of subscribers.price) cb({ tickId: state.tickId, price })
		for (const cb of subscribers.book) cb(book)
		if (trade) for (const cb of subscribers.trades) cb(trade)
	}

	function start(): void {
		if (timer !== null || tickRateMs <= 0) return
		timer = setInterval(tick, tickRateMs)
	}

	function stop(): void {
		if (timer === null) return
		clearInterval(timer)
		timer = null
	}

	function setTickRate(rateMs: number): void {
		if (!Number.isFinite(rateMs) || rateMs < 0) {
			throw new TypeError(
				`setTickRate expects a non-negative finite number, got ${rateMs}`
			)
		}
		tickRateMs = rateMs
		stop()
		if (rateMs > 0) start()
	}

	function reset(seed: number = initialSeed): void {
		rng = mulberry32(seed)
		state = createInitialState(seed)
		// Subscribers persist across reset; the feed resumes emitting fresh
		// state to existing subscribers, which is the useful demo behavior.
	}

	function subscribe(ch: Channel, cb: (data: never) => void): () => void {
		if (!VALID_CHANNELS.includes(ch)) {
			throw new TypeError(`Unknown feed channel: ${String(ch)}`)
		}
		const set = subscribers[ch] as Set<(data: never) => void>
		set.add(cb)
		return () => {
			set.delete(cb)
		}
	}

	return {
		subscribe: subscribe as MockFeed['subscribe'],
		setTickRate,
		reset,
		getSnapshot: () => ({
			tickId: state.tickId,
			price: state.price,
			book: state.book,
			trades: state.trades
		}),
		start,
		stop
	}
}

declare global {
	// eslint-disable-next-line no-var
	var __mockFeed: MockFeed | undefined
}

/**
 * HMR-safe singleton. On every module evaluation (initial boot or Fast Refresh
 * save), we stop the prior generation's timer before installing a fresh feed.
 * Without this, each save accumulates a setInterval against a dead subscriber
 * list and on-stage HUD numbers double within a few rehearsal saves.
 */
function bootSingleton(): MockFeed {
	const g = globalThis as { __mockFeed?: MockFeed }
	if (g.__mockFeed) g.__mockFeed.stop()
	const next = createMockFeed()
	next.start()
	g.__mockFeed = next
	return next
}

export const feed: MockFeed = bootSingleton()
