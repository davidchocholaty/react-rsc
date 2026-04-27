import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { DevHud } from '@/app/_components/DevHud'
import '@/styles/globals.css'

export const metadata: Metadata = {
	title: 'RSC Trading Dashboard',
	description:
		'React Server Components demo for the React Brno talk: Streaming the Future.'
}

export const viewport: Viewport = {
	themeColor: '#0a0a0a'
}

type RootLayoutProps = {
	children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang="en">
			<body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
				{children}
				<DevHud />
			</body>
		</html>
	)
}
