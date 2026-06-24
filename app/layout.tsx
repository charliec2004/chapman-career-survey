import type { Metadata } from 'next'
import { Jost, Source_Serif_4 } from 'next/font/google'
import './globals.css'

const jost = Jost({ subsets: ['latin'], variable: '--font-jost', display: 'swap' })
const sourceSerif = Source_Serif_4({ subsets: ['latin'], variable: '--font-source-serif', display: 'swap' })

export const metadata: Metadata = {
  // metadataBase makes the file-based opengraph-image resolve to an absolute URL.
  // Update this to the real deployed origin before launch.
  metadataBase: new URL('https://career-survey.chapman.edu'),
  title: 'Chapman Career Services Finder',
  description: 'Answer a few questions and discover the Chapman career resources that fit you best.',
  openGraph: {
    title: 'Chapman Career Services Finder',
    description: 'Answer a few questions and discover the Chapman career resources that fit you best.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chapman Career Services Finder',
    description: 'Answer a few questions and discover the Chapman career resources that fit you best.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jost.variable} ${sourceSerif.variable}`}>
      <body>{children}</body>
    </html>
  )
}
