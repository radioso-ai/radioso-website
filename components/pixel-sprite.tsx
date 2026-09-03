import type { CSSProperties } from 'react'

import { cn } from '@/lib/utils'

/**
 * Pixel-art renderer. Takes a grid of single-character rows + a palette mapping
 * each character to a fill, and draws one crisp `<rect>` per filled cell — the
 * same chunky-cell language as the Radioso logo. A space (or any char missing
 * from the palette) is transparent.
 */
export type PixelPalette = Record<string, string>

export function PixelSprite({
  grid,
  palette,
  className,
  style,
  title,
}: {
  grid: string[]
  palette: PixelPalette
  className?: string
  style?: CSSProperties
  title?: string
}) {
  const rows = grid.length
  const cols = grid.reduce((m, r) => Math.max(m, r.length), 0)

  return (
    <svg
      viewBox={`0 0 ${cols} ${rows}`}
      className={className}
      style={style}
      shapeRendering="crispEdges"
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {grid.flatMap((row, y) =>
        [...row].map((ch, x) => {
          const fill = palette[ch]
          if (!fill) return null
          // 1.02 overlap hides hairline seams between cells when scaled up.
          return <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={fill} />
        }),
      )}
    </svg>
  )
}

/* Five bars peaking in the middle: signal strength, drawn in the logo's cell
   grid. This replaced a four-point sparkle. The sparkle meant nothing, and
   tiny twinkling stars are the single most legible tell of an AI-generated
   landing page — there was one above every heading on the site. Bars at least
   say what the colour already says: something is transmitting. */
export const SIGNAL_GRID = [
  '    X    ',
  '  X X X  ',
  '  X X X  ',
  'X X X X X',
  'X X X X X',
]

/** The section marker. Blue where the machine is acting, `--human` yellow
    where a person is being asked — see the colour notes in globals.css.
    The 9x5 grid is why sizing is a width/height pair and not `size-*`. */
export function SignalMark({
  className,
  color = 'var(--primary)',
  style,
}: {
  className?: string
  color?: string
  style?: CSSProperties
}) {
  return (
    <PixelSprite
      grid={SIGNAL_GRID}
      palette={{ X: color }}
      className={cn('h-4 w-[1.8rem]', className)}
      style={style}
    />
  )
}

/* A friendly customer — rounded face, rosy cheeks, warm coral top. */
export const AVATAR_CUSTOMER = {
  grid: [
    '                ',
    '     HHHHHH     ',
    '   HHHHHHHHHH   ',
    '  HHHHHHHHHHHH  ',
    '  HHHSSSSSSHHH  ',
    '  HHSSSSSSSSHH  ',
    '  HHSSSSSSSSHH  ',
    '  HHSEESSEESHH  ',
    '  HHSSSSSSSSHH  ',
    '  HHSRSSSSRSHH  ',
    '  HHSSMMMMSSHH  ',
    '   HSSSSSSSSH   ',
    '    SSSSSSSS    ',
    '     CCCCCC     ',
    '   CCCCCCCCCC   ',
    '  CCCCCCCCCCCC  ',
  ],
  palette: {
    H: '#4a3528',
    S: '#e3a878',
    E: '#3a2a20',
    M: '#a85a44',
    R: '#e8917c',
    C: '#ef7d63',
  } satisfies PixelPalette,
}

/* A teammate on support — light skin, brown hair, blue shirt, headset. */
export const AVATAR_TEAMMATE = {
  grid: [
    '                ',
    '     HHHHHH     ',
    '   HHHHHHHHHH   ',
    '  HHHHHHHHHHHH  ',
    '  HHHSSSSSSHHH  ',
    '  HHSSSSSSSSHH  ',
    '  PHSSSSSSSSHP  ',
    '  PHSEESSEESHP  ',
    '  PHSSSSSSSSHP  ',
    '  HHSRSSSSRSHH  ',
    '  HHSSMMMMSSHH  ',
    '   HSSSSSSSSH   ',
    '    SSSSSSSS    ',
    '     CCCCCC     ',
    '   CCCCCCCCCC   ',
    '  CCCCCCCCCCCC  ',
  ],
  palette: {
    H: '#6b4423',
    S: '#f0cba0',
    E: '#3a2a20',
    M: '#b5573f',
    R: '#f0a48f',
    C: '#5096e7',
    P: '#3a3f4b',
  } satisfies PixelPalette,
}
