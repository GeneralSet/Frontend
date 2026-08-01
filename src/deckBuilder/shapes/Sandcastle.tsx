import * as React from "react";
import { ShapeDefinition, ShapeProps } from "../types";

/** The main mound of the castle: a wall tapering inward from the ground up. */
const WALL = "M16,110 L28,78 L92,78 L104,110 Z";

/** An arched doorway cut into the base of the wall. */
const DOOR = "M50,110 L50,94 Q60,78 70,94 L70,110 Z";

/**
 * `[cx, y, r]` per window, fixed regardless of spire count — they sit low on
 * the wall, well clear of any turret rising above.
 */
const WINDOWS: number[][] = [
  [40, 90, 7],
  [80, 90, 7],
];

/**
 * Turret center x-positions keyed by spire count. Turrets sit flush on the
 * wall's top edge (y=78) and spread further apart as more of them appear,
 * without ever crowding past the wall's own top edge (x: 28-92).
 */
const SPIRE_CENTERS: Record<number, number[]> = {
  1: [60],
  2: [42, 78],
  3: [38, 60, 82],
};

const TURRET_TOP = 54;
const TURRET_HALF_WIDTH = 8;
const ROOF_APEX_Y = 28;
const FLAG_TOP_Y = 14;

const turretRect = (cx: number) =>
  `M${cx - TURRET_HALF_WIDTH},${TURRET_TOP} L${cx + TURRET_HALF_WIDTH},${TURRET_TOP} ` +
  `L${cx + TURRET_HALF_WIDTH},78 L${cx - TURRET_HALF_WIDTH},78 Z`;

const roofPath = (cx: number) =>
  `M${cx - TURRET_HALF_WIDTH},${TURRET_TOP} L${cx},${ROOF_APEX_Y} L${cx + TURRET_HALF_WIDTH},${TURRET_TOP} Z`;

const flagPennant = (cx: number) => `M${cx},${FLAG_TOP_Y} L${cx + 14},19 L${cx},24 Z`;

const Component = ({ colors, fill, spires = 1 }: ShapeProps) => {
  const centers = SPIRE_CENTERS[spires] || SPIRE_CENTERS[1];

  return (
    <>
      <g stroke="none">
        <path d={WALL} fill={fill} />
        {centers.map((cx) => (
          <path key={`turret-${cx}`} d={turretRect(cx)} fill={fill} />
        ))}
        {centers.map((cx) => (
          <path key={`roof-${cx}`} d={roofPath(cx)} fill={colors.secondary} />
        ))}
        {centers.map((cx) => (
          <path key={`flag-${cx}`} d={flagPennant(cx)} fill={colors.secondary} />
        ))}
        <path d={DOOR} fill={colors.secondary} />
        {WINDOWS.map(([cx, cy, r]) => (
          <circle key={`window-${cx}`} cx={cx} cy={cy} r={r} fill={colors.secondary} />
        ))}
      </g>
      <g fill="none" stroke="#000000" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
        <path d={WALL} />
        {centers.map((cx) => (
          <path key={`turret-outline-${cx}`} d={turretRect(cx)} />
        ))}
        {centers.map((cx) => (
          <path key={`roof-outline-${cx}`} d={roofPath(cx)} />
        ))}
        {centers.map((cx) => (
          <React.Fragment key={`flag-outline-${cx}`}>
            <line x1={cx} y1={ROOF_APEX_Y} x2={cx} y2={FLAG_TOP_Y} />
            <path d={flagPennant(cx)} />
          </React.Fragment>
        ))}
        <path d={DOOR} />
        {WINDOWS.map(([cx, cy, r]) => (
          <circle key={`window-outline-${cx}`} cx={cx} cy={cy} r={r} />
        ))}
      </g>
    </>
  );
};

export const Sandcastle: ShapeDefinition = {
  Component,
  supports: { colors: 2, spires: [1, 2, 3] },
};
