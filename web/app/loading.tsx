export default function DashboardLoading() {
	return (
		<main className="grid min-h-screen grid-cols-1 gap-3 p-4 lg:grid-cols-2">
			<header className="lg:col-span-2 flex items-baseline justify-between rounded-md border border-zinc-800 bg-zinc-900/40 px-4 py-2">
				<div className="space-y-1">
					<div className="h-3 w-44 rounded bg-zinc-800" />
					<div className="h-2 w-64 rounded bg-zinc-800/60" />
				</div>
				<div className="h-4 w-24 rounded bg-zinc-800" />
			</header>
			<SkeletonPanel height="h-[300px]" label="PRICE" />
			<SkeletonPanel height="h-[300px]" label="ORDER BOOK" />
			<SkeletonPanel height="h-[200px]" label="ORDER TICKET" />
			<SkeletonPanel height="h-[200px]" label="NEWS" />
			<div className="lg:col-span-2">
				<SkeletonPanel height="h-[160px]" label="RECENT TRADES" />
			</div>
		</main>
	)
}

interface SkeletonPanelProps {
	readonly height: string
	readonly label: string
}

function SkeletonPanel({ height, label }: SkeletonPanelProps) {
	return (
		<section
			className={`rounded-md border border-zinc-800 bg-zinc-900/40 p-3 ${height}`}
			aria-busy
		>
			<div className="mb-2 text-[10px] uppercase tracking-wider text-zinc-600">
				{label}
			</div>
			<div className="h-full animate-pulse rounded bg-zinc-800/30" />
		</section>
	)
}
