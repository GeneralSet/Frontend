import * as React from "react";
import { ShapeDefinition, ShapeFeatureSupport, ShapeProps } from "../types";

/**
 * Build a shape definition from a single SVG path. The path is stroked with
 * the primary color and filled with whatever paint the card resolved (solid
 * color or pattern). Omit `supports` for full feature support.
 */
export function definePathShape(
  d: string,
  supports?: ShapeFeatureSupport
): ShapeDefinition {
  const Component: React.FC<ShapeProps> = ({ colors, fill }) => (
    <path d={d} fill={fill} stroke={colors.primary} strokeWidth="1" fillRule="evenodd" />
  );
  return { Component, supports };
}
