import * as React from "react";
import { ShapeDefinition, ShapeProps } from "../types";

/**
 * Parts the card's color feature doesn't drive. `clampColorSet` collapses the
 * slots a shape doesn't declare onto the ones it does, so a repeated slot is
 * this shape's signal that no color was provided for that part: the white
 * falls back to white, the outline to black.
 */
const EGG_WHITE = "#ffffff";
const EGG_BORDER = "#000000";

/**
 * The white: a lobed blob of quadratics. Four lobes reach 50-56 units from
 * center with the sides between them pulling back to 44-48, and no two lobes
 * share a radius or sit at an even angle — that lopsidedness is what keeps the
 * egg distinct from the round shapes once it shrinks to card size. Inset far
 * enough that the 6-wide outline is never shaved by the symbol clip.
 */
const WHITE_PATH =
  "M22,22 Q40,8 62,14 Q82,11 96,26 Q112,41 108,63 Q112,85 98,101 " +
  "Q78,113 56,104 Q36,108 22,95 Q8,77 14,55 Q9,36 22,22 Z";

/**
 * `[cx, cy, r]` per yolk, keyed by yolk count — fewer yolks are drawn larger.
 * Typed `number[][]` rather than `[number, number, number][]` because the
 * pinned @typescript-eslint/parser crashes on tuple-array types and breaks the
 * production build, which `yarn test` never sees. See commit d8701ac.
 */
const YOLK_LAYOUTS: Record<number, number[][]> = {
  1: [[55, 56, 21]],
  2: [[40, 44, 18], [78, 76, 18]],
  3: [[38, 42, 15], [80, 42, 15], [58, 80, 15]],
};

/** Glisten geometry as fractions of the yolk radius: offset, length, width. */
const GLISTEN_OFFSET = 0.38;
const GLISTEN_RX = 0.42;
const GLISTEN_RY = 0.22;

const Component = ({ colors, fill, yolks = 1 }: ShapeProps) => {
  const white = colors.secondary === colors.primary ? EGG_WHITE : colors.secondary;
  const border = colors.tertiary === colors.secondary ? EGG_BORDER : colors.tertiary;
  const layout = YOLK_LAYOUTS[yolks] || YOLK_LAYOUTS[1];

  return (
    <>
      <g stroke="none">
        <path d={WHITE_PATH} fill={white} />
        {layout.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill={fill} />
        ))}
      </g>
      <g
        fill="none"
        stroke={border}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={WHITE_PATH} />
        {layout.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} />
        ))}
      </g>
      {/* A tangential streak of light on the upper left of each yolk. */}
      <g stroke="none" fill={white}>
        {layout.map(([cx, cy, r], i) => (
          <ellipse
            key={i}
            cx={0}
            cy={0}
            rx={r * GLISTEN_RX}
            ry={r * GLISTEN_RY}
            transform={
              `translate(${cx - r * GLISTEN_OFFSET} ${cy - r * GLISTEN_OFFSET}) rotate(-45)`
            }
          />
        ))}
      </g>
    </>
  );
};

export const FriedEgg: ShapeDefinition = {
  Component,
  supports: { colors: 1, patterns: false, yolks: [1, 2, 3] },
};
