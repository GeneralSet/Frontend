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

  const removeCard = (index: number) => {
    // TODO: set a min number of options
    const newDeckData: any = {...deckData};
    Object.keys(deckData).forEach(feature => {
      newDeckData[feature].splice(index, 1);
    })
    setDeckData(newDeckData);
  }

  const addCard = () => {
    // TODO: set a max number of options
    const newDeckData: any = {...deckData};
    Object.keys(deckData).forEach(feature => {
       // fix me - this should be an available value. not the first one ;)
      newDeckData[feature].push(newDeckData[feature][0]);
    })
    setDeckData(newDeckData);
  }


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
          <Button variant="secondary" onClick={addCard}>Add Card</Button>
          <Form.Label>Select Card to Edit</Form.Label>
          <div className="cardSelector">
            {[...Array(numberOfCards)].map((_, i) => (
              <>
                <a onClick={() => removeCard(i)}>Remove Card</a>
                <button className="btn btn-link m-1 p-0" onClick={() => setCard(i)}>
                  <Card
                    selected={card === i}
                    svg={deck[`${i}_${i}_${i}`]}
                  />
                </button>
              </>
            ))}
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
