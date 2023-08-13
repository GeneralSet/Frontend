import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { ReduxState } from "reducers";
import { useSelector, useDispatch } from "react-redux";
import "./gameEditor.css";
import GeometricDeckGenerator from "deckBuilder/GeometricDeckGenerator";
import { actions } from "views/actions";
import { SymbolSelect } from "./symbolSelect";
import { NumberSelect } from "./numberSelect";
import { ColorSelect } from "./colorSelect";
import { CardSelector } from "./cardSelector";
import { getAvailableValue } from "./utils";
import { EnableFeature } from "./enableFeature";

export const DECK_DEFAULTS: CardData = {
  colors: "#000",
  unicode: "✖",
  numbers: 1
};

export const GameEditor = () => {
  const dispatch = useDispatch();
  const globalDeck = useSelector(
    (state: ReduxState) => state.singlePlayer.deck
  );
  const [deckDefaults, setDeckDefaults] = useState(DECK_DEFAULTS);
  const [deckData, setDeckData] = useState(globalDeck.deckData);
  const localDeck = new GeometricDeckGenerator(deckData, deckDefaults);
  const deck = localDeck.cards
  const numberOfCards = localDeck.numOptions;

  const [show, setShow] = useState(false);
  const [card, setCard] = useState(0);

  const onDeckDataChange = (
    cardNumber: number,
    feature: ValidFeatures,
    value: string | number
  ) => {
    const values = deckData[feature];
    if (Array.isArray(values)) {
      const newArray = [...values];
      newArray[cardNumber] = value;
      setDeckData({ ...deckData, [feature]: newArray });
    } else {
      setDeckDefaults({ ...deckDefaults, [feature]: value });
    }
  };

  const onFeatureSelect = (
    feature: ValidFeatures,
    selected: boolean
  ) => {
    if (!selected) {
      setDeckDefaults({ ...deckDefaults, [feature]: (deckData as any)[feature][card] });
      const temp = { ...deckData };
      delete temp[feature];
      setDeckData(temp);
    } else {
      const temp: (string | number)[] = [];
      for (let i = 0; i < numberOfCards; i++) {
        if (i === card) {
          temp.push(deckDefaults[feature])
        } else {
          temp.push(getAvailableValue(feature, temp))

        }
      }
      setDeckData({ ...deckData, [feature]: temp});
    }
  };

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);
  const handleSave = () => {
    dispatch(actions.updateDeck({ deck: new GeometricDeckGenerator(deckData, deckDefaults)}));
    setShow(false);
  };

  return (
    <>
      {show}
      <Button variant="light" onClick={handleShow}>
        Edit
      </Button>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CardSelector
            numberOfCards={numberOfCards}
            deckData={deckData}
            setDeckData={setDeckData}
            deck={deck}
            card={card}
            setCard={setCard}
          />
          <EnableFeature feature="unicode" features={localDeck.features.length} deckData={deckData} onFeatureSelect={onFeatureSelect}/>
          <SymbolSelect 
            value={deckData.unicode? deckData.unicode[card] : deckDefaults.unicode}
            selection={deckData.unicode || [deckDefaults.unicode]}
            onChange={(value) => onDeckDataChange(card, "unicode", value)}
          />
          <EnableFeature feature="colors" features={localDeck.features.length} deckData={deckData} onFeatureSelect={onFeatureSelect}/>
          <ColorSelect
            value={deckData.colors? deckData.colors[card] : deckDefaults.colors}
            selection={deckData.colors || [deckDefaults.colors]}
            onChange={(value) => onDeckDataChange(card, "colors", value)}
          />
          <EnableFeature feature="numbers" features={localDeck.features.length} deckData={deckData} onFeatureSelect={onFeatureSelect}/>
          <NumberSelect
            value={deckData.numbers? deckData.numbers[card] : deckDefaults.numbers}
            selection={deckData.numbers || [deckDefaults.numbers]}
            onChange={(value) => onDeckDataChange(card, "numbers", value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
