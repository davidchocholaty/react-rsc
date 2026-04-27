import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DevHud } from '@/app/_components/DevHud'

vi.mock('next/web-vitals', () => ({
	useReportWebVitals: () => undefined
}))

describe('DevHud gating', () => {
	beforeEach(() => {
		vi.unstubAllEnvs()
	})

	afterEach(() => {
		cleanup()
		vi.unstubAllEnvs()
	})

	it('renders nothing when NEXT_PUBLIC_HUD is unset', () => {
		vi.stubEnv('NEXT_PUBLIC_HUD', '')
		const { container } = render(<DevHud />)
		expect(container).toBeEmptyDOMElement()
	})

	it('renders nothing when NEXT_PUBLIC_HUD is not "1"', () => {
		vi.stubEnv('NEXT_PUBLIC_HUD', '0')
		const { container } = render(<DevHud />)
		expect(container).toBeEmptyDOMElement()
	})

	it('renders the overlay when NEXT_PUBLIC_HUD is "1"', () => {
		vi.stubEnv('NEXT_PUBLIC_HUD', '1')
		render(<DevHud />)
		expect(
			screen.getByRole('complementary', { name: /performance hud/i })
		).toBeInTheDocument()
	})
})
