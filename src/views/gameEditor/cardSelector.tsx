import React from "react";
import Button from "react-bootstrap/Button";
import Card from "components/game/card";
import Form from "react-bootstrap/Form";
import { getAvailableValue } from "./utils";

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
    Object.keys(deckData).forEach((feature) => {
      newDeckData[feature].splice(index, 1);
    });
    const lastCard = Object.values(newDeckData as DeckData)[0].length -1;
    if (card >= lastCard) {
      setCard(lastCard);
    }
    setDeckData(newDeckData);
  }

  const addCard = () => {
    const newDeckData: any = {...deckData};
    Object.keys(deckData).forEach(feature => {
      newDeckData[feature].push(getAvailableValue(feature as ValidFeatures, newDeckData[feature]));
    });
    const newCard = Object.values(newDeckData as DeckData)[0].length -1;
    setCard(newCard);
    setDeckData(newDeckData);
  }

  const numFeatures = Object.keys(deckData).length;
  const getId = (i: number): string => {
    const temp = [];
    for (let j = 0; j < numFeatures; j++) temp.push(i);
    return temp.join('_')
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
                svg={deck[getId(i)]}
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
