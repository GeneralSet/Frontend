import * as React from "react";
import autobind from "autobind-decorator";
import Board from "components/game/board";
import PreviousSelection from "components/game/previousSelection";
import { match } from "react-router-dom";
let GeneralSet = {};
import("set/pkg/set").then((s) => (GeneralSet = s.Set));

interface Props {
  match: match<{ gameType: gameType }>;
}

interface State {
  board: string[];
  selected: string[];
  hint: string[];
  previousSelection: string[];
  deck: string[];
  alert: {
    isError: boolean;
    message: string;
  };
  points: number;
  numberOfSets: number;
}

@autobind
export default class Game extends React.Component<Props, State> {
  private set: any;
  private readonly cardsForSet = 3;

  constructor(props: Props) {
    super(props);
    // new (GeneralSet as any)();
    this.set = (GeneralSet as any).new(4, 3);
    const deck = this.set.init_deck();
    const updatedBoard = this.set.update_board(deck, "");
    this.state = {
      deck: updatedBoard.get_deck().split(","),
      board: updatedBoard.get_board().split(","),
      selected: [],
      hint: [],
      previousSelection: [],
      alert: {
        isError: false,
        message: "",
      },
      numberOfSets: updatedBoard.sets,
      points: 0,
    };
  }

  selectCard(id: string, selectedIndex: number) {
    const board = this.state.board;
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
      this.verifySet();
    } else {
      this.setState({ board, selected });
    }
  }

  clearSelection() {
    this.setState({ selected: [] });
  }

  verifySet(): boolean {
    const selected = this.state.selected;
    this.clearSelection();
    // ensure right num cards selected
    if (selected.length < this.cardsForSet) {
      this.setState({
        alert: { isError: true, message: "Error: not enough cards selected" },
        previousSelection: selected,
      });
      return false;
    }

    // check for set
    const isValidSet = this.set.is_set(selected.join(","));
    if (!isValidSet) {
      this.setState({
        alert: { isError: true, message: `-1 Not a set.` },
        points: this.state.points - 1,
        previousSelection: selected,
      });
      return false;
    }

    // Set found
    const board = this.state.board;
    const deck = this.state.deck;
    selected.forEach((id) => {
      board.splice(board.indexOf(id), 1);
    });

    const updatedBoard = this.set.update_board(
      deck.join(","),
      this.state.board.join(",")
    );
    this.setState({
      alert: { isError: false, message: "+1 Set!" },
      points: this.state.points + 1,
      board: updatedBoard.get_board().split(","),
      deck: updatedBoard.get_deck().split(","),
      numberOfSets: updatedBoard.sets,
      previousSelection: selected,
    });
    return true;
  }

  private hint(_event: React.MouseEvent<HTMLButtonElement>): void {
    this.setState({
      hint: this.set.hint(this.state.board.join(",")).split(","),
    });
  }

  render() {
    return (
      <div>
        <div>
          <table className="table table-borderless">
            <tbody>
              <tr>
                <td>Points</td>
                <td>{this.state.points}</td>
              </tr>
              <tr>
                <td>Cards Remaining</td>
                <td>{this.state.deck.length}</td>
              </tr>
              <tr>
                <td>Sets on the Board</td>
                <td>{this.state.numberOfSets}</td>
              </tr>
              <tr>
                <td>
                  <button onClick={this.hint}>Hint</button>
                </td>
              </tr>
            </tbody>
          </table>
          <PreviousSelection
            cards={this.state.previousSelection}
            gameType={this.props.match.params.gameType}
            message={this.state.alert.message}
            success={!this.state.alert.isError}
          />
        </div>
        <Board
          board={this.state.board}
          selected={this.state.selected}
          hint={this.state.hint}
          gameType={this.props.match.params.gameType}
          onSelect={this.selectCard}
        />
      </div>
    );
  }
}