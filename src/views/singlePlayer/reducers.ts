import { Actions } from './actions';
import { WEBSOCKET_MESSAGE } from '@giantmachines/redux-websocket'

export const initialState = {
  users: [] as User[],

};

export function reducer(state: typeof initialState = initialState, action: Actions) {
  switch (action.type) {
    case 'SET_USERS':
      return {...state, users: action.payload };
    default:
      return state;
  }
}
