import news from '@/mocks/news.json'

interface NewsItem {
	readonly id: string
	readonly timestamp: string
	readonly headline: string
	readonly body: string
}

const items = news as readonly NewsItem[]

export function NewsPanel() {
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
					RSC · server-fetched
				</span>
			</header>
			<ul className="flex max-h-[280px] flex-col gap-2 overflow-auto pr-1 text-xs">
				{items.map((item) => (
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

export function NewsPanelSkeleton() {
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
					streaming…
				</span>
			</header>
			<ul className="flex flex-col gap-2 text-xs">
				{Array.from({ length: 4 }, (_, index) => (
					<li
						key={`news-skeleton-${index}`}
						className="h-14 rounded border border-zinc-800/70 bg-zinc-950/40"
					/>
				))}
			</ul>
		</section>
	)
}
