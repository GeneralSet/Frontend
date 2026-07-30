import { ShapeDefinition } from "../types";
import { SHAPE_NAMES, ShapeName } from "../shapes";
import { YOLKS, GeneratedDeckMetaData, getFeatureOptions } from "../features";
import {
  MAX_CARDS,
  SHAPE_ONLY_FEATURES,
  canShapeFillDeck,
  canShapesSupplyFeature,
  collapseToShape,
  getMaxCards,
  getShapeCardCapacity,
  getShapeFeature,
  getShapeOnlyFeatures,
  getSupportedFeatureValues,
} from "../deckRules";
import { DEFAULT_CARD } from "../features";

// Two shapes that don't exist yet, standing in for whatever gets added later:
// one owning the full yolks range, one owning only part of it. Nothing here
// names the fried egg, so a future shape has to work by the same rules.
jest.mock("../shapes", () => {
  const actual = jest.requireActual("../shapes");
  const Stub = () => null;
  return {
    ...actual,
    SHAPE_REGISTRY: {
      ...actual.SHAPE_REGISTRY,
      "Stub - All Yolks": { Component: Stub, supports: { yolks: true } },
      "Stub - Two Yolks": { Component: Stub, supports: { yolks: [1, 2] } },
      "Stub - Plain": { Component: Stub, supports: { patterns: false } },
    } as Record<string, ShapeDefinition>,
  };
});

const ALL_YOLKS = "Stub - All Yolks" as ShapeName;
const TWO_YOLKS = "Stub - Two Yolks" as ShapeName;
const PLAIN = "Stub - Plain" as ShapeName;

const DECK: GeneratedDeckMetaData = {
  shapes: ["Circle - Three Quarter", "Circle - Quarter", "Circle - Semi"],
  colors: ["Red", "Yellow", "Blue"],
  numbers: [9, 3, 4],
};

test("yolks is the only shape-only feature today", () => {
  expect(SHAPE_ONLY_FEATURES).toEqual(["yolks"]);
});

test("a shape owning no internal feature backs a single card", () => {
  const plainShapes = SHAPE_NAMES.filter((name) => getShapeOnlyFeatures(name).length === 0);
  expect(plainShapes).toContain("Triangle");
  plainShapes.forEach((name) => {
    expect(getShapeFeature(name)).toBeUndefined();
    expect(getShapeCardCapacity(name)).toBe(1);
  });
});

test("the fried egg backs one card per yolk count", () => {
  expect(getShapeOnlyFeatures("Fried Egg")).toEqual(["yolks"]);
  expect(getShapeCardCapacity("Fried Egg")).toBe(YOLKS.length);
});

test("capacity comes from the shape's own declaration, not a known shape list", () => {
  expect(getShapeCardCapacity(ALL_YOLKS)).toBe(getFeatureOptions("yolks").length);
  expect(getShapeCardCapacity(TWO_YOLKS)).toBe(2);
  expect(getShapeCardCapacity(PLAIN)).toBe(1);
});

test("a symbol may fill a deck only up to what its feature can tell apart", () => {
  expect(canShapeFillDeck("Fried Egg", 2)).toBe(true);
  expect(canShapeFillDeck("Fried Egg", 3)).toBe(true);
  expect(canShapeFillDeck("Fried Egg", 4)).toBe(false);

  expect(canShapeFillDeck(TWO_YOLKS, 2)).toBe(true);
  expect(canShapeFillDeck(TWO_YOLKS, 3)).toBe(false);
});

test("a symbol with no internal feature can never fill a deck", () => {
  expect(canShapeFillDeck("Triangle", 2)).toBe(false);
  expect(canShapeFillDeck(PLAIN, 2)).toBe(false);
});

test("deck size is capped by the smallest option pool in play", () => {
  expect(getMaxCards(DECK)).toBe(MAX_CARDS);
  expect(getMaxCards({})).toBe(MAX_CARDS);
  expect(getMaxCards({ ...DECK, yolks: [1, 2, 3] })).toBe(YOLKS.length);
});

test("features that are off do not cap the deck", () => {
  expect(getMaxCards({ colors: ["Red", "Blue"] })).toBe(MAX_CARDS);
});

test("collapsing onto a shape stops the symbol varying and starts its feature", () => {
  const { deckData, deckDefaults } = collapseToShape(
    { deckData: DECK, deckDefaults: DEFAULT_CARD },
    "Fried Egg",
    3
  );

  expect(deckData.shapes).toBeUndefined();
  expect(deckDefaults.shapes).toBe("Fried Egg");
  expect(deckData.yolks).toHaveLength(3);
  expect(new Set(deckData.yolks).size).toBe(3);
  deckData.yolks?.forEach((yolk) => expect(YOLKS).toContain(yolk));
});

test("collapsing leaves the deck's other features untouched", () => {
  const { deckData } = collapseToShape({ deckData: DECK, deckDefaults: DEFAULT_CARD }, "Fried Egg", 3);

  expect(deckData.colors).toEqual(DECK.colors);
  expect(deckData.numbers).toEqual(DECK.numbers);
  expect(DECK.shapes).toBeDefined();
});

test("collapsing onto a shape with no internal feature just fixes the symbol", () => {
  const { deckData, deckDefaults } = collapseToShape(
    { deckData: DECK, deckDefaults: DEFAULT_CARD },
    "Triangle",
    3
  );

  expect(deckData.shapes).toBeUndefined();
  expect(deckDefaults.shapes).toBe("Triangle");
  expect(deckData.yolks).toBeUndefined();
});

test("collapsing gives a partial-support shape only the values it declares", () => {
  const { deckData } = collapseToShape({ deckData: DECK, deckDefaults: DEFAULT_CARD }, TWO_YOLKS, 2);

  expect(deckData.yolks).toEqual([1, 2]);
});

test("a feature offers only the values every shape in play can draw", () => {
  expect(getSupportedFeatureValues(["Fried Egg"], "yolks")).toEqual([...YOLKS]);
  expect(getSupportedFeatureValues([TWO_YOLKS], "yolks")).toEqual([1, 2]);
  expect(getSupportedFeatureValues([ALL_YOLKS, TWO_YOLKS], "yolks")).toEqual([1, 2]);
  expect(getSupportedFeatureValues(["Fried Egg", "Triangle"], "yolks")).toEqual([]);
});

test("a feature stays locked when it cannot give every card its own value", () => {
  expect(canShapesSupplyFeature(["Fried Egg", "Fried Egg"], "yolks", 3)).toBe(true);
  // Three yolk counts cannot tell four cards apart.
  expect(canShapesSupplyFeature(["Fried Egg", "Fried Egg"], "yolks", 4)).toBe(false);
  expect(canShapesSupplyFeature([TWO_YOLKS], "yolks", 3)).toBe(false);
  expect(canShapesSupplyFeature(["Triangle"], "yolks", 2)).toBe(false);
});
