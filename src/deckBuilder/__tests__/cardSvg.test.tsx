import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import { CardSvg } from "../CardSvg";
import { CardData } from "../features";
import { ShapeProps } from "../types";

// Stub out two registry entries to exercise feature downgrading: a shape
// opting out of everything, and one supporting a rotation subset + 2 colors.
jest.mock("../shapes", () => {
  const actual = jest.requireActual("../shapes");
  const React = jest.requireActual("react");
  const Stub = ({ colors, fill }: ShapeProps) => (
    <rect width="100" height="100" fill={fill} stroke={colors.primary} data-secondary={colors.secondary} data-tertiary={colors.tertiary} />
  );
  return {
    ...actual,
    SHAPE_REGISTRY: {
      ...actual.SHAPE_REGISTRY,
      "Triangle": {
        Component: Stub,
        supports: { rotations: false, filters: false, patterns: false },
      },
      "Circle - Semi": {
        Component: Stub,
        supports: { rotations: [0, 180], colors: 2 },
      },
    },
  };
});

const CARD: CardData = {
  shapes: "Triangle",
  colors: "Red",
  numbers: 1,
  rotations: 90,
  filters: "shadow",
  patterns: "striped",
  yolks: 1,
  spires: 1,
};

const renderCard = (card: CardData) =>
  ReactDOMServer.renderToStaticMarkup(<CardSvg card={card} cardId="test-0" />);

test("unsupported features are downgraded instead of applied", () => {
  const markup = renderCard(CARD);
  expect(markup).not.toContain("rotate(");
  expect(markup).not.toContain("filter=");
  expect(markup).not.toContain("<defs>");
  // pattern falls back to solid: the primary color
  expect(markup).toContain('fill="#e6194B"');
});

test("rotation subsets keep supported angles and zero out the rest", () => {
  const supported = renderCard({ ...CARD, shapes: "Circle - Semi", rotations: 180 });
  expect(supported).toContain('transform="rotate(180, 60, 60)"');
  const unsupported = renderCard({ ...CARD, shapes: "Circle - Semi", rotations: 90 });
  expect(unsupported).not.toContain('transform="rotate(');
});

test("color support clamps the set and downgrades color-hungry patterns", () => {
  // striped uses 2 colors — allowed for a 2-color shape, tertiary mirrors secondary
  const striped = renderCard({ ...CARD, shapes: "Circle - Semi", patterns: "striped" });
  expect(striped).toContain('fill="url(#pat-test-0)"');
  const secondary = striped.match(/data-secondary="([^"]+)"/);
  const tertiary = striped.match(/data-tertiary="([^"]+)"/);
  expect(secondary && secondary[1]).toEqual(tertiary && tertiary[1]);
  // triangles uses 3 colors — falls back to solid primary
  const triangles = renderCard({ ...CARD, shapes: "Circle - Semi", patterns: "triangles" });
  expect(triangles).toContain('fill="#e6194B"');
});
