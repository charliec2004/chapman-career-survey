import { ImageResponse } from 'next/og'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Social-share (Open Graph / Twitter) card, generated at build time so it works
// with the static export. Uses the official Chapman window mark + palette.
// Required so the image is rendered once at build time under `output: 'export'`.
export const dynamic = 'force-static'
export const alt = 'Chapman Career Services Finder — find your next career step'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Brand tokens (kept in sync with app/globals.css @theme).
const CHAPMAN_RED = '#A50034'
const PANTHER_BLACK = '#231F20'
const PILLAR = '#6E6259'

// Official Chapman window mark (cropped from the master-brand logo), inlined as a
// data URI so the OG renderer can embed it at build time.
const windowSrc = `data:image/png;base64,${readFileSync(
  join(process.cwd(), 'public', 'chapman-window.png'),
).toString('base64')}`

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#FFFFFF',
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Wordmark row: official Chapman window mark + text. */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={windowSrc} width={60} height={60} alt="" style={{ marginRight: 24 }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 34,
                fontWeight: 700,
                letterSpacing: 2,
                color: CHAPMAN_RED,
              }}
            >
              CHAPMAN UNIVERSITY
            </div>
            <div style={{ fontSize: 22, letterSpacing: 4, color: PILLAR }}>
              CAREER &amp; PROFESSIONAL DEVELOPMENT
            </div>
          </div>
        </div>

        {/* Headline + tagline. */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 92, fontWeight: 800, color: PANTHER_BLACK, lineHeight: 1.05 }}>
            Find your next
          </div>
          <div style={{ fontSize: 92, fontWeight: 800, color: CHAPMAN_RED, lineHeight: 1.05 }}>
            career step.
          </div>
          <div style={{ marginTop: 28, fontSize: 28, color: PILLAR }}>
            Answer a few questions → get the Chapman resources that fit you.
          </div>
        </div>

        {/* Bottom accent bar + tagline. */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 120, height: 8, backgroundColor: CHAPMAN_RED, marginRight: 24 }} />
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 2, color: CHAPMAN_RED }}>
            DRIVEN BY CURIOSITY. INSPIRED BY CHAPMAN.
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
