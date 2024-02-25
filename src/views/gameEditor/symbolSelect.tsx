import { SHAPES } from "deckBuilder/features/shapes";
import React from "react";
import Form from "react-bootstrap/Form";

interface Props {
  value: string;
  selection: string[];
  onChange: (value: string) => void; 
}

export const SymbolSelect = ({value, selection, onChange}: Props) => {
  const selectionSet = new Set(selection);
  return (
    <>
      <Form.Label>Symbol</Form.Label>
      <Form.Select
        onChange={(e) => onChange(e.target.value)}
        value={value}
      >
        {Object.keys(SHAPES).map((name) => (
          <option
            disabled={selectionSet.has(name)}
            value={name}
            key={name}
          >
            {name}
          </option>
        ))}
      </Form.Select>
    </>
  );
};
