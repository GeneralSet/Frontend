import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import websocket from '@giantmachines/redux-websocket';
import { rootReducer } from './reducers';

export const store = applyMiddleware(websocket, thunk)(createStore)(rootReducer);
