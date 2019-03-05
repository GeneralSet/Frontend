import * as React from 'react';
import autobind from 'autobind-decorator';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { actions } from 'views/multiPlayer/actions';
import { match, withRouter, RouteComponentProps } from 'react-router-dom';
import { ReduxState } from 'reducers';
import { WEBSOCKET_SEND } from '@giantmachines/redux-websocket'

import SelectVarient from 'components/game/selectVarient';
import FullscreenPage from 'components/layout/FullscreenPage';
import 'index.css';

interface Props extends RouteComponentProps<{}> {
  match: match<{roomName: string, gameType: gameType}>;
}

interface ReduxProps extends Props {
  dispatch: Dispatch<Props>;
  users: User[];
  gameType: gameType;
  gameState: GameState;
}

interface State {
}

@autobind
class Lobby extends React.Component<ReduxProps, State> {

  constructor(props: ReduxProps) {
    super(props);
  }

  public componentWillUpdate(nextProps: ReduxProps, _nextState: State) {
    if (nextProps.gameState.board && nextProps.gameState.board.length > 0) {
      this.props.history.push(
        `${this.props.match.url}/${this.props.gameType}`
      );
    }
  }

  private onSlecet(gameType: gameType): void {
    this.props.dispatch({
      type: WEBSOCKET_SEND,
      payload: {
        eventType: 'setGameType',
        roomName: this.props.match.params.roomName,
        gameType,
      },
    })
    this.props.dispatch(actions.setGameType(gameType));
  }

  private play(event: React.MouseEvent<HTMLInputElement>): void {
    event.preventDefault();
    this.props.dispatch({
      type: WEBSOCKET_SEND,
      payload: {
        eventType: 'startGame',
        roomName: this.props.match.params.roomName,
      },
    })
  }

  public render(): JSX.Element {
    return (
      <FullscreenPage>
        <div>Users:</div>
        <ul>
          {this.props.users.map((user, index) => <li key={index}>{user.name}</li>)}
        </ul>
        <SelectVarient
          onSlecet={this.onSlecet}
          selected={this.props.gameType}
        />
        <input type="button" value="Play" onClick={this.play}/>
      </FullscreenPage>
    );
  }
}

function mapStateToProps(state: ReduxState, _ownProps: Props) {
  return state.multiPlayer;
}

function mapDispatchToProps(dispatch: Dispatch<Props>) {
  return { dispatch };
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Lobby) as any);
