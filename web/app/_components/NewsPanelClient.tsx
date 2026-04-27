'use client'

import { useEffect, useState } from 'react'

interface NewsItem {
	readonly id: string
	readonly timestamp: string
	readonly headline: string
	readonly body: string
}

const CSR_FETCH_LATENCY_MS = 50

/**
 * Honest-limits (b) — CSR cached vs RSC reload.
 *
 * Mirrors NewsPanel's RSC output but ships the rendering + the JSON on the
 * client bundle. Once the page is in cache, warm reload is essentially free —
 * which is the point of the demo: a 50 ms client-cache hit can outpace a
 * 700 ms RSC stream when the server has no caching layer in front of it.
 */
export function NewsPanelClient() {
	const [items, setItems] = useState<readonly NewsItem[] | null>(null)

	useEffect(() => {
		let cancelled = false
		const id = window.setTimeout(async () => {
			const mod = await import('@/mocks/news.json')
			if (cancelled) return
			setItems(mod.default as NewsItem[])
		}, CSR_FETCH_LATENCY_MS)
		return () => {
			cancelled = true
			window.clearTimeout(id)
		}
	}, [])

	return (
		<section
			aria-label="News and research"
			className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-900/40 p-3"
		>
			<header className="flex items-baseline justify-between text-xs text-zinc-400">
				<span className="font-semibold tracking-wide text-zinc-200">
					NEWS / RESEARCH
				</span>
				<span className="text-[10px] uppercase tracking-wider text-amber-400">
					CSR · client-fetched
				</span>
			</header>
			<ul className="flex max-h-[280px] flex-col gap-2 overflow-auto pr-1 text-xs">
				{items === null
					? Array.from({ length: 4 }, (_, index) => (
							<li
								key={`csr-news-skeleton-${index}`}
								className="h-14 rounded border border-zinc-800/70 bg-zinc-950/40"
							/>
						))
					: items.map((item) => (
							<li
								key={item.id}
								className="rounded border border-zinc-800/70 bg-zinc-950/40 p-2"
							>
								<div className="flex items-baseline gap-2 text-[10px] text-zinc-500">
									<span className="font-mono">{item.timestamp}</span>
								</div>
								<div className="mt-1 text-zinc-100">{item.headline}</div>
								<p className="mt-1 text-[11px] leading-snug text-zinc-400">
									{item.body}
								</p>
							</li>
						))}
			</ul>
		</section>
	)
}
