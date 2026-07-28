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

## Adding a feature

Features are data-driven from `features/index.ts`: add the option type to
`FeatureOptionMap`, a row to `FEATURES`, a default to `DEFAULT_CARD`, and
teach `CardSvg` how to apply it. The editor UI picks it up automatically.

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
