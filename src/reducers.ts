import { combineReducers } from 'redux';
import { reducer as singlePlayerReducer, initialState as singlePlayerState } from './views/reducers';

export interface ReduxState {
  singlePlayer: typeof singlePlayerState;
}

export const rootReducer = combineReducers({
  singlePlayer: singlePlayerReducer
});
