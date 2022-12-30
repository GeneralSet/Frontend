import { createStore, applyMiddleware } from 'redux';
// import websocket from '@giantmachines/redux-websocket';
import { rootReducer } from './reducers';

export const store = applyMiddleware()(createStore)(rootReducer);
