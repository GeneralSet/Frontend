import * as React from "react";
import Card from "components/game/card";
import "./index.css";
import { useSelector } from "react-redux";
import { ReduxState } from "reducers";

interface Props {
  board: string[];
  selected: string[];
  hint?: string[];
  onSelect: (id: string) => void;
}

export const Board = (props: Props) => {
  const customDeck = useSelector(
    (state: ReduxState) => state.singlePlayer.deck
  );

  return (
    <div className="board container">
      {props.board.map((id: string) => {
        return (
          <button
            className="btn btn-link m-1 p-0"
            onClick={() => props.onSelect(id)}
            key={id}
          >
            <Card
              selected={props.selected.includes(id)}
              hint={props.hint ? props.hint.includes(id) : undefined}
              svg={customDeck.cards[id]}
            />
          </button>
        );
      })}
    </div>
  );
};
