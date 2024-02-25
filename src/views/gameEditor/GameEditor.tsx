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
import { DEFAULT_CARD, getAvailableValue } from "./utils";
import { EnableFeature } from "./enableFeature";
import { DECK_DATA } from "views/reducers";
import { RotationSelect } from "./rotationSelect";
import { FilterSelect } from "./filterSelect";

export const GameEditor = () => {
  const dispatch = useDispatch();
  const globalDeck = useSelector(
    (state: ReduxState) => state.singlePlayer.deck
  );
  const [deckDefaults, setDeckDefaults] = useState(DEFAULT_CARD);
  const [deckData, setDeckData] = useState(globalDeck.metaData || DECK_DATA);
  const localDeck = new GeometricDeckGenerator(deckData, deckDefaults);
  const deck = localDeck.cards
  const numberOfCards = localDeck.numOptions;

  const [show, setShow] = useState(false);
  const [card, setCard] = useState(0);

  const onDeckDataChange = (
    cardNumber: number,
    feature: string,
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
    feature: string,
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
          temp.push((deckDefaults as any)[feature ])
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
        Build Your Own
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
          <EnableFeature feature="shapes" features={localDeck.features.length} deckData={deckData} onFeatureSelect={onFeatureSelect}/>
          <SymbolSelect 
            value={(deckData.shapes? deckData.shapes[card] : deckDefaults.shapes) as string}
            selection={(deckData.shapes || [deckDefaults.shapes]) as string[]}
            onChange={(value) => onDeckDataChange(card, "shapes", value)}
          />
          <EnableFeature feature="colors" features={localDeck.features.length} deckData={deckData} onFeatureSelect={onFeatureSelect}/>
          <ColorSelect
            value={(deckData.colors? deckData.colors[card] : deckDefaults.colors) as string}
            selection={(deckData.colors || [deckDefaults.colors]) as string[]}
            onChange={(value) => onDeckDataChange(card, "colors", value)}
          />
          <EnableFeature feature="numbers" features={localDeck.features.length} deckData={deckData} onFeatureSelect={onFeatureSelect}/>
          <NumberSelect
            value={(deckData.numbers? deckData.numbers[card] : deckDefaults.numbers) as number}
            selection={(deckData.numbers || [deckDefaults.numbers]) as number[]}
            onChange={(value) => onDeckDataChange(card, "numbers", value)}
          />
          <EnableFeature feature="rotations" features={localDeck.features.length} deckData={deckData} onFeatureSelect={onFeatureSelect}/>
          <RotationSelect
            value={(deckData.rotations? deckData.rotations[card] : deckDefaults.rotations) as number}
            selection={(deckData.rotations || [deckDefaults.rotations]) as number[]}
            onChange={(value) => onDeckDataChange(card, "rotations", value)}
          />
          <EnableFeature feature="filters" features={localDeck.features.length} deckData={deckData} onFeatureSelect={onFeatureSelect}/>
          <FilterSelect
            value={(deckData.filters? deckData.filters[card] : deckDefaults.filters) as string}
            selection={(deckData.filters || [deckDefaults.filters]) as string[]}
            onChange={(value) => onDeckDataChange(card, "filters", value)}
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
