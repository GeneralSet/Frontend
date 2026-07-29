import * as React from "react";
import { ShapeDefinition, ShapeProps } from "../types";

const YOLK_OFFSETS: Record<number, number[][]> = {
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
