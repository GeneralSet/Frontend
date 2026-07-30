import React, { useEffect, useMemo, useState } from "react";
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
  FEATURES,
  FeatureName,
  FeatureValue,
  GeneratedDeckMetaData,
  assignDistinctValues,
  getEnabledOptions,
  isGeneratedMetaData,
  setFeatureOptions,
} from "deckBuilder/features";
import {
  canShapeFillDeck,
  canShapesSupplyFeature,
  collapseToShape,
  getSupportedFeatureValues,
} from "deckBuilder/deckRules";
import { ShapeName } from "deckBuilder/shapes";
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

  const shapeValues = getEnabledOptions(deckData, "shapes");
  const shapesInPlay: ShapeName[] = shapeValues
    ? (shapeValues as ShapeName[]).slice(0, numberOfCards)
    : Array(numberOfCards).fill(deckDefaults.shapes as ShapeName);

  // A shape-only feature is offered when the shapes in play can give every
  // card its own value of it — a feature that runs out mid-deck could not tell
  // the cards apart.
  const isFeatureLocked = (feature: FeatureName): boolean =>
    !!FEATURES[feature].requiresShapeSupport &&
    !canShapesSupplyFeature(shapesInPlay, feature, numberOfCards);

  useEffect(() => {
    const toClear = FEATURE_NAMES.filter((feature) => isFeatureLocked(feature) && deckData[feature]);
    if (toClear.length === 0) {
      return;
    }
    const next = { ...deckData };
    toClear.forEach((feature) => delete next[feature]);
    setDeckData(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckData, shapesInPlay.join(",")]);

  const onDeckDataChange = <F extends FeatureName>(
    cardNumber: number,
    feature: F,
    value: FeatureValue<F>
  ) => {
    const values = getEnabledOptions(deckData, feature);
    if (values) {
      if (feature === "shapes" && values[cardNumber] !== value && values.includes(value)) {
        // Picking a symbol another card already wears only makes sense for a
        // shape carrying its own feature, and that feature then takes over the
        // symbol's job of telling the cards apart — for the whole deck.
        const collapsed = collapseToShape(
          { deckData, deckDefaults },
          (value as unknown) as ShapeName,
          numberOfCards
        );
        setDeckDefaults(collapsed.deckDefaults);
        setDeckData(collapsed.deckData);
        return;
      }
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
      // A shape-only feature can only hand out what its shape draws, so it
      // takes its values in order. Everywhere else the currently-selected card
      // keeps the shared default and every other card gets a still-unused option.
      const values = FEATURES[feature].requiresShapeSupport
        ? getSupportedFeatureValues(shapesInPlay, feature).slice(0, numberOfCards)
        : assignDistinctValues(feature, numberOfCards, deckDefaults[feature], card);
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
          {FEATURE_NAMES.filter((feature) => !isFeatureLocked(feature)).map((feature) => {
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
                  options={
                    FEATURES[feature].requiresShapeSupport
                      ? getSupportedFeatureValues(shapesInPlay, feature)
                      : undefined
                  }
                  canRepeat={
                    feature === "shapes"
                      ? (option) => canShapeFillDeck((option as unknown) as ShapeName, numberOfCards)
                      : undefined
                  }
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
