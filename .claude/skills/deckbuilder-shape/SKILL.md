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
   A shape that only ever shows one paint color should just use `fill` (like
   `PathShape`) — don't hand-assign `colors.primary` for a single-region shape.
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

Single flat silhouette, one paint color → use the factory, nothing else needed:
```tsx
import { definePathShape } from "./PathShape";
export const Star = definePathShape("M60,5 L73,40 ...");
```

Multi-part shape with distinct colors per region → hand-written component.
Follow this exact prop contract — `colors` and `fill` are supplied by
`CardSvg`, already clamped/resolved for you:
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

const YOLK_OFFSETS: Record<number, [number, number][]> = {
  1: [[60, 60]],
  2: [[42, 55], [78, 65]],
  3: [[40, 45], [70, 40], [58, 78]],
};

const Component = ({ colors, yolks = 1 }: ShapeProps) => (
  <>
    <path
      d="M60,10 C90,10 108,35 108,62 C108,92 86,110 60,110 C34,110 12,92 12,62 C12,35 30,10 60,10 Z"
      fill={colors.secondary}
      stroke={colors.secondary}
    />
    {(YOLK_OFFSETS[yolks] || YOLK_OFFSETS[1]).map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r="14" fill={colors.primary} />
    ))}
  </>
);

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
   to grey out the feature's controls in the editor until every card in the
   deck uses a shape that declares support for it, via
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
   from step 2 is all that's needed for the editor to grey out this
   feature's controls until every card qualifies. Don't touch those files.
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

From the repo root, run **both** — Jest alone won't catch type errors (see
step 4.6):
```bash
CI=true yarn test src/deckBuilder --watchAll=false
npx tsc --noEmit -p tsconfig.json   # then grep the output for deckBuilder
```
(or `npm test --` / `npx` equivalents). Fix any snapshot or registry-array
failures before presenting — a red registry test almost always means step 3's
array edit was missed. The first `tsc` run on a fresh checkout needs
`node_modules` installed (`npm install --legacy-peer-deps` if a plain
`npm install` hits an ERESOLVE conflict on this repo's pinned
`typescript`/`react-scripts` versions).

## 6. Present

Show the user: the new shape file, the diffs to `shapes/index.ts` and
`registry.test.ts`, and — if applicable — the diffs to `types.ts`,
`features/index.ts`, and `CardSvg.tsx`. Call out the feature/shape name
choice explicitly since both are permanent once decks are saved with them.
