import React from "react";
import Form from "react-bootstrap/Form";
import { FILTERS } from "./utils";

interface Props {
  value: string;
  selection: string[];
  onChange: (value: string) => void; 
}

export const FilterSelect = ({value, selection, onChange}: Props) => {
  const selectionSet = new Set(selection);
  return (
    <>
      <Form.Label>Filter</Form.Label>
      <Form.Select
        onChange={(e) => onChange(e.target.value)}
        value={value}
      >
        {FILTERS.map((filter) => (
          <option
            disabled={selectionSet.has(filter)}
            value={filter}
            key={filter}
          >
            {filter}
          </option>
        ))}
      </Form.Select>
    </>
  );
};
