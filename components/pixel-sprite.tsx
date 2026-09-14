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

/* ── Plan sprites for /pricing ─────────────────────────────────────────── */
const PLAN_BODY = 'var(--primary)'
const PLAN_ACCENT = 'var(--secondary)'

/* Comet — head and tail as one fused wedge; a circle on a thin trail reads as a
   lollipop. The glint rides the leading edge, because a lone accent cell inside
   the head reads as a keyhole and turns the whole thing into a key. */
export const COMET_SPRITE = {
  grid: [
    '                         ',
    '                         ',
    '                         ',
    '               ooooo     ',
    '              XXooooo    ',
    '             XXXXooooo   ',
    '            XXXXXXXoooo  ',
    '            XXXXXXXXooo  ',
    '           XXXXXXXXXooo  ',
    '           XXXXXXXXXXoo  ',
    '          XXXXXXXXXXXoo  ',
    '         XXXXXXXXXXXXX   ',
    '         XXXXXXXXXXXX    ',
    '        XXXXXXXXXXXX     ',
    '       XXXXXXXXXX        ',
    '       XXXXXXXX          ',
    '      XXXXXXX            ',
    '     XXXXXX              ',
    '     XXXX                ',
    '    XXX                  ',
    '   XX                    ',
    '                         ',
    '                         ',
    '                         ',
    '                         ',
  ],
  palette: { X: PLAN_BODY, o: PLAN_ACCENT } satisfies PixelPalette,
}

/* Satellite — panelled arrays flanking the body, joined by a strut row so it reads
   as one object. The seam every third row is what makes them read as solar arrays
   rather than two plain slabs; thin stub wings just read as an aeroplane. */
export const SATELLITE_SPRITE = {
  grid: [
    '                         ',
    '           ooo           ',
    '          ooooo          ',
    '          ooooo          ',
    '          ooooo          ',
    '           XXX           ',
    '           XXX           ',
    '         XXXXXXX         ',
    'oooooo   XXXXXXX   oooooo',
    'oooooo   XXXXXXX   oooooo',
    '         XXXXXXX         ',
    'ooooooXXXXXXXXXXXXXoooooo',
    'ooooooXXXXXXXXXXXXXoooooo',
    '         XXXXXXX         ',
    'oooooo   XXXXXXX   oooooo',
    'oooooo   XXXXXXX   oooooo',
    '         XXXXXXX         ',
    '         XXXXXXX         ',
    '                         ',
    '                         ',
    '                         ',
    '                         ',
    '                         ',
    '                         ',
    '                         ',
  ],
  palette: { X: PLAN_BODY, o: PLAN_ACCENT } satisfies PixelPalette,
}

/* Planet — sphere plus a ring in perspective. The ring is occluded by the sphere
   on the far side and drawn over it on the near side; without that it is just a
   bar skewering a circle. */
export const PLANET_SPRITE = {
  grid: [
    '                         ',
    '                         ',
    '                         ',
    '           XXX           ',
    '        XXXXXXXXX        ',
    '       XXXXXXXXXXX       ',
    '      XXXXXXXXXXXXX      ',
    '     XXXXXXXXXXXXXXX     ',
    '     XXXXXXXXXXXXXXX     ',
    '     XXXXXXXXXXXXXXX     ',
    '    XXXXXXXXXXXXXXXXX    ',
    '    XXXXXXXXXXXXXXXXX    ',
    '  ooXXXXXXXXXXXXXXXXXoo  ',
    'oooooXXXXXXXXXXXXXXXooooo',
    'oooooXXXXXXXXXXXXXXXooooo',
    '  ooooooXXXXXXXXXoooooo  ',
    '      ooooooooooooo      ',
    '       XXXXXXXXXXX       ',
    '        XXXXXXXXX        ',
    '           XXX           ',
    '                         ',
    '                         ',
    '                         ',
    '                         ',
    '                         ',
  ],
  palette: { X: PLAN_BODY, o: PLAN_ACCENT } satisfies PixelPalette,
}

/* Own Galaxy — a two-arm logarithmic spiral around a bright core. Palette inverts
   from the cloud three so the self-hosted tier reads as their sibling, not a
   fourth one of them. */
export const GALAXY_SPRITE = {
  grid: [
    '                         ',
    '                         ',
    '       o                 ',
    '     ooo                 ',
    '    ooo                  ',
    '    ooo                  ',
    '    ooo                  ',
    '    oo                   ',
    '    oo       oo          ',
    '    ooo    XXXoooo       ',
    '    ooo   XXXXXoooo      ',
    '    ooo  XXXXXXXoooo     ',
    '     ooo XXXXXXX ooo     ',
    '     ooooXXXXXXX  ooo    ',
    '      ooooXXXXX   ooo    ',
    '       ooooXXX    ooo    ',
    '          oo       oo    ',
    '                   oo    ',
    '                  ooo    ',
    '                  ooo    ',
    '                  ooo    ',
    '                 ooo     ',
    '                 o       ',
    '                         ',
    '                         ',
  ],
  palette: { X: PLAN_ACCENT, o: PLAN_BODY } satisfies PixelPalette,
}

export const PLAN_SPRITES = {
  comet: COMET_SPRITE,
  satellite: SATELLITE_SPRITE,
  planet: PLANET_SPRITE,
  galaxy: GALAXY_SPRITE,
} as const

export type PlanSpriteKey = keyof typeof PLAN_SPRITES
