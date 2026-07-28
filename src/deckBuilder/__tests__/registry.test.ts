import { SHAPE_NAMES, SHAPE_REGISTRY } from "../shapes";
import { DEFAULT_CARD, FEATURE_NAMES, getFeatureOptions } from "../features";
import { COLOR_SETS } from "../features/colors";
import { PATTERN_DEFS, PATTERN_NAMES } from "../features/patterns";

// These names are stored in saved deck metadata and menu presets; renaming
// one is a breaking change for existing decks.
const LEGACY_SHAPE_NAMES = [
  "Circle - Quarter",
  "Circle - Semi",
  "Circle - Three Quarter",
  "Tetris - L Block",
  "Tetris - S Block",
  "Tetris - J Block",
  "Tetris - T Block",
  "Triangle",
  "Tracks - Deer",
  "Tracks - Wolf",
  "Tracks - Frog",
];

test("shape registry keeps the legacy shape names", () => {
  expect(SHAPE_NAMES).toEqual(LEGACY_SHAPE_NAMES);
});

test("every shape provides a component", () => {
  SHAPE_NAMES.forEach((name) => {
    expect(SHAPE_REGISTRY[name].Component).toBeDefined();
  });
});

test("feature options are non-empty and duplicate free", () => {
  FEATURE_NAMES.forEach((feature) => {
    const options = getFeatureOptions(feature);
    expect(options.length).toBeGreaterThan(0);
    expect(new Set(options).size).toBe(options.length);
  });
});

test("every color set has three valid hex colors", () => {
  Object.values(COLOR_SETS).forEach((colorSet) => {
    [colorSet.primary, colorSet.secondary, colorSet.tertiary].forEach((color) => {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });
});

test("every pattern declares how many colors it uses", () => {
  PATTERN_NAMES.forEach((name) => {
    expect([1, 2, 3]).toContain(PATTERN_DEFS[name].colorsUsed);
  });
});

test("default card values are valid options for their feature", () => {
  FEATURE_NAMES.forEach((feature) => {
    expect(getFeatureOptions(feature)).toContain(DEFAULT_CARD[feature]);
  });
});
