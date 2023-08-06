interface Payload {
  deckData: DeckData,
  deckDefaults?: CardData
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
