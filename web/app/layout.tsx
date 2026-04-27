'use client'

import type { ReactNode } from 'react'
import { DevHud } from '@/app/_components/DevHud'
import '@/styles/globals.css'

// Step-1 baseline: root layout is 'use client'. The metadata API requires a
// server file, so we inline <title>/<meta> into the document head instead —
// step-2 (U6) restores the metadata exports when layout returns to RSC and
// audiences see <head> shrink along with the JS bundle.
type RootLayoutProps = {
	children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang="en">
			<head>
				<title>RSC Trading Dashboard</title>
				<meta
					name="description"
					content="React Server Components demo for the React Brno talk: Streaming the Future."
				/>
				<meta name="theme-color" content="#0a0a0a" />
			</head>
			<body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
				{children}
				<DevHud />
			</body>
		</html>
	)
}
