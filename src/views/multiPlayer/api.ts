import { Dispatch } from 'redux';
// import { actions } from './actions';

export function onUsers(socket: WebSocket) {
  return (dispatch: Dispatch<{}>) => {
    // socket.onmessage(
    //   'users',
    //   (users: User[]) => dispatch(actions.setUsers(users))
    // );
  };
}




// export function onUsers(socket: WebSocket) {
//   return (dispatch: Dispatch<{}>) => {
//     // socket.onmessage(
//     //   'users',
//     //   (users: User[]) => dispatch(actions.setUsers(users))
//     // );
//   };
// }

export function setGameType(socket: WebSocket) {
  return (dispatch: Dispatch<{}>) => {
    // socket.onmessage(
    //   'setGameType',
    //   (gameType: gameType) => dispatch(actions.setGameType(gameType))
    // );
  };
}

export function updateGame(socket: WebSocket) {
  return (dispatch: Dispatch<{}>) => {
    // socket.onmessage(
    //   'updateGame',
    //   (gameState: GameState) => dispatch(actions.setGameState(gameState))
    // );
  };
}
