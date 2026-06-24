import type { NextConfig } from 'next'

// When deploying to a GitHub Pages *project* site the app is served from a
// subpath (https://<user>.github.io/<repo>/), so assets need basePath/assetPrefix.
// The CI workflow sets PAGES_BASE_PATH=/<repo>; locally it is unset so dev/build
// serve from the root.
const basePath = process.env.PAGES_BASE_PATH || ''

const nextConfig: NextConfig = {
  output: 'export', // fully static build into out/
  images: { unoptimized: true }, // required for static export
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  trailingSlash: true, // emit per-route index.html dirs that Pages serves cleanly
}

export default nextConfig
