import * as React from "react";
import { ShapeDefinition, ShapeFeatureSupport, ShapeProps } from "../types";

/** Shared support declaration for every ice cream shape. */
const ICE_CREAM_SUPPORTS: ShapeFeatureSupport = {
  colors: 2,
  patterns: false,
  rotations: false,
  scoops: [0, 1, 2, 3, 4],
  topping: ["Chocolate Chips", "Cherry", "Rainbow Sprinkles", "Twisty Pretzel", "None"],
  sauce: ["Chocolate", "Strawberry", "Toffee", "Pistachio", "None"],
};

const OUTLINE = {
  fill: "none",
  stroke: "#000000",
  strokeWidth: 6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

interface Scoop {
  cx: number;
  cy: number;
  r: number;
}

/**
 * `[dyFromMouth, radius]` per scoop, bottom-to-top. Fewer scoops are drawn
 * larger; each scoop overlaps the one below it enough to read as a stack.
 * Typed `number[][]` rather than tuple types — the pinned
 * @typescript-eslint/parser crashes on tuple-array types and breaks the
 * production build, which `yarn test` never sees. See commit d8701ac.
 */
const SCOOP_OFFSETS: Record<number, number[][]> = {
  0: [],
  1: [[-16, 24]],
  2: [[-14, 20], [-34, 17]],
  3: [[-13, 17], [-30, 15], [-46, 13]],
  4: [[-12, 15], [-27, 13], [-41, 12], [-54, 11]],
};

const scoopCircles = (scoops: number, mouthY: number): Scoop[] =>
  (SCOOP_OFFSETS[scoops] || []).map(([dy, r]) => ({ cx: 60, cy: mouthY + dy, r }));

const renderScoopFills = (stack: Scoop[], fill: string) => (
  <>
    {stack.map((s, i) => (
      <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={fill} />
    ))}
  </>
);

const renderScoopOutlines = (stack: Scoop[]) => (
  <>
    {stack.map((s, i) => (
      <circle key={i} cx={s.cx} cy={s.cy} r={s.r} />
    ))}
  </>
);

/** Sauce is intrinsic to the flavor, not the card's color feature — fixed literal colors. */
const SAUCE_COLORS: Record<string, string> = {
  Chocolate: "#5C3317",
  Strawberry: "#F4436C",
  Toffee: "#A9702A",
  Pistachio: "#8DA047",
};

/** A drizzle squiggle scaled to the top scoop's own radius. */
const drizzlePath = (top: Scoop): string => {
  const { cx, cy, r } = top;
  const at = (dx: number, dy: number) => `${cx + dx * r},${cy + dy * r}`;
  return `M${at(-0.65, -0.2)} Q${at(-0.25, -1.0)} ${at(0.05, -0.35)} Q${at(0.35, 0.15)} ${at(
    0.65,
    -0.15
  )}`;
};

const renderSauce = (sauce: ShapeProps["sauce"], top: Scoop | undefined): JSX.Element | null => {
  if (!top || !sauce || sauce === "None") return null;
  const color = SAUCE_COLORS[sauce];
  if (!color) return null;
  return <path d={drizzlePath(top)} stroke={color} strokeWidth="4" strokeLinecap="round" fill="none" />;
};

/** Toppings are intrinsic to the flavor too — fixed literal colors, not the card's colors. */
const CHIP_COLOR = "#3B1F0E";
const CHERRY_COLOR = "#C1121F";
const CHERRY_STEM_COLOR = "#2E7D32";
const SPRINKLE_COLORS = ["#e6194B", "#3cb44b", "#4363d8", "#f58231"];
const PRETZEL_COLOR = "#B08461";

const CHIP_OFFSETS = [[0, -5], [5, -1], [-5, -1], [3, 4], [-3, 4]];
const SPRINKLE_OFFSETS = [
  [-4, -4, -20],
  [2, -6, 10],
  [6, -2, 35],
  [-6, 0, -35],
  [0, 2, 0],
  [4, 3, 20],
];

const renderTopping = (topping: ShapeProps["topping"], top: Scoop | undefined): JSX.Element | null => {
  if (!top || !topping || topping === "None") return null;
  const { cx, cy } = top;

  if (topping === "Chocolate Chips") {
    return (
      <g stroke="none" fill={CHIP_COLOR}>
        {CHIP_OFFSETS.map(([dx, dy], i) => (
          <circle key={i} cx={cx + dx} cy={cy + dy} r={2.5} />
        ))}
      </g>
    );
  }
  if (topping === "Cherry") {
    return (
      <g stroke="none">
        <path
          d={`M${cx - 1},${cy - 11} L${cx + 3},${cy - 11} L${cx + 1},${cy - 18} Z`}
          fill={CHERRY_STEM_COLOR}
        />
        <circle cx={cx} cy={cy - 7} r={6} fill={CHERRY_COLOR} />
      </g>
    );
  }
  if (topping === "Rainbow Sprinkles") {
    return (
      <g stroke="none">
        {SPRINKLE_OFFSETS.map(([dx, dy, rot], i) => (
          <rect
            key={i}
            x={cx + dx - 0.75}
            y={cy + dy - 2.5}
            width={1.5}
            height={5}
            rx={0.75}
            fill={SPRINKLE_COLORS[i % SPRINKLE_COLORS.length]}
            transform={`rotate(${rot} ${cx + dx} ${cy + dy})`}
          />
        ))}
      </g>
    );
  }
  // Twisty Pretzel: two small stroked loops, the same "colored accent stroke"
  // treatment as the sauce drizzle — a closed filled loop collapses into a
  // blob under the 6-unit outline stroke at this scale.
  return (
    <g fill="none" stroke={PRETZEL_COLOR} strokeWidth={3} strokeLinecap="round">
      <circle cx={cx - 4} cy={cy} r={4.5} />
      <circle cx={cx + 4} cy={cy} r={4.5} />
    </g>
  );
};

interface ContainerGeometry {
  mouthY: number;
  fill: string;
}

/**
 * A container drawn as a single closed path, no interior texture: at 26
 * device pixels a 6-unit-wide outline stroke swallows any thin interior
 * line (crosshatch, seam), so cones are told apart purely by proportion
 * (wide/shallow vs narrow/steep) — silhouette-first, per iconography.md.
 */
const buildComponent = ({ mouthY, fill: containerFill }: ContainerGeometry) => {
  const Component = ({
    colors,
    fill,
    scoops = 2,
    topping = "None",
    sauce = "None",
  }: ShapeProps) => {
    const stack = scoopCircles(scoops, mouthY);
    const top = stack[stack.length - 1];
    return (
      <>
        <g stroke="none">
          <path d={containerFill} fill={colors.secondary} />
          {renderScoopFills(stack, fill)}
        </g>
        <g {...OUTLINE}>
          <path d={containerFill} />
          {renderScoopOutlines(stack)}
        </g>
        {renderSauce(sauce, top)}
        {renderTopping(topping, top)}
      </>
    );
  };
  return Component;
};

const WaffleConeComponent = buildComponent({
  mouthY: 74,
  fill: "M18,74 L102,74 L60,112 Z",
});

const SugarConeComponent = buildComponent({
  mouthY: 74,
  fill: "M46,74 L74,74 L60,114 Z",
});

const SundaeCupComponent = ({ colors, fill, scoops = 2, topping = "None", sauce = "None" }: ShapeProps) => {
  const mouthY = 74;
  const stack = scoopCircles(scoops, mouthY);
  const top = stack[stack.length - 1];
  const cupPath = "M18,74 L102,74 L84,110 L36,110 Z";
  return (
    <>
      <g stroke="none">
        <path d={cupPath} fill={colors.secondary} />
        {renderScoopFills(stack, fill)}
      </g>
      <g {...OUTLINE}>
        <path d={cupPath} />
        <ellipse cx={60} cy={74} rx={42} ry={5} />
        {renderScoopOutlines(stack)}
      </g>
      {renderSauce(sauce, top)}
      {renderTopping(topping, top)}
    </>
  );
};

const SundaeGlassComponent = ({ colors, fill, scoops = 2, topping = "None", sauce = "None" }: ShapeProps) => {
  const mouthY = 74;
  const stack = scoopCircles(scoops, mouthY);
  const top = stack[stack.length - 1];
  const bowlPath = "M18,74 Q24,100 50,100 L70,100 Q96,100 102,74 Z";
  return (
    <>
      <g stroke="none">
        <path d={bowlPath} fill={colors.secondary} />
        <rect x={53} y={100} width={14} height={6} fill={colors.secondary} />
        <ellipse cx={60} cy={108} rx={24} ry={4} fill={colors.secondary} />
        {renderScoopFills(stack, fill)}
      </g>
      <g {...OUTLINE}>
        <path d={bowlPath} />
        <rect x={53} y={100} width={14} height={6} />
        <ellipse cx={60} cy={108} rx={24} ry={4} />
        <ellipse cx={60} cy={74} rx={42} ry={5} />
        {renderScoopOutlines(stack)}
      </g>
      {renderSauce(sauce, top)}
      {renderTopping(topping, top)}
    </>
  );
};

const BananaSplitComponent = ({ colors, fill, scoops = 2, topping = "None", sauce = "None" }: ShapeProps) => {
  const mouthY = 82;
  const stack = scoopCircles(scoops, mouthY);
  const top = stack[stack.length - 1];
  const leftBanana = "M8,100 Q16,64 48,82 Q30,90 8,100 Z";
  const rightBanana = "M112,100 Q104,64 72,82 Q90,90 112,100 Z";
  return (
    <>
      <g stroke="none">
        <ellipse cx={60} cy={100} rx={50} ry={14} fill={colors.secondary} />
        <path d={leftBanana} fill={colors.secondary} />
        <path d={rightBanana} fill={colors.secondary} />
        {renderScoopFills(stack, fill)}
      </g>
      <g {...OUTLINE}>
        <ellipse cx={60} cy={100} rx={50} ry={14} />
        <path d={leftBanana} />
        <path d={rightBanana} />
        {renderScoopOutlines(stack)}
      </g>
      {renderSauce(sauce, top)}
      {renderTopping(topping, top)}
    </>
  );
};

export const IceCreamWaffleCone: ShapeDefinition = {
  Component: WaffleConeComponent,
  supports: ICE_CREAM_SUPPORTS,
};

export const IceCreamSugarCone: ShapeDefinition = {
  Component: SugarConeComponent,
  supports: ICE_CREAM_SUPPORTS,
};

export const IceCreamSundaeCup: ShapeDefinition = {
  Component: SundaeCupComponent,
  supports: ICE_CREAM_SUPPORTS,
};

export const IceCreamSundaeGlass: ShapeDefinition = {
  Component: SundaeGlassComponent,
  supports: ICE_CREAM_SUPPORTS,
};

export const IceCreamBananaSplit: ShapeDefinition = {
  Component: BananaSplitComponent,
  supports: ICE_CREAM_SUPPORTS,
};
