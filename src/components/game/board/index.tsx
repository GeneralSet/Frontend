import * as React from "react";
import autobind from "autobind-decorator";
import Card from "components/game/card";
import GeometricDeckGenerator from "deckBuilder/GeometricDeckGenerator";
import "./index.css";
import { useSelector } from "react-redux";
import { ReduxState } from "reducers";

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

export const Board = (props: Props) => {
  const customDeck = useSelector(
    (state: ReduxState) => state.singlePlayer.deck
  );

  return (
    <div className="board container">
      {props.board.map((id: string, index: number) => {
        return (
          <button
            className="btn btn-link m-1 p-0"
            onClick={() => props.onSelect(id, index)}
            key={index}
          >
            <Card
              features={id}
              selected={props.selected.includes(id)}
              hint={props.hint ? props.hint.includes(id) : undefined}
              gameType={props.gameType}
              svg={props.gameType === "custom" ? customDeck[id] : undefined}
            />
          </button>
        );
      })}
    </div>
  );
};
