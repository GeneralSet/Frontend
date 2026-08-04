import * as React from "react";

/**
 * The three colors every shape receives. `primary` matches the single color
 * decks were built with historically; `secondary`/`tertiary` are derived
 * accents used by patterns or directly by shape components.
 */
export interface ColorSet {
  primary: string;
  secondary: string;
  tertiary: string;
}

/** The rotations a card can apply to its symbols. */
export type Rotation = 0 | 90 | 180 | 270;

/** Props every shape component receives from the deck generator. */
export interface ShapeProps {
  /**
   * Color set clamped to the shape's declared color support: a shape
   * supporting 1 color sees primary in all three slots, 2 colors sees
   * tertiary mirroring secondary. Fill vs stroke vs accent usage is the
   * shape's choice.
   */
  colors: ColorSet;
  /**
   * Resolved paint computed by the orchestrator: a solid color, "none", or a
   * `url(#...)` reference when a pattern is active and the shape supports it.
   */
  fill: string;
  /** Yolk count for shapes that declare `supports.yolks`. */
  yolks?: 1 | 2 | 3;
}

/**
 * Features a shape can opt in or out of. Every field is optional so a new
 * shape only declares what differs from the default (full support). Numbers
 * are universal: symbol count and layout are handled by the card.
 *
 * Note: a shape that opts out of a feature enabled in the deck metadata will
 * render identically for cards that only differ in that feature.
 */
export interface ShapeFeatureSupport {
  /**
   * true/undefined = all rotations, false = none, or the exact subset of
   * angles the shape supports. Rotation is always applied by the
   * orchestrator; unsupported angles fall back to 0.
   */
  rotations?: boolean | readonly Rotation[];
  filters?: boolean;
  patterns?: boolean;
  /**
   * How many of the color set's slots the shape can use: 1 = primary only,
   * 2 = primary + secondary, 3 (default) = the full set. Patterns needing
   * more colors than this fall back to solid.
   */
  colors?: 1 | 2 | 3;
  /**
   * true = all yolk counts, false/undefined = none (always 1), or the exact
   * subset of counts the shape supports. Unlike rotation there's no universal
   * neutral yolk count, so unsupported always falls back to 1.
   */
  yolks?: boolean | readonly (1 | 2 | 3)[];
}

/** A registered shape: a React component plus the features it supports. */
export interface ShapeDefinition {
  Component: React.ComponentType<ShapeProps>;
  /** Omit for full feature support. */
  supports?: ShapeFeatureSupport;
  /** Coordinate space the component draws in. Defaults to "0 0 120 120". */
  viewBox?: string;
}

/** A generated deck: card id ("0_1_2") to rendered card element. */
export interface FeatureDeck {
  [id: string]: JSX.Element;
}

/** Loose deck metadata for preset decks with arbitrary feature names. */
export interface DeckMetaData {
  [feature: string]: (string | number)[];
}

/**
 * How CardSvg sizes shapes within a card. "full" sizes every card in the
 * deck off the deck's largest `numbers` value, so shapes stay one uniform
 * size across the whole deck. "max" sizes each card off its own count,
 * independent of siblings, always filling as much of that card as its
 * count allows.
 */
export type CardSizeMode = "full" | "max";

/** The deck contract consumed by redux, the board, and the menu. */
export interface Deck {
  metaData: { readonly [feature: string]: readonly (string | number)[] | undefined };
  features: string[];
  numOptions: number;
  cards: FeatureDeck;
  /** Present on GeometricDeckGenerator decks; undefined on PresetDecks,
   * which render pre-baked images and have no notion of shape sizing. */
  cardSizeMode?: CardSizeMode;
}
