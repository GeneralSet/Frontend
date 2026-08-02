import * as React from "react";
import { ShapeDefinition, ShapeProps } from "../types";

/** An arched opening (door or window), wider at the base than the arch springs. */
const arch = (cx: number, hw: number, top: number, bottom: number) =>
  `M${cx - hw},${bottom} L${cx - hw},${top + hw} Q${cx},${top} ${cx + hw},${top + hw} L${cx + hw},${bottom} Z`;

/** A triangular spire roof sitting on a tower of half-width `hw`. */
const cone = (cx: number, hw: number, baseY: number, apexY: number) =>
  `M${cx - hw},${baseY} L${cx},${apexY} L${cx + hw},${baseY} Z`;

/** A pennant on a pole planted at `(cx, baseY)`, rising `poleLen` units. */
const flag = (cx: number, baseY: number, poleLen: number, pennantW = 14, pennantH = 10) => {
  const topY = baseY - poleLen;
  return {
    pole: { x1: cx, y1: baseY, x2: cx, y2: topY },
    pennant: `M${cx},${topY} L${cx + pennantW},${topY + pennantH / 2} L${cx},${topY + pennantH} Z`,
  };
};

interface RectSpec {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** One stage's full set of drawing instructions, in fill-then-outline order. */
interface Stage {
  fills: { d?: string; rect?: RectSpec; line?: never; color: string }[];
  lines: { x1: number; y1: number; x2: number; y2: number }[];
}

// ---------------------------------------------------------------- Stage 1: a
// lumpy hand-piled mound with a single notch and one flag. No towers at all.
const MOUND_BODY =
  "M40,58 L44,58 L44,42 L52,42 L52,58 L66,58 L66,42 L74,42 L74,58 L80,58 " +
  "Q86,64 94,68 Q104,72 102,88 Q110,96 104,110 L16,110 " +
  "Q10,96 18,88 Q16,72 26,68 Q34,64 40,58 Z";

const stage1 = (colors: ShapeProps["colors"], fill: string): Stage => {
  // The flag rises clear of the notch's teeth (apex y=42) before its
  // pennant unfurls, so the pole reads as a pole and not a third tooth.
  const mouthFlag = flag(59, 58, 38, 18, 12);
  return {
    fills: [
      { d: MOUND_BODY, color: fill },
      { d: arch(60, 12, 90, 110), color: colors.tertiary },
      { d: mouthFlag.pennant, color: colors.secondary },
    ],
    lines: [mouthFlag.pole],
  };
};

// ------------------------------------------------------ Stage 2: a modest
// keep — a squat crenellated block flanked by two flat-topped towers, one
// flag per tower. No spires yet.
const stage2 = (colors: ShapeProps["colors"], fill: string): Stage => {
  const leftFlag = flag(32, 50, 20);
  const rightFlag = flag(88, 50, 20);
  const wallRect: RectSpec = { x: 44, y: 64, width: 32, height: 46 };
  const leftTower: RectSpec = { x: 20, y: 50, width: 24, height: 60 };
  const rightTower: RectSpec = { x: 76, y: 50, width: 24, height: 60 };
  const merlons: RectSpec[] = [
    { x: 46, y: 54, width: 6, height: 10 },
    { x: 57, y: 54, width: 6, height: 10 },
    { x: 68, y: 54, width: 6, height: 10 },
    // Tower teeth leave a wide gap (10 units) at the flag's center so the
    // pole's 6-wide stroke never touches them.
    { x: 22, y: 40, width: 5, height: 10 },
    { x: 37, y: 40, width: 5, height: 10 },
    { x: 78, y: 40, width: 5, height: 10 },
    { x: 93, y: 40, width: 5, height: 10 },
  ];
  return {
    fills: [
      { rect: leftTower, color: fill },
      { rect: rightTower, color: fill },
      { rect: wallRect, color: fill },
      ...merlons.map((rect) => ({ rect, color: fill })),
      { d: arch(60, 10, 88, 110), color: colors.tertiary },
      { d: arch(32, 5, 84, 100), color: colors.tertiary },
      { d: arch(88, 5, 84, 100), color: colors.tertiary },
      { d: arch(52, 5, 80, 96), color: colors.tertiary },
      { d: arch(68, 5, 80, 96), color: colors.tertiary },
      { d: leftFlag.pennant, color: colors.secondary },
      { d: rightFlag.pennant, color: colors.secondary },
    ],
    lines: [leftFlag.pole, rightFlag.pole],
  };
};

// -------------------------------------------------------- Stage 3: spires
// arrive — a trapezoid wall with two shoulder towers and a taller center
// tower, all three roofed with cones and flying flags.
const stage3 = (colors: ShapeProps["colors"], fill: string): Stage => {
  const left = flag(38, 32, 18);
  const center = flag(60, 22, 14);
  const right = flag(82, 32, 18);
  const merlons: RectSpec[] = [
    { x: 46, y: 70, width: 6, height: 8 },
    { x: 68, y: 70, width: 6, height: 8 },
  ];
  return {
    fills: [
      { d: "M16,110 L28,78 L92,78 L104,110 Z", color: fill },
      ...merlons.map((rect) => ({ rect, color: fill })),
      { d: "M30,54 L46,54 L46,78 L30,78 Z", color: fill },
      { d: "M74,54 L90,54 L90,78 L74,78 Z", color: fill },
      { d: "M52,44 L68,44 L68,78 L52,78 Z", color: fill },
      { d: cone(38, 8, 54, 32), color: colors.secondary },
      { d: cone(82, 8, 54, 32), color: colors.secondary },
      { d: cone(60, 8, 44, 22), color: colors.secondary },
      { d: arch(60, 12, 92, 110), color: colors.tertiary },
      { d: arch(40, 5, 86, 102), color: colors.tertiary },
      { d: arch(80, 5, 86, 102), color: colors.tertiary },
      { d: left.pennant, color: colors.secondary },
      { d: center.pennant, color: colors.secondary },
      { d: right.pennant, color: colors.secondary },
    ],
    lines: [left.pole, center.pole, right.pole],
  };
};

// -------------------------------------------------------- Stage 4: a grand
// castle — five spires stepping up to a tall center keep, a bannered gate,
// and a hanging pennant over the door.
const stage4 = (colors: ShapeProps["colors"], fill: string): Stage => {
  const towers: { cx: number; top: number; roof: number; poleLen: number }[] = [
    { cx: 28, top: 58, roof: 40, poleLen: 14 },
    { cx: 44, top: 50, roof: 28, poleLen: 14 },
    { cx: 60, top: 42, roof: 20, poleLen: 12 },
    { cx: 76, top: 50, roof: 28, poleLen: 14 },
    { cx: 92, top: 58, roof: 40, poleLen: 14 },
  ];
  const flags = towers.map((t) => flag(t.cx, t.roof, t.poleLen, 12));
  return {
    fills: [
      { d: "M10,110 L22,74 L98,74 L110,110 Z", color: fill },
      ...towers.map((t) => ({ d: `M${t.cx - 7},${t.top} L${t.cx + 7},${t.top} L${t.cx + 7},82 L${t.cx - 7},82 Z`, color: fill })),
      ...towers.map((t) => ({ d: cone(t.cx, 7, t.top, t.roof), color: colors.secondary })),
      { d: "M54,76 L66,76 L66,86 L60,90 L54,86 Z", color: colors.secondary },
      { d: arch(60, 12, 84, 110), color: colors.tertiary },
      { d: arch(44, 4, 62, 74), color: colors.tertiary },
      { d: arch(76, 4, 62, 74), color: colors.tertiary },
      ...flags.map((f) => ({ d: f.pennant, color: colors.secondary })),
    ],
    lines: flags.map((f) => f.pole),
  };
};

const STAGES: Record<number, (colors: ShapeProps["colors"], fill: string) => Stage> = {
  1: stage1,
  2: stage2,
  3: stage3,
  4: stage4,
};

const Component = ({ colors, fill, spires = 1 }: ShapeProps) => {
  const build = STAGES[spires] || STAGES[1];
  const stage = build(colors, fill);

  return (
    <>
      <g stroke="none">
        {stage.fills.map((part, i) =>
          part.rect ? (
            <rect key={i} x={part.rect.x} y={part.rect.y} width={part.rect.width} height={part.rect.height} fill={part.color} />
          ) : (
            <path key={i} d={part.d} fill={part.color} />
          )
        )}
      </g>
      <g fill="none" stroke="#000000" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
        {stage.fills.map((part, i) =>
          part.rect ? (
            <rect key={i} x={part.rect.x} y={part.rect.y} width={part.rect.width} height={part.rect.height} />
          ) : (
            <path key={i} d={part.d} />
          )
        )}
        {stage.lines.map((line, i) => (
          <line key={i} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} />
        ))}
      </g>
    </>
  );
};

export const Sandcastle: ShapeDefinition = {
  Component,
  supports: { colors: 3, spires: [1, 2, 3, 4] },
};
