import { createDailyDeck } from "../deck";

test("the daily deck is a fixed 27-card, 3-feature deck", () => {
  const deck = createDailyDeck();
  expect(deck.features.length).toEqual(3);
  expect(deck.numOptions).toEqual(3);
  expect(Object.keys(deck.cards).length).toEqual(27);
  expect(deck.cards["0_0_0"]).toBeDefined();
  expect(deck.cards["2_2_2"]).toBeDefined();
});
