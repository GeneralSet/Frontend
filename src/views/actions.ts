import { Deck } from "deckBuilder/types";

interface Payload {
  deck: Deck,
}
type UpdateDeck = { type: 'UPDATE_DECK', payload: Payload };
function updateDeck(payload: Payload): UpdateDeck {
  return { type: 'UPDATE_DECK', payload };
}

export type Actions = (
  UpdateDeck
);

export const actions = {
  updateDeck,
};
