import React from "react";
import Form from "react-bootstrap/Form";
import { CardSizeMode } from "deckBuilder/types";

interface Props {
  value: CardSizeMode;
  onChange: (value: CardSizeMode) => void;
}

/**
 * "Full Size" keeps every card's shapes one uniform size across the deck,
 * sized off the card with the most shapes. "Max Size" sizes each card's
 * shapes as large as that card alone allows, independent of its siblings.
 */
export const CardSizeSelect = ({ value, onChange }: Props) => (
  <Form.Group>
    <Form.Label>Card Size</Form.Label>
    <div>
      <Form.Check
        inline
        type="radio"
        name="cardSizeMode"
        id="cardSizeMode-full"
        label="Full Size"
        checked={value === "full"}
        onChange={() => onChange("full")}
      />
      <Form.Check
        inline
        type="radio"
        name="cardSizeMode"
        id="cardSizeMode-max"
        label="Max Size"
        checked={value === "max"}
        onChange={() => onChange("max")}
      />
    </div>
  </Form.Group>
);
