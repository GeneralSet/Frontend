import * as React from "react";
import autobind from "autobind-decorator";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { style } from "typestyle";
import Board from "components/game/board";
import { match, withRouter, RouteComponentProps } from "react-router-dom";
import { ReduxState } from "reducers";
import PreviousSelection from "components/game/previousSelection";
import { WEBSOCKET_SEND } from "@giantmachines/redux-websocket";

interface Props extends RouteComponentProps<{}> {
  match: match<{ roomName: string; gameType: gameType }>;
}

interface ReduxProps extends Props {
  dispatch: Dispatch<any>;
  users: User[];
  gameType: gameType;
  gameState: GameState;
}

interface State {
  selected: string[];
  alert: {
    isError: boolean;
    message: string;
  };
}

@autobind
class Game extends React.Component<ReduxProps, State> {
  private readonly cardsForSet = 3;
  private readonly classStyles = {
    flexCenter: style({
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "center",
      alignContent: "center",
    }),
  };

  constructor(props: ReduxProps) {
    super(props);
    this.state = {
      selected: [],
      alert: {
        isError: false,
        message: "",
      },
    };
  }

  public clearSelection(): void {
    this.setState({ selected: [] });
  }

  public selectCard(id: string, selectedIndex: number): void {
    const selected = this.state.selected;

    // update selected cards
    if (selected.includes(id)) {
      selected.forEach((cardId: string, index: number) => {
        if (cardId === id) {
          selected.splice(index, 1);
        }
      });
    } else {
      selected.push(id);
    }

    // update board
    if (selected.length >= this.cardsForSet) {
      // TODO verify set on server and update game state
      this.clearSelection();
      this.props.dispatch({
        type: WEBSOCKET_SEND,
        payload: {
          eventType: "verifySet",
          roomName: this.props.match.params.roomName,
          selected: selected.join(","),
        },
      });
    } else {
      this.setState({ selected });
    }
  }

  private previousSelection(): JSX.Element | void {
    const selection = this.props.gameState.previousSelection;
    if (!selection) {
      return;
    }
    let message = "";
    if (selection.valid) {
      message = `Set found by ${selection.user} (+1)`;
    } else {
      message = `Bad guess by ${selection.user} (-1)`;
    }
    return (
      <PreviousSelection
        cards={selection.selection.split(",")}
        gameType={this.props.match.params.gameType}
        message={message}
        success={selection.valid}
      />
    );
  }

  public render(): JSX.Element {
    if (!this.props.gameState.board || this.props.gameState.board.length < 1) {
      return <div>loading...</div>;
    }
    return (
      <div className="App">
        <div className={this.classStyles.flexCenter}>
          <div>Users:</div>
          <ul>
            {this.props.users.map((user, index) => (
              <li key={index}>
                {user.name}: {user.points}
              </li>
            ))}
          </ul>
          <table className="table table-borderless">
            <tbody>
              <tr>
                <td>Remaining Cards</td>
                <td>{this.props.gameState.deck.length}</td>
              </tr>
              <tr>
                <td>Number of sets</td>
                <td>{this.props.gameState.numberOfSets}</td>
              </tr>
            </tbody>
          </table>
          {this.previousSelection()}
        </div>
        <Board
          board={this.props.gameState.board}
          selected={this.state.selected}
          gameType={this.props.match.params.gameType}
          onSelect={this.selectCard}
        />
      </div>
    );
  }
}

function mapStateToProps(state: ReduxState, _ownProps: Props) {
  return state.multiPlayer;
}

function mapDispatchToProps(dispatch: Dispatch<any>) {
  return { dispatch };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps as any
)(withRouter(Game) as any);
