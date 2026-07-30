import { SHAPE_REGISTRY, ShapeName } from "./shapes";
import { ShapeFeatureSupport } from "./types";
import {
  CardData,
  FEATURES,
  FEATURE_NAMES,
  FeatureName,
  FeatureValue,
  GeneratedDeckMetaData,
  getEnabledOptions,
  getFeatureOptions,
  setFeatureOptions,
} from "./features";

/**
 * The rules governing how many cards a deck can hold and when a symbol may
 * repeat across them. Kept out of `shapes/index.ts` because these rules need
 * the feature table, which already imports the shape registry.
 */

/** Hard ceiling on cards, independent of which features vary. */
export const MAX_CARDS = 4;

/**
 * Features that belong to a shape rather than to every deck — flagged
 * `requiresShapeSupport` in FEATURES, and opted into per shape via
 * `ShapeDefinition.supports`. The fried egg's yolk count is the first.
 */
export const SHAPE_ONLY_FEATURES: FeatureName[] = FEATURE_NAMES.filter(
  (feature) => FEATURES[feature].requiresShapeSupport
);

/**
 * The values of `feature` that every one of `shapes` can render: the whole
 * option list for a shape declaring `true`, the listed subset for one naming
 * values, nothing for a shape that declares no support. Returned in the
 * feature's own option order.
 */
export function getSupportedFeatureValues<F extends FeatureName>(
  shapes: readonly ShapeName[],
  feature: F
): FeatureValue<F>[] {
  const declared = (shape: ShapeName) =>
    SHAPE_REGISTRY[shape].supports?.[feature as keyof ShapeFeatureSupport];
  return getFeatureOptions(feature).filter((option) =>
    shapes.every((shape) => {
      const supported = declared(shape);
      return supported === true || (Array.isArray(supported) && supported.includes(option));
    })
  );
}

/** The shape-only features `shape` declares usable values for. */
export const getShapeOnlyFeatures = (shape: ShapeName): FeatureName[] =>
  SHAPE_ONLY_FEATURES.filter((feature) => getSupportedFeatureValues([shape], feature).length > 0);

/**
 * The internal feature best able to tell apart cards that share this shape —
 * the one offering the most values. Undefined for a shape that owns none.
 */
export const getShapeFeature = (shape: ShapeName): FeatureName | undefined =>
  getShapeOnlyFeatures(shape).reduce<FeatureName | undefined>((widest, feature) => {
    const count = getSupportedFeatureValues([shape], feature).length;
    return widest === undefined || count > getSupportedFeatureValues([shape], widest).length
      ? feature
      : widest;
  }, undefined);

/**
 * How many cards one shape can back on its own. A plain shape backs a single
 * card — the symbol *is* what tells that card from the others — while a shape
 * owning an internal feature can back one card per value of that feature.
 */
export const getShapeCardCapacity = (shape: ShapeName): number => {
  const feature = getShapeFeature(shape);
  return feature === undefined ? 1 : getSupportedFeatureValues([shape], feature).length;
};

/**
 * Whether every card of an `numberOfCards`-card deck may share this shape.
 * Repeating a symbol is all-or-nothing (see `collapseToShape`), so the shape's
 * internal feature has to have a value to spare for each card.
 */
export const canShapeFillDeck = (shape: ShapeName, numberOfCards: number): boolean => {
  const capacity = getShapeCardCapacity(shape);
  return capacity > 1 && capacity >= numberOfCards;
};

/**
 * Whether a shape-only feature can give each card its own value given the
 * shapes in play — what unlocks the feature's controls in the editor.
 */
export const canShapesSupplyFeature = (
  shapes: readonly ShapeName[],
  feature: FeatureName,
  numberOfCards: number
): boolean => getSupportedFeatureValues(shapes, feature).length >= numberOfCards;

/**
 * The most cards a deck can hold: every varying feature needs a distinct value
 * per card, so the smallest option pool in play sets the limit.
 */
export const getMaxCards = (metaData: GeneratedDeckMetaData): number =>
  FEATURE_NAMES.reduce(
    (max, feature) =>
      getEnabledOptions(metaData, feature) ? Math.min(max, getFeatureOptions(feature).length) : max,
    MAX_CARDS
  );

/** The editor's deck state: the features that vary, plus the values shared by every card. */
export interface DeckState {
  deckData: GeneratedDeckMetaData;
  deckDefaults: CardData;
}

const enableFeature = <F extends FeatureName>(
  metaData: GeneratedDeckMetaData,
  feature: F,
  shape: ShapeName,
  count: number
): void =>
  setFeatureOptions(metaData, feature, getSupportedFeatureValues([shape], feature).slice(0, count));

/**
 * Hand the symbol feature's job over to a shape's own internal feature: every
 * card becomes `shape`, so the symbol stops varying and moves to the shared
 * defaults, and the shape's internal feature switches on with a distinct value
 * per card. Without the handover a repeated symbol would leave the deck's
 * cartesian product holding cards that render identically.
 */
export const collapseToShape = (
  state: DeckState,
  shape: ShapeName,
  numberOfCards: number
): DeckState => {
  const deckData: GeneratedDeckMetaData = { ...state.deckData };
  delete deckData.shapes;
  const feature = getShapeFeature(shape);
  if (feature !== undefined && !getEnabledOptions(deckData, feature)) {
    enableFeature(deckData, feature, shape, numberOfCards);
  }
  return { deckData, deckDefaults: { ...state.deckDefaults, shapes: shape } };
};
