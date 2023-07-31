import React from "react";
import Form from "react-bootstrap/Form";

export const COLORS = {
  Black: "#000000",
  Red: "#e6194B",
  Green: "#3cb44b",
  Yellow: "#ffe119",
  Blue: "#4363d8",
  Orange: "#f58231",
  Purple: "#911eb4",
  Cyan: "#42d4f4",
  Magenta: "#f032e6",
  Lime: "#bfef45",
  Pink: "#fabed4"
};

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
          >
            {name}
          </option>
        ))}
      </Form.Select>
    </>
  );
};
