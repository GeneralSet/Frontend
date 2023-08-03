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

export const GameEditor = () => {
  const globalDeckData = useSelector(
    (state: ReduxState) => state.singlePlayer.deckData
  );
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const [card, setCard] = useState(0);
  const [deckData, setDeckData] = useState(globalDeckData);
  const deck = new GeometricDeckGenerator(deckData).createDeck();
  const numberOfCards = Object.values(deckData)[0].length;
  const onDeckDataChange = (
    cardNumber: number,
    feature: ValidFeatures,
    value: string | number
  ) => {
    const newArray = [...deckData[feature]];
    newArray[cardNumber] = value;
    setDeckData({ ...deckData, [feature]: newArray });
  };

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);
  const handleSave = () => {
    dispatch(actions.updateDeck(deckData));
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
          <ColorSelect
            value={deckData.colors[card]}
            selection={deckData.colors}
            onChange={(value) => onDeckDataChange(card, "colors", value)}
          />
          <NumberSelect
            value={deckData.numbers[card]}
            selection={deckData.numbers}
            onChange={(value) => onDeckDataChange(card, "numbers", value)}
          />
          <SymbolSelect 
            value={deckData.unicode[card]}
            selection={deckData.unicode}
            onChange={(value) => onDeckDataChange(card, "unicode", value)}
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
