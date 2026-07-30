---
name: deckbuilder-shape
description: Create a new shape (ShapeDefinition) for the GeneralSet/Frontend deckBuilder, including multi-color parts and shape-only custom features (e.g. a fried egg with primary-colored yolk, secondary-colored white, and a yolk-count feature). Use this whenever the user wants to add a Set-style card symbol/shape to the deckBuilder, mentions "ShapeDefinition", "shapes/index.ts", "SHAPE_REGISTRY", or describes a new deck symbol in this codebase — even if they only describe it informally ("make a fried egg shape").
---

# deckBuilder shape creation

Builds a new `ShapeDefinition` for `src/deckBuilder` in GeneralSet/Frontend and
wires it fully into the repo: registry, tests, and — if the shape needs a
control that no other shape has (e.g. yolk count) — a new global feature.

Read `references/architecture.md` first if you haven't inspected this repo's
`src/deckBuilder` in this session. It has the facts this skill assumes.
`references/iconography.md` has the drawing rules new shapes must follow —
read it before you write any path data.

## 0. Locate / fetch the repo

If a local checkout isn't already available, clone it:
```bash
git clone --depth 1 https://github.com/GeneralSet/Frontend.git
```
All paths below are relative to `src/deckBuilder/` inside that checkout.

## 1. Interview (keep it short — infer what you can from the description)

From the user's description, pin down:
1. **Shape name** — the registry key, e.g. `"Fried Egg"`. Must be unique and,
   once shipped, must never be renamed (deck metadata stores it).
2. **Visual parts and their colors** — which parts use `colors.primary`,
   `colors.secondary`, `colors.tertiary`, or the resolved `fill`/pattern paint.
   A shape that only ever shows one paint color should just use `fill` for its
   base — don't hand-assign `colors.primary` for a single-region shape.
3. **Any part that should vary per-card beyond the built-in features**
   (colors, numbers, rotations, filters, patterns) — e.g. "single/double/triple
   yolk". This needs a **new global feature** (see step 4). Ask specifically:
   is this varying, or just a fixed visual detail? Don't build a feature for
   something the user described as a constant.
4. Whether any part of the shape should be exempt from rotation/filters/pattern
   (feeds `supports`).

Don't ask about things inferable from the description (a "fried egg" obviously
has two parts: yolk + white).

## 2. Write the shape component

### Iconography rules (required)

A card scales each symbol to **~0.22x** — `CardSvg` fits it into a 35-unit box in a
120-unit card, and the card itself renders around 90px (60px on a short window).
So a symbol reaches the player at roughly **26 device pixels**. Every new shape
must be drawn for that size:

1. **Bold, uniform outlines.** Every outline uses exactly
   `stroke="#000000" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"`.
   One width, one color, literal black — not `colors.primary`. (`stroke-width="1"`,
   what `definePathShape` emits, is 0.22px on a card: invisible.)
2. **Layer into `<g>` groups** — base fills, then outlines, then highlights — so
   strokes are never buried. The resolved `fill` prop goes on the base layer only,
   so patterns have one large area to read in.
3. **Prefer simple geometry.** `<circle>`/`<ellipse>`/`<rect>`/`<line>` first, then
   paths of `M`/`L`/`Q`/`T`/`Z`. Cubic `C`/`S` only when a quadratic genuinely can't
   express the curve, and never a traced path with hundreds of points.
4. **Draw big, inset ~6 units** so the stroke isn't shaved (usable area ≈ `6,6` →
   `114,114`), keep every detail above ~8 units, and make sure the silhouette alone
   distinguishes the shape from everything already in `SHAPE_REGISTRY`.

```tsx
const Component = ({ colors, fill }: ShapeProps) => (
  <>
    <g stroke="none">
      <ellipse cx="60" cy="64" rx="48" ry="42" fill={fill} />
    </g>
    <g fill="none" stroke="#000000" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="60" cy="64" rx="48" ry="42" />
      <path d="M36,50 Q60,34 84,50" />
    </g>
    <g stroke="none">
      <circle cx="42" cy="50" r="9" fill={colors.tertiary} />
    </g>
  </>
);
```

The third group is for accents drawn *on* the icon. A region that needs its own
outline isn't a highlight: put its fill in the first group and its outline in the
second, so the stroke still lands on top.

`references/iconography.md` has the reasoning, the scale math, and a worked
before/after. **The shapes already in the registry predate these rules and are not
being restyled** — don't copy Tracks/Tetris/Circles/Fried Egg as style references,
they're the problem these rules solve. Step 5 verifies the rules mechanically.

### Building the component

`definePathShape` strokes at `colors.primary` / width 1, which rule 1 rules out —
it exists for the shapes already in the registry. **Write a hand-written component
for new shapes**, even single-region ones, so the outline group can be declared:
```tsx
import { ShapeDefinition, ShapeProps } from "../types";

const Component = ({ fill }: ShapeProps) => (
  <>
    <g stroke="none">
      <path d="M60,10 L110,110 L10,110 Z" fill={fill} />
    </g>
    <g fill="none" stroke="#000000" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M60,10 L110,110 L10,110 Z" />
    </g>
  </>
);

export const Star: ShapeDefinition = { Component };
```

Multi-part shape with distinct colors per region → same thing with more layers.
Follow this exact prop contract — `colors` and `fill` are supplied by
`CardSvg`, already clamped/resolved for you:
```tsx
import { ShapeDefinition, ShapeProps } from "../types";

const Component = ({ colors, fill }: ShapeProps) => (
  <>
    {/* every filled region first — the card's paint on the base, accents on top of it */}
    <g stroke="none">
      <circle cx="60" cy="60" r="51" fill={fill} />
      <circle cx="60" cy="60" r="20" fill={colors.tertiary} />
    </g>
    {/* then one outline group over all of them */}
    <g fill="none" stroke="#000000" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="60" cy="60" r="51" />
      <circle cx="60" cy="60" r="20" />
    </g>
  </>
);

export const Target: ShapeDefinition = {
  Component,
  supports: {
    rotations: [0, 90],   // true/undefined = all, false = none, subset = exact angles
    filters: true,
    patterns: false,      // fill stays solid `colors.primary` if you use fill this way
    colors: 3,             // 1 = primary only, 2 = +secondary, 3 = full set
  },
};
```
Rules:
- Omit `supports` entirely for full feature support — don't write out defaults.
- If a region should always be a fixed color (not participate in the
  pattern/fill system) use `colors.primary`/`secondary`/`tertiary` directly for
  that region, and reserve `fill` for the region that should show the card's
  pattern (striped/gradient/etc.) when the deck enables one.
- Declare `colors: 2` if the shape only ever uses two colors, so pattern/color
  option lists don't offer a third that does nothing.
- Give `viewBox` on the `ShapeDefinition` only if the shape isn't drawn in the
  default `0 0 120 120` space.

### Fried-egg worked example (primary = yolk, secondary = white)
```tsx
import { ShapeDefinition, ShapeProps } from "../types";

// number[][], not [number, number][] — the pinned @typescript-eslint/parser
// (via react-scripts 3.4.4) crashes on tuple-array types and breaks the
// production build, which `yarn test` never sees. See commit d8701ac.
const YOLK_OFFSETS: Record<number, number[][]> = {
  1: [[60, 60]],
  2: [[42, 55], [78, 65]],
  3: [[40, 45], [70, 40], [58, 78]],
};

// The white: a blobby outline built from quadratics, inset 6 units for the stroke.
const WHITE = "M60,8 Q104,8 108,50 Q112,88 78,104 Q44,118 22,92 Q4,66 20,36 Q32,10 60,8 Z";

const Component = ({ colors, yolks = 1 }: ShapeProps) => {
  const centers = YOLK_OFFSETS[yolks] || YOLK_OFFSETS[1];
  return (
    <>
      <g stroke="none">
        <path d={WHITE} fill={colors.secondary} />
        {centers.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="15" fill={colors.primary} />
        ))}
      </g>
      <g fill="none" stroke="#000000" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
        <path d={WHITE} />
        {centers.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="15" />
        ))}
      </g>
    </>
  );
};

export const FriedEgg: ShapeDefinition = {
  Component,
  supports: { colors: 2, patterns: false, yolks: [1, 2, 3] },
};
```
This uses `yolks`, a **new global feature** — see step 4. Only build step 4 if
the user actually wants a varying, deck-level control; if they just want a
fixed two-yolk egg, hardcode it and skip step 4 entirely.

## 3. Register the shape

`shapes/index.ts`:
```ts
import { FriedEgg } from "./FriedEgg";
export const SHAPE_REGISTRY = defineShapes({
  ...
  "Fried Egg": FriedEgg,
});
```

**Update `__tests__/registry.test.ts` in the same change.** It asserts
`SHAPE_NAMES` equals a hardcoded `LEGACY_SHAPE_NAMES` array — append the new
name there or the test suite breaks immediately. Everything else in that file
(feature options non-empty/unique, color sets valid, default card values
valid) is generic and needs no edit unless step 4 introduced bad defaults.

## 4. Adding a shape-only custom feature (only when step 1.3 needs it)

Mirror how `rotations` already works — same true/undefined/false/subset
resolution pattern, same downgrade-in-`CardSvg` approach. Five files, in
order:

1. **`types.ts`** — add the option field to `ShapeFeatureSupport` and an
   optional prop to `ShapeProps`:
   ```ts
   // ShapeFeatureSupport
   yolks?: boolean | readonly (1 | 2 | 3)[];
   // ShapeProps
   yolks?: 1 | 2 | 3;
   ```
2. **`features/index.ts`** — add to `FeatureOptionMap`, `FEATURES`, and
   `DEFAULT_CARD`:
   ```ts
   export const YOLKS = [1, 2, 3] as const;
   // in FeatureOptionMap: yolks: (typeof YOLKS)[number];
   // in FEATURES: yolks: { label: "Yolks", options: YOLKS, requiresShapeSupport: true },
   // in DEFAULT_CARD: yolks: 1,
   ```
   `requiresShapeSupport: true` marks this as a shape-only custom feature
   (no universal neutral value) — `GameEditor.tsx` reads this flag generically
   to hide the feature's controls entirely in the editor until every card in
   the deck uses a shape that declares support for it, via
   `shapes/index.ts`'s `shapeSupportsFeature`. Omit it for features that
   default to full support (like `rotations`/`filters`/`patterns`/`colors`).
3. **`CardSvg.tsx`** — resolve and pass it through, same shape as
   `resolveRotation`:
   ```ts
   const resolveYolks = (supported: ShapeFeatureSupport["yolks"], yolks: number): number => {
     if (supported === false || supported === undefined) return 1;
     if (supported === true) return yolks;
     return supported.includes(yolks as 1 | 2 | 3) ? yolks : supported[0];
   };
   // ...
   const yolks = resolveYolks(supports.yolks, card.yolks);
   // pass to Component:
   <shape.Component colors={colors} fill={paint.fill} yolks={yolks} />
   ```
   Note the different fallback semantics from rotation: an unsupported
   rotation degrades to 0 (a valid neutral state for every shape), but there's
   no universal neutral yolk count, so shapes that don't declare `yolks`
   support just always render the fallback (1) regardless of card data —
   same principle as `patterns` falling back to `"solid"`.
4. **`shapes/<YourShape>.tsx`** — as in step 2, declare `supports: { yolks: [...] }`
   and read the prop.
5. Nothing else in the editor itself — `featureSelect.tsx` and `GameEditor.tsx`
   iterate `FEATURE_NAMES` generically, and the `requiresShapeSupport` flag
   from step 2 is all that's needed for the editor to hide this feature's
   controls until every card qualifies. Don't touch those files.
6. **Grep for hand-built `CardData` object literals in tests** (e.g.
   `__tests__/cardSvg.test.tsx`'s `const CARD: CardData = {...}`). Unlike
   `GeneratedDeckMetaData` (all fields optional), `CardData` requires every
   feature, so adding one to `FeatureOptionMap` breaks any existing literal
   that doesn't have it — `jest`'s babel transform won't catch this, only
   `tsc --noEmit` will. Add the new field to each one.

Jest here runs through Babel and does **not** typecheck — a shape file with a
missing `import * as React from "react"` (needed because this repo's
`tsconfig` doesn't use the new JSX transform) or a broken `CardData` literal
will pass `yarn test` and only surface in `tsc --noEmit`. Run both (step 5
below) before presenting.

Do not invent a separate per-shape prop-passing mechanism (e.g. a generic
`extra`/`custom` bag) — new features should look like existing ones so the
next person extending this can follow the same five-file recipe.

## 5. Verify

Three gates, all from the repo root. `node_modules` must be installed first
(`yarn install`; use `npm install --legacy-peer-deps` if a plain `npm install`
hits an ERESOLVE conflict on this repo's pinned
`typescript`/`react-scripts` versions).

### 5a. Look at it (the one that catches "renders, but wrong")

```bash
yarn render:shape "<Shape Name>"
```

`scripts/render-shape.mjs` renders the shape through the real `CardSvg`
pipeline with Playwright — every option the shape's `supports` declares — and
writes a contact-sheet PNG. It prints PASS/WARN/FAIL for what a machine can
judge and exits non-zero on FAIL:

| Check | Level | Means |
| --- | --- | --- |
| renders without errors | FAIL | page/console/SVG parse errors |
| not blank | FAIL | under 1% of the card has ink — check fills, colors, coordinates |
| fits the viewBox | FAIL | geometry is clipped (WARN if only the stroke halo is shaved — inset it) |
| fills the viewBox | WARN | bbox spans under 55% of the box; scale the geometry up |
| stroke survives card scale | WARN | widest stroke is under 4 user units / 1px on a 90px card (rule 1) |

It also notes mixed stroke widths/colors, missing `round` caps and joins, and
missing `<g>` grouping — the step-2 rules, reported but not gating.

**Then read the printed PNG with the Read tool.** No check can tell you whether
the shape is the thing the user asked for; that judgement is the whole point of
the render. Look at, specifically:

- **True size row** — is it recognizable at 60px, not just at 140px? This is
  where over-detailed shapes fall apart.
- **Zoom panel** — nothing crossing the dashed viewBox frame, outlines uniform
  and unbroken, no detail too fine to see.
- **Variant grid** — every pattern, rotation, and color still legible, including
  `Black` (where a black outline merges into a dark fill) and `open` (fill
  `none`, so only the outline holds the shape up).

If it isn't right, fix the shape and re-run. **Do not present a shape whose PNG
you have not looked at, and do not treat a green `yarn test` as evidence it
looks right** — the tests assert markup, not appearance.

### 5b. Tests and types

Run **both** — Jest alone won't catch type errors (see step 4.6):
```bash
CI=true yarn test src/deckBuilder --watchAll=false
npx tsc --noEmit -p tsconfig.json   # then grep the output for deckBuilder
```
(or `npm test --` / `npx` equivalents). Fix any snapshot or registry-array
failures before presenting — a red registry test almost always means step 3's
array edit was missed.

## 6. Present

Show the user: the new shape file, the diffs to `shapes/index.ts` and
`registry.test.ts`, and — if applicable — the diffs to `types.ts`,
`features/index.ts`, and `CardSvg.tsx`. Call out the feature/shape name
choice explicitly since both are permanent once decks are saved with them.

Say that you rendered the shape and looked at the result, and list any WARNs
you left standing with the reason they're acceptable. If the render surfaced a
tradeoff the user should weigh — a detail that had to be dropped to stay legible
at 26px, a silhouette close to an existing shape — raise it now rather than
letting them find it in the game.
