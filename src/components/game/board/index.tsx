import * as React from "react";
import Card from "components/game/card";
import "./index.css";
import { useSelector } from "react-redux";
import { ReduxState } from "reducers";
import { Deck } from "deckBuilder/types";

interface Props {
  board: string[];
  selected: string[];
  hint?: string[];
  onSelect: (id: string) => void;
  /** Overrides the redux-selected deck (used by modes with a fixed deck). */
  deck?: Deck;
}

export const Board = (props: Props) => {
  const reduxDeck = useSelector(
    (state: ReduxState) => state.singlePlayer.deck
  );
  const customDeck = props.deck ?? reduxDeck;

  return (
    <div className="board container">
      {props.board.map((id: string) => {
        return (
          <button
            className="btn btn-link m-0 p-0"
            onClick={() => props.onSelect(id)}
            key={id}
          >
            <Card
              selected={props.selected.includes(id)}
              hint={props.hint ? props.hint.includes(id) : undefined}
              image={customDeck.cards[id]}
            />
          </button>
        );
      })}
    </div>
  );
};
