import * as React from "react";
import { CardData } from "./features";
import { COLOR_SETS, clampColorSet } from "./features/colors";
import { FILTER_DEFS, FilterName } from "./features/filters";
import { PATTERN_DEFS, PatternName, createPattern } from "./features/patterns";
import { SHAPE_REGISTRY } from "./shapes";
import { Rotation, ShapeFeatureSupport } from "./types";

export const MAIN_VIEWPORT_SIZE = 120;

const DEFAULT_SHAPE_VIEW_BOX = "0 0 120 120";
const SYMBOL_MARGIN = 2;
export const SYMBOL_SIZE = MAIN_VIEWPORT_SIZE / 3 - SYMBOL_MARGIN;

/** The nine symbol slots on a card, center first so odd counts stay centered. */
const POSITIONS = (() => {
  const start = 0;
  const middle = MAIN_VIEWPORT_SIZE / 2 - SYMBOL_SIZE / 2;
  const end = MAIN_VIEWPORT_SIZE - SYMBOL_SIZE;
  return [
    { x: middle, y: middle },
    { x: start, y: end },
    { x: end, y: start },
    { x: end, y: end },
    { x: start, y: start },
    { x: end, y: middle },
    { x: start, y: middle },
    { x: middle, y: start },
    { x: middle, y: end },
  ];
})();

const resolveRotation = (
  supported: ShapeFeatureSupport["rotations"],
  rotation: Rotation
): Rotation => {
  if (supported === false) {
    return 0;
  }
  if (supported === true || supported === undefined) {
    return rotation;
  }
  return supported.includes(rotation) ? rotation : 0;
};

const resolveYolks = (
  supported: ShapeFeatureSupport["yolks"],
  yolks: number
): number => {
  if (supported === false || supported === undefined) return 1;
  if (supported === true) return yolks;
  return supported.includes(yolks as 1 | 2 | 3) ? yolks : supported[0];
};

interface Props {
  card: CardData;
  /** Document-unique id, used to namespace this card's SVG defs. */
  cardId: string;
}

/**
 * Renders one card: lays out `card.numbers` copies of the shape component and
 * applies the card's features, downgrading any the shape doesn't support
 * (rotation to 0, filter to none, pattern to solid — including patterns that
 * use more colors than the shape declares).
 */
export const CardSvg = ({ card, cardId }: Props) => {
  const shape = SHAPE_REGISTRY[card.shapes];
  const supports = shape.supports || {};
  const colorCount = supports.colors === undefined ? 3 : supports.colors;

  const colors = clampColorSet(COLOR_SETS[card.colors], colorCount);
  const filterName: FilterName = supports.filters === false ? "none" : card.filters;
  const rotation = resolveRotation(supports.rotations, card.rotations);
  const yolks = resolveYolks(supports.yolks, card.yolks);
  let patternName: PatternName = supports.patterns === false ? "solid" : card.patterns;
  if (PATTERN_DEFS[patternName].colorsUsed > colorCount) {
    patternName = "solid";
  }

  const filterId = `flt-${cardId}`;
  const filterDef = FILTER_DEFS[filterName];
  const paint = createPattern(patternName, colors, `pat-${cardId}`);

  const viewBox = shape.viewBox || DEFAULT_SHAPE_VIEW_BOX;
  const [minX, minY, width, height] = viewBox.split(" ").map(Number);
  const rotationCenter = { x: minX + width / 2, y: minY + height / 2 };

  const symbols: JSX.Element[] = [];
  const offset = card.numbers % 2 ? 0 : 1;
  for (let i = 0; i < card.numbers; i++) {
    const { x, y } = POSITIONS[i + offset];
    symbols.push(
      <svg x={x} y={y} width={SYMBOL_SIZE} height={SYMBOL_SIZE} viewBox={viewBox} key={`${x}-${y}`}>
        <g
          filter={filterDef ? `url(#${filterId})` : undefined}
          transform={
            rotation ? `rotate(${rotation}, ${rotationCenter.x}, ${rotationCenter.y})` : undefined
          }
        >
          <shape.Component colors={colors} fill={paint.fill} yolks={yolks as 1 | 2 | 3} />
        </g>
      </svg>
    );
  }

  return (
    <svg
      height="100%"
      width="100%"
      viewBox={`0 0 ${MAIN_VIEWPORT_SIZE} ${MAIN_VIEWPORT_SIZE}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {(filterDef || paint.defs) && (
        <defs>
          {filterDef && filterDef(filterId)}
          {paint.defs}
        </defs>
      )}
      {symbols}
    </svg>
  );
};
