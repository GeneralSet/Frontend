import React, { useMemo, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { ReduxState } from "reducers";
import { useSelector, useDispatch } from "react-redux";
import "./gameEditor.css";
import GeometricDeckGenerator from "deckBuilder/GeometricDeckGenerator";
import {
  CardData,
  DEFAULT_CARD,
  FEATURE_NAMES,
  FeatureName,
  FeatureValue,
  GeneratedDeckMetaData,
  getAvailableValue,
  getEnabledOptions,
  isGeneratedMetaData,
  setFeatureOptions,
} from "deckBuilder/features";
import { actions } from "views/actions";
import { FeatureSelect } from "./featureSelect";
import { CardSelector } from "./cardSelector";
import { EnableFeature } from "./enableFeature";
import { DECK_DATA } from "views/reducers";

export const GameEditor = () => {
  const dispatch = useDispatch();
  const globalDeck = useSelector(
    (state: ReduxState) => state.singlePlayer.deck
  );
  const [deckDefaults, setDeckDefaults] = useState<CardData>(DEFAULT_CARD);
  const [deckData, setDeckData] = useState<GeneratedDeckMetaData>(() =>
    isGeneratedMetaData(globalDeck.metaData) ? globalDeck.metaData : DECK_DATA
  );
  const localDeck = useMemo(
    () => new GeometricDeckGenerator(deckData, deckDefaults),
    [deckData, deckDefaults]
  );
  const deck = localDeck.cards;
  const numberOfCards = localDeck.numOptions;

  const [show, setShow] = useState(false);
  const [card, setCard] = useState(0);

  const onDeckDataChange = <F extends FeatureName>(
    cardNumber: number,
    feature: F,
    value: FeatureValue<F>
  ) => {
    const values = getEnabledOptions(deckData, feature);
    if (values) {
      const newValues = [...values];
      newValues[cardNumber] = value;
      const newDeckData: GeneratedDeckMetaData = { ...deckData };
      setFeatureOptions(newDeckData, feature, newValues);
      setDeckData(newDeckData);
    } else {
      const newDefaults = { ...deckDefaults };
      newDefaults[feature] = value;
      setDeckDefaults(newDefaults);
    }
  };

  const onFeatureSelect = <F extends FeatureName>(feature: F, selected: boolean) => {
    if (!selected) {
      const values = deckData[feature];
      if (!values) {
        return;
      }
      const newDefaults: CardData = { ...deckDefaults };
      newDefaults[feature] = values[card];
      setDeckDefaults(newDefaults);
      const newDeckData: GeneratedDeckMetaData = { ...deckData };
      delete newDeckData[feature];
      setDeckData(newDeckData);
    } else {
      const values: FeatureValue<F>[] = [];
      for (let i = 0; i < numberOfCards; i++) {
        values.push(i === card ? deckDefaults[feature] : getAvailableValue(feature, values));
      }
      const newDeckData: GeneratedDeckMetaData = { ...deckData };
      setFeatureOptions(newDeckData, feature, values);
      setDeckData(newDeckData);
    }
  };

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);
  const handleSave = () => {
    dispatch(actions.updateDeck({ deck: new GeometricDeckGenerator(deckData, deckDefaults) }));
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
          {FEATURE_NAMES.map((feature) => {
            const values = deckData[feature];
            return (
              <React.Fragment key={feature}>
                <EnableFeature
                  feature={feature}
                  features={localDeck.features.length}
                  deckData={deckData}
                  onFeatureSelect={onFeatureSelect}
                />
                <FeatureSelect
                  feature={feature}
                  value={values ? values[card] : deckDefaults[feature]}
                  selection={values || [deckDefaults[feature]]}
                  onChange={(value) => onDeckDataChange(card, feature, value)}
                />
              </React.Fragment>
            );
          })}
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
