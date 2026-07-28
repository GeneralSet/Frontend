import GeometricDeckGenerator from "deckBuilder/GeometricDeckGenerator";
import { GeneratedDeckMetaData } from "deckBuilder/features";
import { Deck } from "deckBuilder/types";

/**
 * The fixed deck every daily game uses (the menu's "Circles" symbol deck):
 * 3 features x 3 options = 27 cards with a 9-card board, a quick daily-sized
 * game. Fixed so completion times are comparable between players.
 */
export const DAILY_DECK_METADATA: GeneratedDeckMetaData = {
  shapes: ["Circle - Quarter", "Circle - Semi", "Circle - Three Quarter"],
  colors: ["Red", "Olive", "Blue"],
  numbers: [3, 6, 9],
};

export const createDailyDeck = (): Deck =>
  new GeometricDeckGenerator(DAILY_DECK_METADATA, undefined, {
    idPrefix: "daily",
  });
