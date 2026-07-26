import * as React from "react";
import { ColorSet } from "../types";

/** A resolved fill treatment: defs to hoist into the card plus the paint. */
export interface PatternPaint {
  defs: React.ReactNode;
  fill: string;
}

export interface PatternDefinition {
  /** Highest color slot used: 1 = primary only, 2 = +secondary, 3 = +tertiary. */
  colorsUsed: 1 | 2 | 3;
  create: (colors: ColorSet, id: string) => PatternPaint;
}

const definePatterns = <T extends Record<string, PatternDefinition>>(defs: T): T => defs;

/**
 * Fill treatments by name — this is where a card's color set gets combined
 * into the shape's paint. `solid` with the primary color matches the
 * historical single-color rendering and is the fallback when a shape
 * supports fewer colors than a pattern uses. Ids are provided by the caller
 * so they stay unique per card.
 */
export const PATTERN_DEFS = definePatterns({
  open: {
    colorsUsed: 1,
    create: (): PatternPaint => ({ defs: null, fill: "none" }),
  },
  solid: {
    colorsUsed: 1,
    create: (colors: ColorSet): PatternPaint => ({ defs: null, fill: colors.primary }),
  },
  striped: {
    colorsUsed: 2,
    create: (colors: ColorSet, id: string): PatternPaint => ({
      defs: (
        <pattern
          id={id}
          key={id}
          width="8"
          height="10"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(90)"
        >
          <rect width="8" height="10" fill={colors.secondary} />
          <line stroke={colors.primary} strokeWidth="5px" y2="15" />
        </pattern>
      ),
      fill: `url(#${id})`,
    }),
  },
  gradient: {
    colorsUsed: 2,
    create: (colors: ColorSet, id: string): PatternPaint => ({
      defs: (
        <linearGradient id={id} key={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={colors.primary} />
          <stop offset="100%" stopColor={colors.secondary} />
        </linearGradient>
      ),
      fill: `url(#${id})`,
    }),
  },
  triangles: {
    colorsUsed: 3,
    create: (colors: ColorSet, id: string): PatternPaint => ({
      defs: (
        <pattern
          id={id}
          key={id}
          x="0"
          y="0"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <rect width="40" height="40" fill={colors.primary} />
          <polygon points="15,10 25,10 20,20" fill={colors.tertiary} />
        </pattern>
      ),
      fill: `url(#${id})`,
    }),
  },
});

export type PatternName = keyof typeof PATTERN_DEFS;

export const PATTERN_NAMES = Object.keys(PATTERN_DEFS) as PatternName[];

export const createPattern = (name: PatternName, colors: ColorSet, id: string): PatternPaint =>
  PATTERN_DEFS[name].create(colors, id);
