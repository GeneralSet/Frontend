import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { ReduxState } from "reducers";
import { useSelector } from "react-redux";

const arrayToString = (array: string[]) => {
  if (array.length < 2) {
    return array;
  }
  return [array.slice(0, -1).join(', '), array.slice(-1)[0]].join(array.length < 2 ? '' : ' and ')
} 

export const RulesModal = () => {
  const deck = useSelector(
    (state: ReduxState) => state.singlePlayer.deck
  );
  const [show, setShow] = useState(false);

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  return (
    <>
      <Button variant="secondary" onClick={handleShow}>
        How to play
      </Button>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>How to play</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>This deck contains {deck.features.length} features: {arrayToString(Object.entries(deck.metaData).map(([f]) => f))}</p>
          <p>For each feature here are their options</p>
          <ul>
          {Object.entries(deck.metaData).map(([feature, options]) => 
            <li>{feature}: {arrayToString(options)}</li>
          )}
          </ul>
          To make a valid set you must select {deck.numOptions} where for each feature the cars have all the same options or all different options.
          <h2>Examples</h2>
          {/* for each (feature * options) */}
            {/* for each option */}

          {/* {0_0_0}{0_0_1}{0_0_2}
          {0_0_0}{0_1_0}{0_2_0}
          {0_0_0}{1_0_0}{2_0_0}
          {0_0_0}{0_1_1}{0_2_2}
          {0_0_0}{1_0_1}{2_0_2}
          {0_0_0}{1_1_1}{2_2_2} */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
