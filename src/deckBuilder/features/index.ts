import { Rotation } from "../types";
import { SHAPE_NAMES, ShapeName } from "../shapes";
import { COLOR_NAMES, ColorName } from "./colors";
import { FILTER_NAMES, FilterName } from "./filters";
import { PATTERN_NAMES, PatternName } from "./patterns";

export const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
export const ROTATIONS: readonly Rotation[] = [0, 90, 180, 270];
export const YOLKS = [1, 2, 3] as const;
export const SPIRES = [1, 2, 3] as const;

/**
 * The features a generated deck can vary, mapped to their option value type.
 * This drives everything else: `CardData`, deck metadata, and the editor UI
 * are all derived from it. To add a feature, add it here and to `FEATURES`,
 * give it a default in `DEFAULT_CARD`, and teach `CardSvg` how to apply it.
 */
interface FeatureOptionMap {
  shapes: ShapeName;
  colors: ColorName;
  numbers: (typeof NUMBERS)[number];
  rotations: Rotation;
  filters: FilterName;
  patterns: PatternName;
  yolks: (typeof YOLKS)[number];
  spires: (typeof SPIRES)[number];
}

export type FeatureName = keyof FeatureOptionMap;

/** The option value type of a single feature, e.g. FeatureValue<"rotations"> = Rotation. */
export type FeatureValue<F extends FeatureName> = FeatureOptionMap[F];

/** One card's resolved value for every feature. */
export type CardData = FeatureOptionMap;

/** Metadata for a generated deck: the varying features and their per-card options. */
export type GeneratedDeckMetaData = { [F in FeatureName]?: FeatureValue<F>[] };

export interface FeatureConfig<F extends FeatureName> {
  label: string;
  options: readonly FeatureValue<F>[];
  /**
   * True for shape-only custom features with no universal neutral value
   * (see ShapeFeatureSupport's doc comments) — every card's shape must
   * explicitly declare support before the editor lets this vary per card.
   * Omit (false) for features that default to full support, like rotations/
   * filters/patterns/colors.
   */
  requiresShapeSupport?: boolean;
}

/** Display label and full option list for every feature. */
export const FEATURES: { readonly [F in FeatureName]: FeatureConfig<F> } = {
  shapes: { label: "Symbol", options: SHAPE_NAMES },
  colors: { label: "Color", options: COLOR_NAMES },
  numbers: { label: "Number", options: NUMBERS },
  rotations: { label: "Rotation", options: ROTATIONS },
  filters: { label: "Filter", options: FILTER_NAMES },
  patterns: { label: "Pattern", options: PATTERN_NAMES },
  yolks: { label: "Yolks", options: YOLKS, requiresShapeSupport: true },
  spires: { label: "Spires", options: SPIRES, requiresShapeSupport: true },
};

export const FEATURE_NAMES = Object.keys(FEATURES) as FeatureName[];

export const isFeatureName = (feature: string): feature is FeatureName =>
  feature in FEATURES;

/** Whether loose deck metadata (e.g. from a preset deck) only uses known features. */
export const isGeneratedMetaData = (metaData: {
  readonly [feature: string]: unknown;
}): metaData is GeneratedDeckMetaData => Object.keys(metaData).every(isFeatureName);

export const DEFAULT_CARD: CardData = {
  shapes: "Circle - Three Quarter",
  colors: "Black",
  numbers: 1,
  rotations: 0,
  filters: "none",
  patterns: "solid",
  yolks: 1,
  spires: 1,
};

export function getFeatureOptions<F extends FeatureName>(feature: F): readonly FeatureValue<F>[] {
  return FEATURES[feature].options;
}

/** Narrow a raw `<select>` string back to a typed option value. */
export function coerceFeatureValue<F extends FeatureName>(feature: F, raw: string): FeatureValue<F> {
  const match = getFeatureOptions(feature).find((option) => String(option) === raw);
  if (match === undefined) {
    throw new Error(`Invalid option "${raw}" for feature "${feature}"`);
  }
  return match;
}

/** Pick a random option for a feature that isn't already in use. */
export function getAvailableValue<F extends FeatureName>(
  feature: F,
  used: readonly FeatureValue<F>[]
): FeatureValue<F> {
  const available = getFeatureOptions(feature).filter((option) => !used.includes(option));
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * `count` distinct options for a feature, one per card. `keep` pins a value to
 * index `keepIndex` — the shared default of a feature being switched on — and
 * is reserved up front so no later slot can collide with it (getAvailableValue
 * only knows to avoid values it has already been told about).
 */
export function assignDistinctValues<F extends FeatureName>(
  feature: F,
  count: number,
  keep?: FeatureValue<F>,
  keepIndex = 0
): FeatureValue<F>[] {
  const assigned: FeatureValue<F>[] = keep === undefined ? [] : [keep];
  const values: FeatureValue<F>[] = [];
  for (let i = 0; i < count; i++) {
    if (keep !== undefined && i === keepIndex) {
      values.push(keep);
    } else {
      const value = getAvailableValue(feature, assigned);
      values.push(value);
      assigned.push(value);
    }
  }
  return values;
}

/**
 * Assign one feature's option list on deck metadata. TypeScript cannot check
 * writes through a generic key on an optional mapped type directly, so every
 * metadata write funnels through this setter's re-keyed view.
 */
export function setFeatureOptions<F extends FeatureName>(
  metaData: GeneratedDeckMetaData,
  feature: F,
  values: FeatureValue<F>[]
): void {
  const view: { [P in F]?: FeatureValue<P>[] } = metaData;
  view[feature] = values;
}

/** Read one feature's option list from deck metadata with a fully reduced type. */
export function getEnabledOptions<F extends FeatureName>(
  metaData: GeneratedDeckMetaData,
  feature: F
): FeatureValue<F>[] | undefined {
  const view: { [P in F]?: FeatureValue<P>[] } = metaData;
  return view[feature];
}

/** Remove one card's option from every enabled feature of the metadata. */
export function removeCardOptions(
  metaData: GeneratedDeckMetaData,
  index: number
): GeneratedDeckMetaData {
  const next: GeneratedDeckMetaData = { ...metaData };
  FEATURE_NAMES.forEach(<F extends FeatureName>(feature: F) => {
    const values = getEnabledOptions(next, feature);
    if (values) {
      setFeatureOptions(next, feature, values.filter((_, i) => i !== index));
    }
  });
  return next;
}

/** Append a random unused option to every enabled feature of the metadata. */
export function addCardOptions(metaData: GeneratedDeckMetaData): GeneratedDeckMetaData {
  const next: GeneratedDeckMetaData = { ...metaData };
  FEATURE_NAMES.forEach(<F extends FeatureName>(feature: F) => {
    const values = getEnabledOptions(next, feature);
    if (values) {
      setFeatureOptions(next, feature, [...values, getAvailableValue(feature, values)]);
    }
  });
  return next;
}
