import React from "react";
import Form from "react-bootstrap/Form";
import { ROTATIONS } from "./utils";

interface Props {
  value: number;
  selection: number[];
  onChange: (value: number) => void; 
}

export const RotationSelect = ({value, selection, onChange}: Props) => {
  const selectionSet = new Set(selection);
  return (
    <>
      <Form.Label>Rotation</Form.Label>
      <Form.Select
        onChange={(e) => onChange(Number(e.target.value))}
        value={value}
      >
        {ROTATIONS.map((rotation) => (
          <option
            disabled={selectionSet.has(rotation)}
            value={rotation}
            key={rotation}
          >
            {rotation}
          </option>
        ))}
      </Form.Select>
    </>
  );
};
