
import GeometricDeckGenerator from "../src/deckBuilder/GeometricDeckGenerator";
import { getPermutations, isSet } from "./utils";
const fs = require('fs')
// const GeneralSet =
//   process.env.NODE_ENV !== "test" ? import("set/pkg/set") : ({} as any);

const deck1 = {
  unicode: ["★", "✚", "⎈"],
  colors: ["#e6194B", "#3cb44b", "#ffe119"],
  numbers: [1, 2, 3],
};
const deck2 = {
  unicode: ["▲", "■", "⬥"],
  colors: ["#4363d8", "#f58231", "#911eb4"],
  numbers: [4, 5, 6],
};
const deck3 = {
  unicode: ["●", "⬟", "⬢"],
  colors: ["#42d4f4", "#f032e6", "#bfef45"],
  numbers: [7, 8, 9],
};

new GeometricDeckGenerator(deck1, undefined, "./decks/1/")
new GeometricDeckGenerator(deck2, undefined, "./decks/2/")
const deck = new GeometricDeckGenerator(deck3, undefined, "./decks/3/")


// GeneralSet.then(({Set}: any) => {
//   const set = Set.new(
//     3,
//     3,
//     9
//   )
  const allSelections = getPermutations(Object.keys(deck.cards), 3);
  const isSetLookup: {[x:string]: boolean} = {}
  allSelections.forEach((selection) => {
    isSetLookup[selection.join(',')] = isSet(selection)
    // console.log(set.is_set(selection.join(',')));
  });
  fs.writeFile('./decks/isSetLookup.json', JSON.stringify(isSetLookup), ()=> null);
// });

