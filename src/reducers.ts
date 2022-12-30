import { combineReducers } from 'redux';
import { reducer as multiPlayerReducer, initialState as multiPlayerState } from './views/multiPlayer/reducers';
import { reducer as singlePlayerReducer, initialState as singlePlayerState } from './views/reducers';

export interface ReduxState {
  multiPlayer: typeof multiPlayerState;
  singlePlayer: typeof singlePlayerState;
}

export const rootReducer = combineReducers({
  multiPlayer: multiPlayerReducer,
  singlePlayer: singlePlayerReducer
});
