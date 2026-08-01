/**
 * Renders a registered deckBuilder shape to static SVG markup, using the very
 * same `CardSvg` pipeline the app uses, and prints the result as JSON on
 * stdout. `render-shape.mjs` spawns this under ts-node and screenshots what
 * comes out — see that script for the whole flow.
 *
 * Not part of the app bundle: this lives with the deckbuilder-shape skill and
 * is only ever run as a CLI.
 *
 *   TS_NODE_TRANSPILE_ONLY=1 \
 *   TS_NODE_COMPILER_OPTIONS='{"jsx":"react","module":"commonjs","target":"es2019","esModuleInterop":true}' \
 *   node -r ts-node/register .claude/skills/deckbuilder-shape/scripts/card-markup.tsx "Fried Egg"
 */
import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import { CardSvg, MAIN_VIEWPORT_SIZE, SYMBOL_SIZE } from "../../../../src/deckBuilder/CardSvg";
import { CardData, DEFAULT_CARD, NUMBERS, ROTATIONS, YOLKS } from "../../../../src/deckBuilder/features";
import { COLOR_SETS, ColorName, clampColorSet } from "../../../../src/deckBuilder/features/colors";
import { PATTERN_DEFS, PATTERN_NAMES, PatternName } from "../../../../src/deckBuilder/features/patterns";
import { SHAPE_NAMES, SHAPE_REGISTRY, ShapeName } from "../../../../src/deckBuilder/shapes";
import { Rotation } from "../../../../src/deckBuilder/types";

const DEFAULT_VIEW_BOX = "0 0 120 120";

/** Colors worth eyeballing: a mid hue, a dark hue, and pure black (the worst
 *  case for a black outline, which disappears into a black fill). */
const SAMPLE_COLORS: ColorName[] = ["Red", "Blue", "Black"];

/** Keep the contact sheet readable. */
const MAX_VARIANTS = 24;

const fail = (message: string): never => {
  process.stderr.write(`${message}\n`);
  process.exit(2);
  throw new Error(message); // unreachable, keeps TS happy
};

const shapeName = process.argv[2];
if (!shapeName) {
  fail(`Usage: card-markup.tsx "<Shape Name>"\nRegistered shapes:\n  ${SHAPE_NAMES.join("\n  ")}`);
}
if (!(shapeName in SHAPE_REGISTRY)) {
  fail(
    `Unknown shape "${shapeName}".\nRegistered shapes:\n  ${SHAPE_NAMES.join("\n  ")}\n` +
      `(Register new shapes in src/deckBuilder/shapes/index.ts before rendering them.)`
  );
}

const name = shapeName as ShapeName;
const shape = SHAPE_REGISTRY[name];
const supports = shape.supports || {};
const colorCount = supports.colors === undefined ? 3 : supports.colors;
const viewBox = shape.viewBox || DEFAULT_VIEW_BOX;

/**
 * The option lists this shape can actually show. These repeat CardSvg's
 * downgrade rules so the sheet never contains two cells that render
 * identically — a grid full of duplicates hides the real variation.
 */
const supportedRotations = (): Rotation[] => {
  if (supports.rotations === false) return [0];
  if (supports.rotations === true || supports.rotations === undefined) return [...ROTATIONS];
  return [...supports.rotations];
};

/**
 * `solid` leads regardless of registry order: it is `DEFAULT_CARD`'s pattern
 * and the fallback CardSvg downgrades to, so it is the honest baseline. It
 * also matters for the checks — `open` resolves to `fill: "none"`, so a
 * shape whose legibility comes from its fill would measure as blank.
 */
const supportedPatterns = (): PatternName[] => {
  if (supports.patterns === false) return ["solid"];
  const supported = PATTERN_NAMES.filter((pattern) => PATTERN_DEFS[pattern].colorsUsed <= colorCount);
  return ["solid", ...supported.filter((pattern) => pattern !== "solid")];
};

const supportedYolks = (): (typeof YOLKS)[number][] => {
  if (supports.yolks === false || supports.yolks === undefined) return [1];
  if (supports.yolks === true) return [...YOLKS];
  return [...supports.yolks];
};

const rotations = supportedRotations();
const patterns = supportedPatterns();
const yolks = supportedYolks();
const numbers: (typeof NUMBERS)[number][] = [1, 2, 3];

interface Variant {
  label: string;
  card: CardData;
}

/**
 * Build the variant list breadth-first: one cell per distinct value of each
 * axis before any combinations, so a MAX_VARIANTS truncation never drops a
 * whole feature. The first cell is the plain baseline.
 */
const buildVariants = (): Variant[] => {
  const base: CardData = {
    ...DEFAULT_CARD,
    shapes: name,
    colors: SAMPLE_COLORS[0],
    numbers: 1,
    rotations: rotations[0],
    patterns: patterns[0],
    yolks: yolks[0],
  };

  const variants: Variant[] = [{ label: `${SAMPLE_COLORS[0]} · ${patterns[0]} · 1x`, card: base }];
  const seen = new Set<string>([JSON.stringify(base)]);

  const push = (label: string, overrides: Partial<CardData>) => {
    const card: CardData = { ...base, ...overrides };
    const key = JSON.stringify(card);
    if (seen.has(key)) return;
    seen.add(key);
    variants.push({ label, card });
  };

  numbers.slice(1).forEach((n) => push(`${n} symbols`, { numbers: n }));
  patterns.slice(1).forEach((pattern) => push(`pattern: ${pattern}`, { patterns: pattern }));
  rotations.slice(1).forEach((rotation) => push(`rotate ${rotation}°`, { rotations: rotation }));
  SAMPLE_COLORS.slice(1).forEach((color) => push(color, { colors: color }));
  yolks.slice(1).forEach((count) => push(`yolks: ${count}`, { yolks: count }));

  // Then a few combinations, which is where clipping and overlap show up.
  SAMPLE_COLORS.slice(1).forEach((color) =>
    patterns.slice(1, 3).forEach((pattern) => push(`${color} · ${pattern}`, { colors: color, patterns: pattern }))
  );
  rotations.slice(1, 3).forEach((rotation) => push(`3x · rotate ${rotation}°`, { numbers: 3, rotations: rotation }));
  push("9 symbols", { numbers: 9 });

  return variants.slice(0, MAX_VARIANTS);
};

const renderCard = (card: CardData, id: string): string =>
  ReactDOMServer.renderToStaticMarkup(<CardSvg card={card} cardId={id} />);

/**
 * One symbol on its own, in the shape's own coordinate space — this is what
 * the zoom panel shows and what the geometry checks measure. No card scaling
 * in the way, so a bbox read off this is in raw user units.
 */
const renderBareSymbol = (): string => {
  const colors = clampColorSet(COLOR_SETS[SAMPLE_COLORS[0]], colorCount);
  const paint = PATTERN_DEFS[patterns[0]].create(colors, "bare-pattern");
  return ReactDOMServer.renderToStaticMarkup(
    <svg viewBox={viewBox} xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {paint.defs && <defs>{paint.defs}</defs>}
      <g id="bare-symbol">
        <shape.Component colors={colors} fill={paint.fill} yolks={yolks[0]} />
      </g>
    </svg>
  );
};

process.stdout.write(
  JSON.stringify({
    shape: name,
    viewBox,
    supports,
    colorCount,
    symbolSize: SYMBOL_SIZE,
    cardViewport: MAIN_VIEWPORT_SIZE,
    axes: { numbers, patterns, rotations, colors: SAMPLE_COLORS, yolks },
    bare: renderBareSymbol(),
    variants: buildVariants().map((variant, index) => ({
      label: variant.label,
      svg: renderCard(variant.card, `v${index}`),
    })),
  })
);
