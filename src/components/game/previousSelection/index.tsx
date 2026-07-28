import * as React from "react";
import { useSelector } from "react-redux";
import { ReduxState } from "reducers";
import { Deck } from "deckBuilder/types";
import Card from "components/game/card";
import "./index.css";

interface Props {
  cards: string[];
  message: string;
  /** Overrides the redux-selected deck (used by modes with a fixed deck). */
  deck?: Deck;
}

export const PreviousSelection = ({cards, message, deck: deckOverride}: Props) => {
  const reduxDeck = useSelector(
    (state: ReduxState) => state.singlePlayer.deck
  );
  const deck = deckOverride ?? reduxDeck;
  if (cards.length <= 0) {
    return null;
  }
  return (
    <div className="previous-selection">
      <div style={{color: "white"}}>{message}</div>
      <div className="cards">
        {cards.map((card, index) => (
          <Card
            key={index}
            selected={false}
            image={deck.cards[card]}
          />
        ))}
      </div>
    </div>
  );
};
