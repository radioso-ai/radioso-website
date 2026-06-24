import type { CSSProperties } from 'react'

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

/* A clean four-point sparkle — decorative twinkle, distinct from the real mark. */
export const SPARK_GRID = [
  '    X    ',
  '    X    ',
  '   XXX   ',
  ' XXXXXXX ',
  'XXXXXXXXX',
  ' XXXXXXX ',
  '   XXX   ',
  '    X    ',
  '    X    ',
]

/** A single twinkling pixel sparkle — the site's recurring quirky flourish. */
export function SparkMark({
  className,
  color = 'var(--secondary)',
  style,
}: {
  className?: string
  color?: string
  style?: CSSProperties
}) {
  return (
    <PixelSprite
      grid={SPARK_GRID}
      palette={{ X: color }}
      className={`pixel-spark ${className ?? ''}`}
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
