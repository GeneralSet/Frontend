import React from "react";
import Button from "react-bootstrap/Button";
import Card from "components/game/card";
import Form from "react-bootstrap/Form";
import { getASet } from "./utils";
import {
  GeneratedDeckMetaData,
  addCardOptions,
  removeCardOptions,
} from "deckBuilder/features";
import { FeatureDeck } from "deckBuilder/types";

interface Props {
  numberOfCards: number
  deckData: GeneratedDeckMetaData
  setDeckData: (value: GeneratedDeckMetaData) => void;
  deck: FeatureDeck
  card: number;
  setCard: (value: number) => void;
}


export const CardSelector = ({numberOfCards, setDeckData, deckData, deck, card, setCard}: Props) => {
  const removeCard = (index: number) => {
    const newDeckData = removeCardOptions(deckData, index);
    const lastCard = numberOfCards - 2;
    if (card >= lastCard) {
      setCard(Math.max(lastCard, 0));
    }
    setDeckData(newDeckData);
  }

  const addCard = () => {
    const newDeckData = addCardOptions(deckData);
    setCard(numberOfCards);
    setDeckData(newDeckData);
  }

  const numFeatures = Object.keys(deckData).length;

  return (
    <>
      <Form.Label>Select Card to Edit</Form.Label>
      <div className="cardSelector">
      {getASet(numberOfCards, numFeatures).map((id, index) => (
        <div key={index}>
        <div className="cardSelector-container">
        {numberOfCards > 2 ?
          <Button variant="link" className="cardSelector-remove" onClick={() => removeCard(index)}>
            x
          </Button>
        : null}
          <Button variant="link" className="cardSelector-button" onClick={() => setCard(index)}>
            <Card
              selected={card === index}
              image={deck[id]}
            />
          </Button>
        </div>
      </div>
      ))}
      {numberOfCards < 4 ?
      <Button variant="link" className="cardSelector-add" onClick={addCard}>
        <Card
          selected={false}
          image={<div>✚</div>}
        />
      </Button>
      : null}
    </div>
    </>

  );
};
