import * as React from 'react';
import autobind from 'autobind-decorator';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { WEBSOCKET_CONNECT, WEBSOCKET_SEND } from '@giantmachines/redux-websocket'
import { match, withRouter, RouteComponentProps } from 'react-router-dom';
import { ReduxState } from 'reducers';
import SetBox from 'components/layout/SetBox';
import './index.css';

interface Props extends RouteComponentProps<{}> {
  match: match<{}>;
}

interface ReduxProps extends Props {
  dispatch: Dispatch<Props>;
  users: User[];
  gameType: string;
  gameState: GameState;
}

interface State {
  roomName: string;
  username: string;
}

const serverLocation = process.env.NODE_ENV === 'production' ? 'ws://multiplayer.generalset.io' : 'ws://localhost:3001';

@autobind
class MultiPlayer extends React.Component<ReduxProps, State> {

  constructor(props: ReduxProps) {
    super(props);

    this.state = {
      roomName: '',
      username: '',
    };
    this.props.dispatch({
      type: WEBSOCKET_CONNECT,
      payload: {
        url: serverLocation
      }
    })
  }

  setRoomName(event: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({roomName: event.target.value});
  }

  setUsername(event: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({username: event.target.value});
  }

  host(event: React.MouseEvent<HTMLInputElement>): void {
    event.preventDefault();
    this.props.dispatch({
      type: WEBSOCKET_SEND,
      payload: {eventType: 'joinRoom', username: this.state.username, roomName: this.state.roomName},
    })
    this.props.history.push(`${this.props.match.url}/${this.state.roomName}`);
  }

  render() {
    return (
      <SetBox>
        <div className="join-room-form">
          <form>
            <label htmlFor="RoomName">Room name</label>
            <input
              className="form-input"
              id="RoomName"
              value={this.state.roomName}
              onChange={this.setRoomName}
            />
            <label htmlFor="Username">Username</label>
            <input
              className="form-input"
              id="Username"
              value={this.state.username}
              onChange={this.setUsername}
            />
            <input className="submit" type="submit" value="Enter" onClick={this.host}/>
          </form>
        </div>
      </SetBox>
    );
  }
}

function mapStateToProps(state: ReduxState, _ownProps: Props) {
  return state.multiPlayer;
}

function mapDispatchToProps(dispatch: Dispatch<Props>) {
  return { dispatch };
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(MultiPlayer) as any);
