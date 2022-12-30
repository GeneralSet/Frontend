type UpdateDeck = { type: 'UPDATE_DECK', payload: DeckData };
function updateDeck(payload: DeckData): UpdateDeck {
  return { type: 'UPDATE_DECK', payload };
}

export type Actions = (
  UpdateDeck 
);

export const actions = {
  updateDeck,
};
