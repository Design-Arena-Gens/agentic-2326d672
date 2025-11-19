import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Garden Style Questionnaire',
  description: 'AI-powered questionnaire to discover your perfect garden style',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
