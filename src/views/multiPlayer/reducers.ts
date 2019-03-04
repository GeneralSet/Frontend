import { Actions } from './actions';

const serverLocation = process.env.NODE_ENV === 'development' ? 'ws://localhost:3001' : 'ws://generalset.io';

export const initialState = {
  socket: new WebSocket(serverLocation),
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
    default:
      return state;
  }
}
