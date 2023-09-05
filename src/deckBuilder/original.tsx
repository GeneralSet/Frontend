import GeometricDeckGenerator from "./GeometricDeckGenerator";
// import { shapes } from "./features/shapes";
import { patterns } from "./features/patterns";

const DECK_DATA: DeckData = {
  // shapes: [shapes.oval, shapes.diamond, shapes.squiggle],
  colors: ["red", "green", "purple"],
  // shadings: [patterns.open, patterns.striped, patterns.solid],
  numbers: [1, 2, 3],
  // unicode: ["a", "b", "c"],
};

new GeometricDeckGenerator(DECK_DATA, undefined, "../../dist/decks/original/");
