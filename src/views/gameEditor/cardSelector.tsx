import React from "react";
import Button from "react-bootstrap/Button";
import Card from "components/game/card";
import Form from "react-bootstrap/Form";
import { COLORS } from "./colorSelect";
import { NUMBERS } from "./numberSelect";
import { SYMBOLS } from "./symbolSelect";

interface Props {
  numberOfCards: number
  deckData: DeckData
  setDeckData: (value: DeckData) => void;
  deck: FeatureDeck
  card: number;
  setCard: (value: number) => void;
}

const featureOptions = {
  colors: Object.values(COLORS),
  unicode: SYMBOLS,
  numbers: NUMBERS
}

export const CardSelector = ({numberOfCards, setDeckData, deckData, deck, card, setCard}: Props) => {
  const removeCard = (index: number) => {
    const newDeckData: any = {...deckData};
    Object.keys(deckData).forEach(feature => {
      newDeckData[feature].splice(index, 1);
    })
    setDeckData(newDeckData);
  }

  const getAvailableValue = (feature: ValidFeatures, used: string[]) => {
    const options = featureOptions[feature];
    const difference = (options as string[]).filter(x => !used.includes(x));
    return difference[Math.floor(Math.random()*difference.length)];
  }

  const addCard = () => {
    const newDeckData: any = {...deckData};
    Object.keys(deckData).forEach(feature => {
      newDeckData[feature].push(getAvailableValue(feature as ValidFeatures, newDeckData[feature]));
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
