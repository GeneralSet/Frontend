import React from "react";
import Form from "react-bootstrap/Form";
import { COLORS } from "./utils";

interface Props {
  value: string;
  selection: string[];
  onChange: (value: string) => void; 
}

export const ColorSelect = ({value, selection, onChange}: Props) => {
  const selectionSet = new Set(selection);
  return (
    <>
      <Form.Label>Color</Form.Label>
      <Form.Select
        onChange={(e) => onChange(e.target.value)}
        value={value}
      >
        {Object.entries(COLORS).map(([name, color]) => (
          <option
            disabled={selectionSet.has(color)}
            value={color}
            style={{backgroundColor: color}}
            key={name}
          >
            {name}
          </option>
        ))}
      </Form.Select>
    </>
  );
};
