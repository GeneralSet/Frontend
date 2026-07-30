# Iconography rules for deckBuilder shapes

**These are required for every shape added from now on.** The shapes already in
`SHAPE_REGISTRY` (Circles, Tetris, Tracks, Triangle, Fried Egg) predate them and are
deliberately not being restyled — they are what the rules exist to improve on, not the
pattern to copy.

## Why: a symbol is ~27 device pixels on a phone

Two scale reductions stack between the coordinates you type and what a player sees:

| Step | Where | Effect |
| --- | --- | --- |
| Shape space → symbol box | `CardSvg.tsx` — `SYMBOL_SIZE = 120/3 - 2 = 38` | **0.317x** |
| Card viewport → card element | phone card ≈ 90px for a 120-unit viewport | **0.75x** |
| Combined | | **≈0.23x** |

`src/components/game/card/index.css` sizes the card at `min(26vw, 20vh)`, so the card
tracks the viewport: ~86px on a 330px-wide phone (symbol ≈ **27px**) up to ~180px on
desktop (symbol ≈ **57px**). Design against the phone figure — it is the one that hurts.

Concretely, in the default `0 0 120 120` shape space, at a 90px card:

- `stroke-width="1"` (what `definePathShape` emits) → **0.23px**. Invisible.
- `stroke-width="6"` → **1.4px**. The thinnest line that reliably survives.
- An 8-unit detail → **1.8px**. About the floor for anything you want seen.

Set is a game of spotting differences fast. A symbol that needs squinting is a broken
symbol, no matter how good it looks zoomed in.

## The rules

### 1. Bold, uniform outlines

Every outline in the shape uses exactly:

```
stroke="#000000" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"
```

One width and one color across the whole shape. Mixed weights read as noise at 26px, and a
black outline stays legible against every fill in `COLOR_SETS` — including the pale ones
(`Beige`, `Mint`, `Apricot`, `Lavender`) that vanish on white without it.

The outline color is a literal `#000000`, **not** `colors.primary`. The card's color
feature varies the fills; the outline is the constant that holds the silhouette together.

If your shape declares a non-default `viewBox`, scale the width to keep it at ~5% of the
viewBox width (6/120). The render script computes the effective pixel width for you.

### 2. Layer into `<g>` groups

Three groups, in this order, so outlines are never buried under a later fill:

```tsx
const Component = ({ colors, fill }: ShapeProps) => (
  <>
    {/* 1. base fills — carries the card's resolved paint */}
    <g stroke="none">
      <ellipse cx="60" cy="64" rx="48" ry="42" fill={fill} />
    </g>
    {/* 2. outlines — one uniform stroke, no fill */}
    <g fill="none" stroke="#000000" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="60" cy="64" rx="48" ry="42" />
      <path d="M36,50 Q60,34 84,50" />
    </g>
    {/* 3. highlights — accents that sit on top of the outline */}
    <g stroke="none">
      <circle cx="42" cy="50" r="9" fill={colors.tertiary} />
    </g>
  </>
);
```

The third group is for accents that read as being *on* the icon — a glint, a dot, a
marking. A region that needs its own outline is not a highlight: put its fill in group 1
alongside the base, and add its outline to group 2, so the stroke still lands on top.

Put the resolved `fill` prop on the **base layer only**. That is the paint that carries
striped/gradient/dotted patterns when the deck enables them, and a pattern only reads if
it has one large uninterrupted area to fill. Highlights use `colors.secondary` /
`colors.tertiary` so they stay distinct from the pattern.

Declaring the stroke attributes once on the group — rather than per element — is what
keeps rule 1 true as the shape grows.

### 3. Prefer simple geometry

In descending order of preference:

1. Primitives: `<circle>`, `<ellipse>`, `<rect>`, `<line>`, `<polygon>`
2. Paths of `M` / `L` / `Q` / `T` / `Z`
3. Cubic `C` / `S` — only when a quadratic genuinely cannot express the curve

A quadratic has one control point, so nudging a curve means moving one number. Cubics
double the knobs for a difference nobody can see at 26px.

Never paste a traced or machine-generated path. `Tracks - Deer` in `shapes/Tracks.tsx` is
a single `d` with hundreds of points, many of them duplicates a fraction of a unit apart —
it cannot be hand-edited, it inflates every card in the deck, and all that precision
dissolves at card size anyway.

### 4. Draw big, and leave room for the stroke

Fill the viewBox, but inset ~6 units on every side so the 6-wide stroke is not shaved by
the symbol's clip: usable area is roughly **`6,6` → `114,114`** in the default space. The
shape's bounding box should span at least ~55% of the viewBox in its larger dimension —
anything smaller has thrown away resolution it cannot get back.

### 5. No detail below ~8 user units

Whiskers, serifs, thin gaps, small notches: at 1.7px they turn into a smudge, or disappear
into the outline. If a detail matters, make it big enough to see; if it does not, cut it.

### 6. Silhouette first

Fill the shape solid black in your head. Is it still identifiable, and still clearly
different from every other entry in `SHAPE_REGISTRY`? Color, pattern, and interior detail
are all features the deck may hold constant — the outline is the only thing guaranteed to
distinguish two cards.

## Before / after

A traced icon, drawn the way it usually arrives:

```tsx
// Don't: hairline strokes, mixed weights, cubic soup, no structure.
const Component = ({ colors, fill }: ShapeProps) => (
  <>
    <path
      d="M60,14 C88,14 106,38 106,62 C106,90 84,108 60,108 C36,108 14,90 14,62 C14,38 32,14 60,14 Z"
      fill={fill}
      stroke={colors.primary}
      strokeWidth="1"
    />
    <path d="M38,52 C46,42 54,40 60,44 C66,40 74,42 82,52" stroke={colors.tertiary} strokeWidth="2" fill="none" />
  </>
);
```

The same icon under these rules:

```tsx
// Do: primitives, one uniform black outline, layered groups.
const Component = ({ colors, fill }: ShapeProps) => (
  <>
    <g stroke="none">
      <circle cx="60" cy="61" r="47" fill={fill} />
      <circle cx="60" cy="61" r="15" fill={colors.tertiary} />
    </g>
    <g fill="none" stroke="#000000" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="60" cy="61" r="47" />
      <circle cx="60" cy="61" r="15" />
      <path d="M38,52 Q60,36 82,52" />
    </g>
  </>
);
```

Fewer numbers, editable by hand, and it still reads at 20px.

## Checking your work

`yarn render:shape "<Shape Name>"` renders the shape through the real `CardSvg` pipeline
and reports on rules 1, 4, and 5 mechanically — effective stroke width, viewBox fit,
bounding-box span, blank output — then writes a PNG. Rules 3 and 6 are judgement calls:
open the PNG and look. See SKILL.md step 5.
