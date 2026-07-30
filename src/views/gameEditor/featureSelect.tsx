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
  /**
   * The options to offer, when they are narrower than the feature's full list
   * — a shape-only feature can only offer what the shapes in play can draw.
   */
  options?: readonly FeatureValue<F>[];
  /**
   * Whether an option another card already uses may be picked again. Cards
   * have to differ in every varying feature, so by default they may not.
   */
  canRepeat?: (option: FeatureValue<F>) => boolean;
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
  options,
  canRepeat,
}: Props<F>) => {
  const selectionSet = new Set(selection);
  const isTaken = (option: FeatureValue<F>) =>
    selectionSet.has(option) && !(canRepeat && canRepeat(option));
  return (
    <>
      <Form.Label>{FEATURES[feature].label}</Form.Label>
      <Form.Select
        onChange={(e) => onChange(coerceFeatureValue(feature, e.target.value))}
        value={value}
      >
        {(options || getFeatureOptions(feature)).map((option) => (
          <option
            disabled={isTaken(option)}
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
