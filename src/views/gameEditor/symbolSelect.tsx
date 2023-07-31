import React from "react";
import Form from "react-bootstrap/Form";

const SYMBOLS = ["★", "✚", "⎈", "▲", "■", "⬥", "●", "⬟", "⬢", "✖", "♥"];

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
        {SYMBOLS.map((symbol) => (
          <option
            disabled={selectionSet.has(symbol)}
            value={symbol}
            key={symbol}
          >
            {symbol}
          </option>
        ))}
      </Form.Select>
    </>
  );
};
