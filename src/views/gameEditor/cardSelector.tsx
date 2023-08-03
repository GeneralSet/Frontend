import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Card from "components/game/card";
import Form from "react-bootstrap/Form";

interface Props {
  numberOfCards: number
  deckData: DeckData
  setDeckData: (value: DeckData) => void;
  deck: FeatureDeck
  card: number;
  setCard: (value: number) => void;

}

export const CardSelector = ({numberOfCards, setDeckData, deckData, deck, card, setCard}: Props) => {
  const removeCard = (index: number) => {
    const newDeckData: any = {...deckData};
    Object.keys(deckData).forEach(feature => {
      newDeckData[feature].splice(index, 1);
    })
    setDeckData(newDeckData);
  }

  const addCard = () => {
    const newDeckData: any = {...deckData};
    Object.keys(deckData).forEach(feature => {
       // fix me - this should be an available value. not the first one ;)
      newDeckData[feature].push(newDeckData[feature][0]);
    })
    setDeckData(newDeckData);
  }

  return (
    <>
      <Form.Label>Select Card to Edit</Form.Label>
      <div className="cardSelector">
      {[...Array(numberOfCards)].map((_, i) => (
        <div key={i}>
          <div className="cardSelector-container">
          {numberOfCards > 2 ? 
            <Button variant="link" className="cardSelector-remove" onClick={() => removeCard(i)}>
              x
            </Button>
          : null}
            <Button variant="link" className="cardSelector-button" onClick={() => setCard(i)}>
              <Card
                selected={card === i}
                svg={deck[`${i}_${i}_${i}`]}
              />
            </Button>
          </div>
        </div>

      ))}
      {numberOfCards < 4 ? 
      <Button variant="link" className="cardSelector-add" onClick={addCard}>
        <Card
          selected={false}
          svg={<div>✚</div>}
        />
      </Button>
      : null}
    </div>
    </>

  );
};
