import { Actions } from './actions';
import GeometricDeckGenerator from "deckBuilder/GeometricDeckGenerator";
import { DeckMetaData } from 'deckBuilder/PresetDeck';

export const DECK_DATA: DeckMetaData = {
  shapes: ["Circle - Three Quarter", "Circle - Quarter", "Circle - Semi"],
  colors: ["Red", "Yellow", "Blue"],
  numbers: [9, 3, 4],
};

export const initialState = {
  deck: new GeometricDeckGenerator(DECK_DATA)
};

export function reducer(state: typeof initialState = initialState, action: Actions) {
  switch (action.type) {
    case 'UPDATE_DECK':
      return {
        ...state,
        deck: action.payload.deck,
      };
    default:
      return state;
  }
}
