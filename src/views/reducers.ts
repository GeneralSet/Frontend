import { Actions } from './actions';
import GeometricDeckGenerator from "deckBuilder/GeometricDeckGenerator";
import { COLORS } from './gameEditor/utils';

export const DECK_DATA: DeckData = {
  unicode: ["★", "✚", "⎈"],
  colors: [COLORS.Red, COLORS.Yellow, COLORS.Blue],
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
