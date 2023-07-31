import React from "react";
import Form from "react-bootstrap/Form";

const NUMBERS = [1,2,3,4,5,6,7,8,9];

interface Props {
  value: number;
  selection: number[];
  onChange: (value: string) => void; 
}

export const NumberSelect = ({value, selection, onChange}: Props) => {
  const selectionSet = new Set(selection);
  return (
    <>
      <Form.Label>Number</Form.Label>
      <Form.Select
        onChange={(e) => onChange(e.target.value)}
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
