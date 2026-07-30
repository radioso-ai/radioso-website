// Generates public/og.png — a 1200x630 Open Graph / Twitter social card.
//
// Composition:
//   - Brand cream background (#f9f9f7) with subtle radial washes
//     (yellow top-right, blue lower-left) echoing the hero.
//   - The existing pixel lockup (public/radioso-lockup.svg) centered,
//     a bit above the vertical middle.
//   - Tagline beneath the lockup in a widely-available sans font.
//   - A few pixel-plus "sparks" garnishing the corners.
//
// Rasterized to PNG with sharp (librsvg backend). Run: node scripts/generate-og.mjs

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

// Brand palette
const CREAM = '#f9f9f7'
const YELLOW = '#ffc720'
const BLUE = '#5096e7'
const INK = '#142317'

const WIDTH = 1200
const HEIGHT = 630

// --- Lockup: inline the pixel-art SVG as a nested <svg> -----------------------
const lockupRaw = fs.readFileSync(path.join(root, 'public', 'radioso-lockup.svg'), 'utf8')
const lockupInner = lockupRaw
  .replace(/<\?xml[^>]*\?>/, '')
  .replace(/<svg[^>]*>/, '')
  .replace(/<\/svg>/, '')
  .replace(/<title>[\s\S]*?<\/title>/, '')
  .trim()

// Native lockup viewBox is 0 0 1173 300 (aspect ~3.91:1).
const LOCK_W = 680
const LOCK_H = Math.round((LOCK_W * 300) / 1173) // ~174
const LOCK_X = Math.round((WIDTH - LOCK_W) / 2) // horizontally centered
const LOCK_Y = 172 // a bit above vertical center

// --- Pixel-plus spark helper --------------------------------------------------
function spark(cx, cy, unit, color) {
  const h = `<rect x="${cx - unit * 1.5}" y="${cy - unit * 0.5}" width="${unit * 3}" height="${unit}" fill="${color}"/>`
  const v = `<rect x="${cx - unit * 0.5}" y="${cy - unit * 1.5}" width="${unit}" height="${unit * 3}" fill="${color}"/>`
  return h + v
}

const sparks = [
  spark(120, 110, 9, YELLOW),
  spark(1070, 150, 7, BLUE),
  spark(180, 520, 7, BLUE),
  spark(1090, 505, 9, YELLOW),
].join('')

const tagline = 'All your conversational agents. One self-hosted platform.'

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <radialGradient id="wash-yellow" cx="0.86" cy="0.12" r="0.62">
      <stop offset="0%" stop-color="${YELLOW}" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="${YELLOW}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="wash-blue" cx="0.1" cy="0.92" r="0.62">
      <stop offset="0%" stop-color="${BLUE}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="${BLUE}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="${CREAM}"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#wash-yellow)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#wash-blue)"/>

  ${sparks}

  <svg x="${LOCK_X}" y="${LOCK_Y}" width="${LOCK_W}" height="${LOCK_H}" viewBox="0 0 1173 300">
    ${lockupInner}
  </svg>

  <text x="${WIDTH / 2}" y="470" text-anchor="middle"
        font-family="Helvetica, Arial, sans-serif" font-size="40" font-weight="500"
        fill="${INK}">${tagline}</text>
</svg>`

const outPath = path.join(root, 'public', 'og.png')

const png = await sharp(Buffer.from(svg), { density: 144 })
  .resize(WIDTH, HEIGHT, { fit: 'fill' })
  .png({ compressionLevel: 9 })
  .toBuffer()

fs.writeFileSync(outPath, png)

const kb = (png.length / 1024).toFixed(1)
console.log(`Wrote ${path.relative(root, outPath)} — ${WIDTH}x${HEIGHT}, ${kb} kB`)
