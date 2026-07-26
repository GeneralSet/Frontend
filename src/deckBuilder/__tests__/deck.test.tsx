import * as ReactDOMServer from "react-dom/server";
import GeometricDeckGenerator from "../GeometricDeckGenerator";
import { GeneratedDeckMetaData } from "../features";

const DECK_DATA: GeneratedDeckMetaData = {
  shapes: ["Circle - Three Quarter", "Circle - Quarter", "Circle - Semi"],
  colors: ["Red", "Yellow", "Blue"],
  numbers: [9, 3, 4],
};

test("generates the full cartesian product with stable ids", () => {
  const deck = new GeometricDeckGenerator(DECK_DATA);
  const ids = Object.keys(deck.cards);
  expect(ids).toHaveLength(27);
  expect(ids[0]).toBe("0_0_0");
  expect(ids[26]).toBe("2_2_2");
  expect(ids).toContain("1_2_0");
  expect(deck.features).toEqual(["shapes", "colors", "numbers"]);
  expect(deck.numOptions).toBe(3);
});

test("card markup applies rotation, filter, and pattern", () => {
  const deck = new GeometricDeckGenerator(
    {
      shapes: ["Tetris - L Block"],
      colors: ["Blue"],
      rotations: [90],
      filters: ["shadow"],
      patterns: ["striped"],
    },
    undefined,
    { idPrefix: "test" }
  );
  const markup = ReactDOMServer.renderToStaticMarkup(deck.cards["0_0_0_0_0"]);
  expect(markup).toContain("rotate(90, 60, 60)");
  expect(markup).toContain('filter="url(#flt-test-0_0_0_0_0)"');
  expect(markup).toContain('fill="url(#pat-test-0_0_0_0_0)"');
  expect(markup).toMatchSnapshot();
});

test("solid primary fill matches the legacy single color rendering", () => {
  const deck = new GeometricDeckGenerator(DECK_DATA, undefined, { idPrefix: "test" });
  const markup = ReactDOMServer.renderToStaticMarkup(deck.cards["1_0_0"]);
  expect(markup).toContain('fill="#e6194B"');
  expect(markup).toContain('stroke="#e6194B"');
  expect(markup).not.toContain("<defs>");
});

test("svg def ids never collide across cards of one deck", () => {
  const deck = new GeometricDeckGenerator(
    {
      colors: ["Blue", "Green", "Purple"],
      filters: ["crinkle", "ink", "blur"],
      patterns: ["striped", "gradient", "triangles"],
    },
    undefined,
    { idPrefix: "test" }
  );
  const seen = new Set<string>();
  Object.keys(deck.cards).forEach((id) => {
    const markup = ReactDOMServer.renderToStaticMarkup(deck.cards[id]);
    const defIds = markup.match(/id="[^"]+"/g) || [];
    expect(defIds.length).toBeGreaterThan(0);
    defIds.forEach((defId) => {
      expect(seen.has(defId)).toBe(false);
      seen.add(defId);
    });
  });
});

test("decks get distinct def id prefixes by default", () => {
  const metaData: GeneratedDeckMetaData = { colors: ["Red"], filters: ["blur"] };
  const first = new GeometricDeckGenerator(metaData);
  const second = new GeometricDeckGenerator(metaData);
  const firstMarkup = ReactDOMServer.renderToStaticMarkup(first.cards["0_0"]);
  const secondMarkup = ReactDOMServer.renderToStaticMarkup(second.cards["0_0"]);
  const firstId = firstMarkup.match(/id="([^"]+)"/);
  const secondId = secondMarkup.match(/id="([^"]+)"/);
  expect(firstId && firstId[1]).toBeTruthy();
  expect(firstId && firstId[1]).not.toEqual(secondId && secondId[1]);
});
