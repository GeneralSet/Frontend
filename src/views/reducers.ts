import { Actions } from './actions';
import GeometricDeckGenerator from "deckBuilder/GeometricDeckGenerator";
import { COLORS } from './gameEditor/colorSelect';

const DECK_DATA: DeckData = {
  unicode: ["★", "✚", "⎈"],
  colors: [COLORS.Red, COLORS.Yellow, COLORS.Blue],
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
