import React from "react";
import Form from "react-bootstrap/Form";

interface Props {
  feature: ValidFeatures;
  features: number
  deckData: DeckData;
  onFeatureSelect: (feature: ValidFeatures, enabled: boolean) => void; 
}

export const EnableFeature = ({feature, features, deckData, onFeatureSelect}: Props) => {
  const checked = Array.isArray(deckData[feature]);
  return (
    <Form.Switch
      label={"Enabled"}
      onChange={(e) => onFeatureSelect(feature, e.target.checked )}
      checked={checked}
      style={{float:"right"}}
      disabled={checked && features <= 1}
    />
  );
};


// {localDeck.features.length > 1 ? () : null}