import * as React from "react";
import autobind from "autobind-decorator";
import Board from "components/game/board";
import PreviousSelection from "components/game/previousSelection";
import { match } from "react-router-dom";
const GeneralSet = import("set/pkg/set");

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
    GeneralSet.then((s) => {
      this.set = s.Set.new(4, 3);
      this.setState({
        deck: this.set.get_deck().split(","),
        board: this.set.get_board().split(","),
        selected: [],
        hint: [],
        previousSelection: [],
        alert: {
          isError: false,
          message: "",
        },
        numberOfSets: this.set.sets,
        points: 0,
      });
    });
    this.state = {
      deck: [],
      board: [],
      selected: [],
      hint: [],
      previousSelection: [],
      alert: {
        isError: false,
        message: "",
      },
      numberOfSets: 0,
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
    this.set = this.set.update_board(selected.join(","));
    this.setState({
      alert: { isError: false, message: "+1 Set!" },
      points: this.state.points + 1,
      board: this.set.get_board().split(","),
      deck: this.set.get_deck().split(","),
      numberOfSets: this.set.sets,
      previousSelection: selected,
      hint: [],
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
        <p>is end? {this.set && this.set.is_end() ? "yes" : "no"}</p>
        <div className="container mb-2">
          <div className="row">
            <div className="col-sm">
              <table className="table table-borderless w-auto">
                <tbody>
                  <tr>
                    <td className="text-left">Points</td>
                    <td>{this.state.points}</td>
                  </tr>
                  <tr>
                    <td className="text-left">Cards Remaining</td>
                    <td>{this.state.deck.length}</td>
                  </tr>
                  <tr>
                    <td className="text-left">Sets on the Board</td>
                    <td>{this.state.numberOfSets}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="col-sm text-right">
              <button onClick={this.hint} className="btn btn-primary btn-sm">
                Hint
              </button>
              <PreviousSelection
                cards={this.state.previousSelection}
                gameType={this.props.match.params.gameType}
                message={this.state.alert.message}
                success={!this.state.alert.isError}
              />
            </div>
          </div>
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
