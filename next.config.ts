import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export', // fully static build into out/
  images: { unoptimized: true }, // required for static export
}

export default nextConfig
