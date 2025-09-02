import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sprint Retrospective Board',
  description: 'A collaborative tool for sprint retrospectives with sticky notes and real-time collaboration',
  keywords: ['retrospective', 'agile', 'scrum', 'team', 'collaboration', 'sprint'],
  authors: [{ name: 'Retrospective Board Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 antialiased`}>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}