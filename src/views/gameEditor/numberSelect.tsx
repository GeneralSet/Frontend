import React from "react";
import Form from "react-bootstrap/Form";
import { NUMBERS } from "./utils";

interface Props {
  value: number;
  selection: number[];
  onChange: (value: number) => void; 
}

export const NumberSelect = ({value, selection, onChange}: Props) => {
  const selectionSet = new Set(selection);
  return (
    <>
      <Form.Label>Number</Form.Label>
      <Form.Select
        onChange={(e) => onChange(Number(e.target.value))}
        value={value}
      >
        {NUMBERS.map((number) => (
          <option
            disabled={selectionSet.has(number)}
            value={number}
            key={number}
          >
            {number}
          </option>
        ))}
      </Form.Select>
    </>
  );
};
