'use client'

import {
	AreaSeries,
	createChart,
	type IChartApi,
	type ISeriesApi,
	type Time,
	type UTCTimestamp
} from 'lightweight-charts'
import { useLayoutEffect, useRef } from 'react'
import { markChartHydrationEnd, markChartHydrationStart } from '@/lib/perf'
import { mulberry32 } from '@/lib/prng'
import { feed } from '@/mocks/feed'
import { INITIAL_PRICE, roundTo2 } from '@/mocks/seed'

const HISTORY_POINTS = 60

interface ChartPoint {
	time: Time
	value: number
}

function seedHistory(startTime: number): ChartPoint[] {
	const rng = mulberry32(0xfeedface)
	let price = INITIAL_PRICE
	const points: ChartPoint[] = []
	for (let i = HISTORY_POINTS; i > 0; i -= 1) {
		const noise = 0.0025 * (rng() - 0.5)
		price = roundTo2(price * (1 + 0.0001 + noise))
		points.push({
			time: (startTime - i) as number as UTCTimestamp,
			value: price
		})
	}
	return points
}

export function PriceChart() {
	const containerRef = useRef<HTMLDivElement | null>(null)

	// StrictMode-safe single-effect pattern (per TradingView's advanced React
	// tutorial): create chart, add series, seed data, subscribe — all inside
	// one effect with a cleanup that tears it all down. A split create/data
	// effect would race because the data effect's `series` reference goes
	// stale across the StrictMode dev double-mount.
	useLayoutEffect(() => {
		const container = containerRef.current
		if (!container) return

		markChartHydrationStart()

		const chart: IChartApi = createChart(container, {
			autoSize: true,
			layout: {
				background: { color: 'transparent' },
				textColor: '#a1a1aa',
				fontSize: 11
			},
			grid: {
				vertLines: { color: 'rgba(255,255,255,0.04)' },
				horzLines: { color: 'rgba(255,255,255,0.04)' }
			},
			rightPriceScale: { borderColor: 'rgba(255,255,255,0.08)' },
			timeScale: {
				borderColor: 'rgba(255,255,255,0.08)',
				timeVisible: true,
				secondsVisible: false
			},
			crosshair: { mode: 0 }
		})

		const series: ISeriesApi<'Area'> = chart.addSeries(AreaSeries, {
			lineColor: '#22d3ee',
			topColor: 'rgba(34,211,238,0.4)',
			bottomColor: 'rgba(34,211,238,0.05)',
			lineWidth: 2,
			priceLineVisible: false
		})

		const startTime = Math.floor(Date.now() / 1000)
		series.setData(seedHistory(startTime))

		let lastTime = startTime
		const unsubscribe = feed.subscribe('price', (tick) => {
			lastTime += 1
			series.update({
				time: lastTime as UTCTimestamp,
				value: tick.price
			})
		})

		markChartHydrationEnd()

		return () => {
			unsubscribe()
			chart.remove()
		}
	}, [])

	return (
		<section
			aria-label="Price chart"
			className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-900/40 p-3"
		>
			<header className="flex items-baseline justify-between text-xs text-zinc-400">
				<span className="font-semibold tracking-wide text-zinc-200">PRICE</span>
				<span className="text-[10px] uppercase tracking-wider text-zinc-500">
					client island · lightweight-charts
				</span>
			</header>
			<div ref={containerRef} className="h-[280px] w-full" />
		</section>
	)
}
