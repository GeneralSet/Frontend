# deckBuilder

Generates Set-style card decks. `GeometricDeckGenerator` builds the full
cartesian product of a deck's features and delegates card rendering to
`CardSvg`, which lays out N copies of a **shape component** and applies only
the features that shape supports.

## Adding a shape

1. Create a component file in `shapes/`. For a single-path shape use the
   factory:

   ```tsx
   import { definePathShape } from "./PathShape";

   export const Star = definePathShape("M60,5 L73,40 ...");
   ```

   For anything richer, export a `ShapeDefinition` with your own component.
   It receives a `ColorSet` (`primary`, `secondary`, `tertiary`) and the
   resolved `fill` paint:

   ```tsx
   import { ShapeDefinition, ShapeProps } from "../types";

   const Component = ({ colors, fill }: ShapeProps) => (
     <>
       <circle cx="60" cy="60" r="55" fill={fill} stroke={colors.primary} />
       <circle cx="60" cy="60" r="20" fill={colors.tertiary} />
     </>
   );

   export const Target: ShapeDefinition = {
     Component,
     supports: {
       rotations: [0, 90],  // true/undefined = all, false = none, or a subset
       filters: true,
       patterns: false,     // fill stays solid primary
       colors: 3,           // 1 = primary only, 2 = +secondary, 3 = full set
     },
   };
   ```

   Every `supports` field is optional — omit `supports` entirely for full
   feature support. The orchestrator downgrades anything unsupported
   (rotation to 0, filter to `none`, pattern to `solid`), and patterns that
   use more colors than the shape declares also fall back to `solid`.

2. Register it in `shapes/index.ts`:

   ```ts
   export const SHAPE_REGISTRY = defineShapes({
     ...
     "Star": Star,
   });
   ```

That's it — the shape shows up in the editor's Symbol list, `ShapeName` and
`CardData` update automatically, and `__tests__/registry.test.ts` guards the
registry's integrity. Registry keys are stored in saved deck metadata, so
renaming one is a breaking change.

## Legibility

`CardSvg` fits each symbol into a 38-unit box in the 120-unit card viewport, and
a card renders at `min(26vw, 20vh)` — roughly 86px on a narrow phone — so a
symbol reaches the player at about **27 device pixels**. Shapes have to be drawn
for that size. New shapes should:

- Outline everything with one uniform
  `stroke="#000000" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"`.
  (`definePathShape`'s `strokeWidth="1"` works out to 0.23px on a card.)
- Layer base fills, outlines, and highlights into separate `<g>` groups, keeping
  the resolved `fill` paint on the base layer so patterns have room to read.
- Favor `<circle>`/`<ellipse>`/`<rect>` and `M`/`L`/`Q`/`T` paths over cubic
  Béziers, and never paste traced paths with hundreds of points.
- Fill the viewBox but inset ~6 units so the stroke isn't clipped, and keep every
  detail above ~8 units.

To see what a shape actually looks like on a card:

```bash
yarn render:shape "Circle - Semi"
```

That renders the shape through `CardSvg` with Playwright at real card sizes
across every option it supports, checks for blank output, viewBox clipping, and
strokes too thin to survive the downscale, and writes a PNG to open. Full
rationale in `.claude/skills/deckbuilder-shape/references/iconography.md`.

## Adding a feature

Features are data-driven from `features/index.ts`: add the option type to
`FeatureOptionMap`, a row to `FEATURES`, a default to `DEFAULT_CARD`, and
teach `CardSvg` how to apply it. The editor UI picks it up automatically.

A feature marked `requiresShapeSupport` belongs to the shapes that declare it
in `supports` rather than to every deck — the fried egg's yolk count is the
first. `deckRules.ts` derives the consequences generically: such a shape may be
repeated across cards, and picking it a second time collapses the deck onto
that one symbol so its own feature does the varying instead; the feature's
option count then caps how many cards the deck can hold. A shape declaring no
such feature can still only be used once per deck.

## Colors and patterns

The palette lives in `features/colors.ts`. Each named color is a `ColorSet`
whose `secondary`/`tertiary` are derived tint/shade of the primary — replace
`derive()` with a hand-tuned set per entry if desired. Patterns
(`features/patterns.tsx`) are where the three colors combine into the
shape's fill; each pattern declares `colorsUsed` so it can be gated by a
shape's color support.

## Card ids

Card ids are underscore-joined option indices (`"0_1_2"`) in metadata key
order — a contract shared with the WASM `set` engine and the pre-rendered
decks in `public/decks/`. Don't change id derivation.
