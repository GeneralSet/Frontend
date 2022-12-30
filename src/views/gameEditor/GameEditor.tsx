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
    event: any
  ) => {
    const newArray = [...deckData[feature]];
    newArray[cardNumber] = event.target.value;
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
        Custom
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
                features="0_0_0"
                selected={card === 0}
                svg={deck["0_0_0"]}
              />
            </button>
            <button className="btn btn-link m-1 p-0" onClick={() => setCard(1)}>
              <Card
                features="1_1_1"
                selected={card === 1}
                svg={deck["1_1_1"]}
              />
            </button>
            <button className="btn btn-link m-1 p-0" onClick={() => setCard(2)}>
              <Card
                features="2_2_2"
                selected={card === 2}
                svg={deck["2_2_2"]}
              />
            </button>
          </div>
          <Form.Label>Color</Form.Label>
          <Form.Control
            type="color"
            onChange={(value) => onDeckDataChange(card, "colors", value)}
            value={deckData.colors[card]}
          />
          <Form.Label>Number</Form.Label>
          <Form.Select
            onChange={(value) => onDeckDataChange(card, "numbers", value)}
            value={deckData.numbers[card]}
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
          </Form.Select>
          <Form.Label>Symbol</Form.Label>
          <Form.Control
            type="text"
            onChange={(value) => onDeckDataChange(card, "unicode", value)}
            value={deckData.unicode[card]}
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
