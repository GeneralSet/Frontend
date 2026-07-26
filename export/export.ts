import * as fs from "fs";
import * as ReactDOMServer from "react-dom/server";
import GeometricDeckGenerator from "../src/deckBuilder/GeometricDeckGenerator";
import { GeneratedDeckMetaData } from "../src/deckBuilder/features";
import { getPermutations, isSet } from "./utils";

const decks: { path: string; metaData: GeneratedDeckMetaData }[] = [
  {
    path: "./decks/1/",
    metaData: {
      shapes: ["Circle - Quarter", "Circle - Semi", "Circle - Three Quarter"],
      colors: ["Red", "Green", "Yellow"],
      numbers: [1, 2, 3],
    },
  },
  {
    path: "./decks/2/",
    metaData: {
      shapes: ["Tetris - L Block", "Tetris - S Block", "Tetris - T Block"],
      colors: ["Blue", "Orange", "Purple"],
      numbers: [4, 5, 6],
    },
  },
  {
    path: "./decks/3/",
    metaData: {
      shapes: ["Tracks - Deer", "Tracks - Wolf", "Tracks - Frog"],
      colors: ["Cyan", "Magenta", "Lime"],
      numbers: [7, 8, 9],
    },
  },
];

const exportDeck = ({ path, metaData }: typeof decks[number], index: number) => {
  const deck = new GeometricDeckGenerator(metaData, undefined, { idPrefix: `deck${index}` });
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
  Object.keys(deck.cards).forEach((id) => {
    fs.writeFileSync(`${path}${id}.svg`, ReactDOMServer.renderToStaticMarkup(deck.cards[id]));
  });
  return deck;
};

const [, , lastDeck] = decks.map(exportDeck);

const allSelections = getPermutations(Object.keys(lastDeck.cards), 3);
const isSetLookup: { [x: string]: boolean } = {};
allSelections.forEach((selection) => {
  isSetLookup[selection.join(",")] = isSet(selection);
});
fs.writeFile("./decks/isSetLookup.json", JSON.stringify(isSetLookup), () => null);
