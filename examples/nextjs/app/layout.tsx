import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Privacy Pet DNA Matching',
  description: 'Privacy-preserving pet breeding compatibility matching system',
}

export default function RootLayout({
  children,
}: {
  children: React.Node
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
