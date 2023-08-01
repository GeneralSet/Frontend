import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { ReduxState } from "reducers";
import { useSelector, useDispatch } from "react-redux";
import Card from "components/game/card";
import "./gameEditor.css";
import Form from "react-bootstrap/Form";
import GeometricDeckGenerator from "deckBuilder/GeometricDeckGenerator";
import { actions } from "views/actions";
import { SymbolSelect } from "./symbolSelect";
import { NumberSelect } from "./numberSelect";
import { ColorSelect } from "./colorSelect";

export const GameEditor = () => {
  const globalDeckData = useSelector(
    (state: ReduxState) => state.singlePlayer.deckData
  );
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const [card, setCard] = useState(0);
  const [deckData, setDeckData] = useState(globalDeckData);
  const deck = new GeometricDeckGenerator(deckData).arrayDeck();

  const onDeckDataChange = (
    cardNumber: number,
    feature: ValidFeatures,
    value: string
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
          <Form.Label>Select Card to Edit</Form.Label>
          <div className="cardSelector">
            <button className="btn btn-link m-1 p-0" onClick={() => setCard(0)}>
              <Card
                selected={card === 0}
                svg={deck["0_0_0"]}
              />
            </button>
            <button className="btn btn-link m-1 p-0" onClick={() => setCard(1)}>
              <Card
                selected={card === 1}
                svg={deck["1_1_1"]}
              />
            </button>
            <button className="btn btn-link m-1 p-0" onClick={() => setCard(2)}>
              <Card
                selected={card === 2}
                svg={deck["2_2_2"]}
              />
            </button>
          </div>
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
