import { Actions } from './actions';
import GeometricDeckGenerator from "deckBuilder/GeometricDeckGenerator";
import { GeneratedDeckMetaData } from 'deckBuilder/features';
import { Deck } from 'deckBuilder/types';

export const DECK_DATA: GeneratedDeckMetaData = {
  shapes: ["Circle - Three Quarter", "Circle - Quarter", "Circle - Semi"],
  colors: ["Red", "Yellow", "Blue"],
  numbers: [9, 3, 4],
};

export const initialState: { deck: Deck } = {
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
