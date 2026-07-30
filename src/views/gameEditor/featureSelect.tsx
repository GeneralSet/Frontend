import React from "react";
import Form from "react-bootstrap/Form";
import {
  FEATURES,
  FeatureName,
  FeatureValue,
  coerceFeatureValue,
  getFeatureOptions,
} from "deckBuilder/features";
import { COLOR_SETS, isColorName } from "deckBuilder/features/colors";

interface Props<F extends FeatureName> {
  feature: F;
  value: FeatureValue<F>;
  selection: readonly FeatureValue<F>[];
  onChange: (value: FeatureValue<F>) => void;
}

const optionStyle = (feature: FeatureName, option: string | number) =>
  feature === "colors" && isColorName(option)
    ? { backgroundColor: COLOR_SETS[option].primary }
    : undefined;

export const FeatureSelect = <F extends FeatureName>({
  feature,
  value,
  selection,
  onChange,
}: Props<F>) => {
  const selectionSet = new Set(selection);
  return (
    <>
      <Form.Label>{FEATURES[feature].label}</Form.Label>
      <Form.Select
        onChange={(e) => onChange(coerceFeatureValue(feature, e.target.value))}
        value={value}
      >
        {getFeatureOptions(feature).map((option) => (
          <option
            disabled={selectionSet.has(option)}
            value={option}
            style={optionStyle(feature, option)}
            key={option}
          >
            {option}
          </option>
        ))}
      </Form.Select>
    </>
  );
};
