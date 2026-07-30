# src/deckBuilder architecture (GeneralSet/Frontend)

Facts this skill relies on. Re-verify against the live repo if it's been a
while — this is a snapshot, not a guarantee.

- `GeometricDeckGenerator` builds the cartesian product of a deck's enabled
  feature options; `CardSvg` renders one card by looking up `SHAPE_REGISTRY`
  and applying that card's feature values, **downgrading anything the shape's
  `supports` doesn't allow** (rotation → 0, filter → none, pattern → solid;
  patterns needing more colors than the shape declares also fall back to
  solid).
- Features (`shapes`, `colors`, `numbers`, `rotations`, `filters`, `patterns`,
  and any you add) are **global**, not per-shape: they live in one
  `FeatureOptionMap` in `features/index.ts` and every shape either supports a
  given feature (declared via `ShapeFeatureSupport`) or CardSvg silently
  downgrades it. There is no existing mechanism for a feature scoped to a
  single shape other than "declare it in `supports`, and shapes that don't
  will just get the fallback value."
- `ShapeProps` (what every `Component` receives) is deliberately small:
  `colors: ColorSet` (`primary`/`secondary`/`tertiary`, pre-clamped to the
  shape's declared color count) and `fill` (resolved paint: solid color,
  `"none"`, or a `url(#...)` pattern reference). Adding a new feature that a
  shape needs to read means adding an optional field to `ShapeProps` too (see
  SKILL.md step 4) — don't invent a side channel.
- `SHAPE_REGISTRY` keys are permanent: they're stored in saved deck metadata.
  `__tests__/registry.test.ts` enforces this with an exact-array-equality
  check (`LEGACY_SHAPE_NAMES`) — it is not a generic "non-empty" check, it
  will fail the instant a new shape is registered without updating that array.
- The editor UI (`views/gameEditor/featureSelect.tsx`,
  `views/gameEditor/GameEditor.tsx`) iterates `FEATURE_NAMES` generically and
  needs no changes when a feature is added — confirmed by reading both files.
  If the new feature is a shape-only custom feature (`requiresShapeSupport:
  true` in its `FEATURES` entry, e.g. `yolks`), `GameEditor.tsx` also hides
  that feature's `EnableFeature` switch and `FeatureSelect` dropdown entirely
  (not just disables them) until every card in the deck resolves to a shape
  whose `supports` declares it (via `shapes/index.ts`'s
  `shapeSupportsFeature`), and auto-clears any per-card override the moment
  that stops being true (e.g. a card's shape is edited away). This is generic
  over the flag, not hardcoded to any one feature name — see
  `views/gameEditor/__tests__/GameEditor.test.tsx` for the behavior this
  guarantees.
- Test runner is CRA/Jest (`yarn test` / `npm test`, both wrap
  `react-app-rewired test`).
