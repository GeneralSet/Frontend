import GeometricDeckGenerator from "deckBuilder/GeometricDeckGenerator";
import PresetDeck from "deckBuilder/PresetDeck";

interface Payload {
  deck: GeometricDeckGenerator | PresetDeck,
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
