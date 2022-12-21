import * as React from "react";
import autobind from "autobind-decorator";
import Card from "components/game/card";
import GeometricDeckGenerator from "deckBuilder/GeometricDeckGenerator";
import "./index.css";

interface Props {
  board: string[];
  selected: string[];
  hint?: string[];
  gameType: gameType;
  onSelect: (id: string, index: number) => void;
}

interface State {
  deck?: FeatureDeck;
}

@autobind
export default class Board extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    if (props.gameType === "custom") {
      const DECK_DATA: DeckData = {
        unicode: ["★", "5", "M"],
        colors: ["red", "green", "purple"],
        numbers: [3, 9, 2],
      };

      const generator = new GeometricDeckGenerator(DECK_DATA);
      this.state = {
        deck: generator.arrayDeck(),
      };
    }
  }

  public render() {
    return (
      <div className="board container">
        {this.props.board.map((id: string, index: number) => {
          return (
            <button
              className="btn btn-link m-1 p-0"
              onClick={() => this.props.onSelect(id, index)}
              key={index}
            >
              <Card
                features={id}
                selected={this.props.selected.includes(id)}
                hint={
                  this.props.hint ? this.props.hint.includes(id) : undefined
                }
                gameType={this.props.gameType}
                svg={
                  this.state && this.state.deck
                    ? this.state.deck[id]
                    : undefined
                }
              />
            </button>
          );
        })}
      </div>
    );
  }
}
