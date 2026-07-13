import { NextRequest, NextResponse } from 'next/server'

const VALID_SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

export async function GET(request: NextRequest) {
  const sizeParam = request.nextUrl.searchParams.get('size')
  const purpose = request.nextUrl.searchParams.get('purpose') || 'any'

  const size = parseInt(sizeParam || '192', 10)

  if (!VALID_SIZES.includes(size)) {
    return NextResponse.json(
      { error: `Invalid size. Valid sizes: ${VALID_SIZES.join(', ')}` },
      { status: 400 }
    )
  }

  const svg = generateIconSvg(size, purpose)

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}

function generateIconSvg(size: number, purpose: string): string {
  const isMaskable = purpose === 'maskable'

  // For maskable icons, content must be within 80% safe zone (centered)
  const safeZoneRatio = isMaskable ? 0.8 : 1
  const contentSize = size * safeZoneRatio

  // Font sizes scaled to icon size
  const mainFontSize = Math.round(contentSize * 0.32)
  const subFontSize = Math.round(contentSize * 0.09)
  const shieldRadius = Math.round(contentSize * 0.28)

  // Colors
  const primaryColor = '#038ed3'
  const secondaryColor = '#025a87'
  const textColor = '#ffffff'

  // Generate unique gradient ID
  const gradId = `grad-${size}-${purpose}`

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}" />
      <stop offset="100%" stop-color="${secondaryColor}" />
    </linearGradient>
  </defs>

  <!-- Background circle -->
  <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="url(#${gradId})" />

  <!-- Shield shape -->
  <g transform="translate(${size / 2}, ${size * 0.42})">
    <path
      d="M 0 ${-shieldRadius * 0.9}
         L ${shieldRadius * 0.85} ${-shieldRadius * 0.5}
         L ${shieldRadius * 0.85} ${shieldRadius * 0.2}
         Q ${shieldRadius * 0.85} ${shieldRadius * 0.7} 0 ${shieldRadius * 1.0}
         Q ${-shieldRadius * 0.85} ${shieldRadius * 0.7} ${-shieldRadius * 0.85} ${shieldRadius * 0.2}
         L ${-shieldRadius * 0.85} ${-shieldRadius * 0.5} Z"
      fill="rgba(255,255,255,0.15)"
      stroke="rgba(255,255,255,0.4)"
      stroke-width="${Math.max(1, size * 0.005)}"
    />
  </g>

  <!-- UST text -->
  <text
    x="${size / 2}"
    y="${size * 0.48}"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-weight="bold"
    font-size="${mainFontSize}"
    fill="${textColor}"
    letter-spacing="${Math.round(mainFontSize * 0.05)}"
  >UST</text>

  <!-- Subtitle -->
  <text
    x="${size / 2}"
    y="${size * 0.58}"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-weight="500"
    font-size="${subFontSize}"
    fill="rgba(255,255,255,0.85)"
    letter-spacing="${Math.round(subFontSize * 0.1)}"
  >UNIVERSITY</text>
</svg>`

  return svg
}
