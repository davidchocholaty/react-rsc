'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { useEffect, useSyncExternalStore } from 'react'
import { bytesShipped } from '@/lib/perf'
import { type HudSnapshot, hudStore } from '@/lib/store'

const BYTES_REFRESH_MS = 1000

export function DevHud() {
	if (process.env.NEXT_PUBLIC_HUD !== '1') return null
	return <DevHudOverlay />
}

function DevHudOverlay() {
	useReportWebVitals((metric) => {
		switch (metric.name) {
			case 'LCP':
				hudStore.set('lcp', metric.value)
				return
			case 'TTFB':
				hudStore.set('ttfb', metric.value)
				return
			case 'FCP':
				hudStore.set('fcp', metric.value)
				return
			case 'INP':
				hudStore.set('inp', metric.value)
				return
			case 'CLS':
				hudStore.set('cls', metric.value)
				return
			default:
				return
		}
	})

	useEffect(() => {
		hudStore.set('jsBytes', bytesShipped())
		const id = window.setInterval(() => {
			hudStore.set('jsBytes', bytesShipped())
		}, BYTES_REFRESH_MS)
		return () => {
			window.clearInterval(id)
		}
	}, [])

	const snap = useSyncExternalStore(
		hudStore.subscribe,
		hudStore.getSnapshot,
		hudStore.getServerSnapshot
	)

	return (
		<aside
			aria-label="Performance HUD"
			className="pointer-events-none fixed right-3 bottom-3 z-50 flex flex-col gap-1 rounded-md border border-zinc-800 bg-black/80 p-4 font-mono text-base text-zinc-200 backdrop-blur"
		>
			<HudRow label="LCP" value={formatMs(snap.lcp)} />
			<HudRow label="INP" value={formatMs(snap.inp)} />
			<HudRow label="JS" value={formatBytes(snap.jsBytes)} />
			<HudRow label="TRADE" value={formatMs(snap.timeToTradeMs)} />
		</aside>
	)
}

interface HudRowProps {
	readonly label: string
	readonly value: string
}

function HudRow({ label, value }: HudRowProps) {
	return (
		<div className="flex items-baseline gap-4 tabular-nums">
			<span className="w-20 text-sm text-zinc-500 uppercase tracking-wider">
				{label}
			</span>
			<span className="text-2xl font-bold text-zinc-100">{value}</span>
		</div>
	)
}

export type { HudSnapshot }

function formatMs(value: number | undefined): string {
	if (value === undefined) return '—'
	return value < 10 ? `${value.toFixed(1)} ms` : `${Math.round(value)} ms`
}

function formatBytes(value: number | undefined): string {
	if (value === undefined) return '—'
	if (value < 1024) return `${value} B`
	if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} kB`
	return `${(value / (1024 * 1024)).toFixed(2)} MB`
}
