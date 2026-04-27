'use client'

import { useEffect, useState } from 'react'

interface NewsItem {
	readonly id: string
	readonly timestamp: string
	readonly headline: string
	readonly body: string
}

export function NewsPanel() {
	const [items, setItems] = useState<readonly NewsItem[] | null>(null)

	useEffect(() => {
		// Step-1 baseline: dynamic-imported in useEffect so the panel feels
		// "client-fetched". Step-2 (U6) lifts this to a server component that
		// imports the JSON statically — no waterfall, no client overhead.
		let cancelled = false
		;(async () => {
			const mod = await import('@/mocks/news.json')
			if (cancelled) return
			setItems(mod.default as NewsItem[])
		})()
		return () => {
			cancelled = true
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
				<span className="text-[10px] uppercase tracking-wider text-zinc-500">
					RSC target · client-fetched here
				</span>
			</header>
			<ul className="flex max-h-[280px] flex-col gap-2 overflow-auto pr-1 text-xs">
				{items === null ? (
					<NewsSkeleton />
				) : (
					items.map((item) => (
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
					))
				)}
			</ul>
		</section>
	)
}

function NewsSkeleton() {
	return (
		<>
			{Array.from({ length: 4 }, (_, index) => (
				<li
					key={`news-skeleton-${index}`}
					className="h-14 rounded border border-zinc-800/70 bg-zinc-950/40"
				/>
			))}
		</>
	)
}
