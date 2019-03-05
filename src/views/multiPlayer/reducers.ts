import { Actions } from './actions';
import { WEBSOCKET_MESSAGE } from '@giantmachines/redux-websocket'

export const initialState = {
  users: [] as User[],
  gameType: '',
  gameState: {},
};

export function reducer(state: typeof initialState = initialState, action: Actions) {
  switch (action.type) {
    case 'SET_USERS':
      return {...state, users: action.payload };
    case 'SET_GAME_TYPE':
      return {...state, gameType: action.payload };
    case 'SET_GAME_STATE':
      return {...state, gameState: action.payload };
    case WEBSOCKET_MESSAGE:
      if (!(action.payload as any).data) {
        return state;
      }
      const msg = JSON.parse((action.payload as any).data);
      switch(msg.eventType) {
        case "users":
          return {...state, users: msg.users };
        case "setGameType":
          return {...state, gameType: msg.gameType };
        case "updateGame":
          return {
            ...state,
            gameState: {
              ...msg.gameState,
              deck: msg.gameState.deck.split(","),
              board: msg.gameState.board.split(","),
            }
          };
      }
      return {...state};
    default:
      return state;
  }
}
