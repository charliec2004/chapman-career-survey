import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  // metadataBase makes the file-based opengraph-image resolve to an absolute URL.
  // Set to the GitHub Pages origin; basePath adds the /<repo> subpath to the image URL.
  // Update this to the real production origin if the site moves to a custom domain.
  metadataBase: new URL('https://charliec2004.github.io'),
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
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
