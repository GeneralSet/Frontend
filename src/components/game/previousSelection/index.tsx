import * as React from "react";
import { useSelector } from "react-redux";
import { ReduxState } from "reducers";
import Card from "components/game/card";
import "./index.css";

interface Props {
  cards: string[];
  message: string;
  success: boolean;
}

export const PreviousSelection = ({cards, message, success}: Props) => {
  const customDeck = useSelector(
    (state: ReduxState) => state.singlePlayer.deck
  );
  if (cards.length <= 0) {
    return null;
  }
  return (
    <div
      className={`previous-selection ${
        success ? "success" : "error"
      }`}
    >
      <div style={{color: "white"}}>{message}</div>
      <div className="cards">
        {cards.map((card, index) => (
          <Card
            key={index}
            selected={false}
            svg={customDeck[card]}
          />
        ))}
      </div>
    </div>
  );
};
