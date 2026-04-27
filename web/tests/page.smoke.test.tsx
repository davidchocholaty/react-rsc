import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('lightweight-charts', () => ({
	createChart: () => ({
		addSeries: () => ({
			setData: () => undefined,
			update: () => undefined
		}),
		remove: () => undefined,
		applyOptions: () => undefined
	}),
	AreaSeries: 'AreaSeries',
	LineSeries: 'LineSeries'
}))

vi.mock('next/web-vitals', () => ({
	useReportWebVitals: () => undefined
}))

// RecentTrades is an async server component (await + setTimeout) — render its
// fallback skeleton synchronously in the smoke test so we can assert the page
// shape without driving an RSC pipeline through jsdom.
vi.mock('@/app/_components/RecentTrades', async () => {
	const actual = await vi.importActual<
		typeof import('@/app/_components/RecentTrades')
	>('@/app/_components/RecentTrades')
	return {
		...actual,
		RecentTrades: actual.RecentTradesSkeleton
	}
})

import DashboardPage from '@/app/page'

describe('dashboard page (step-2 smoke)', () => {
	beforeEach(() => {
		vi.stubEnv('NEXT_PUBLIC_HUD', '1')
	})

	afterEach(() => {
		cleanup()
		vi.unstubAllEnvs()
	})

	it('renders all five panel landmarks', () => {
		render(<DashboardPage />)
		expect(
			screen.getByRole('region', { name: /price chart/i })
		).toBeInTheDocument()
		expect(
			screen.getByRole('region', { name: /order book/i })
		).toBeInTheDocument()
		expect(
			screen.getByRole('region', { name: /order ticket/i })
		).toBeInTheDocument()
		expect(
			screen.getByRole('region', { name: /news and research/i })
		).toBeInTheDocument()
		expect(
			screen.getByRole('region', { name: /recent trades/i })
		).toBeInTheDocument()
	})
})
