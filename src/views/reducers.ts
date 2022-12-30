import { Actions } from './actions';
import GeometricDeckGenerator from "deckBuilder/GeometricDeckGenerator";

const DECK_DATA: DeckData = {
  unicode: ["★", "✚", "⎈"],
  colors: ["#d00000", "#ffba08", "#3f88c5"],
  numbers: [9, 3, 4],
};


export const initialState = {
  deckData: DECK_DATA,
  deck: new GeometricDeckGenerator(DECK_DATA).arrayDeck()
};


export function reducer(state: typeof initialState = initialState, action: Actions) {
  switch (action.type) {
    case 'UPDATE_DECK':
      return {...state, deck: new GeometricDeckGenerator(action.payload).arrayDeck(), deckData: action.payload };
    default:
      return state;
  }
}
