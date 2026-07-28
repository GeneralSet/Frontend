import * as React from "react";
import { CardSvg } from "./CardSvg";
import {
  CardData,
  DEFAULT_CARD,
  FeatureName,
  GeneratedDeckMetaData,
  isFeatureName,
} from "./features";
import { Deck, FeatureDeck } from "./types";

export { MAIN_VIEWPORT_SIZE } from "./CardSvg";

let instanceCounter = 0;

/**
 * Builds the full cartesian-product deck for the given metadata. Card ids are
 * underscore-joined option indices ("0_1_2") in metadata key order — a
 * contract shared with the set engine and pre-rendered preset decks, so both
 * must stay stable. Rendering is delegated to `CardSvg`, which applies each
 * feature only if the card's shape supports it.
 */
export default class GeometricDeckGenerator implements Deck {
  metaData: GeneratedDeckMetaData;
  features: string[];
  numOptions: number;
  cards: FeatureDeck;
  private defaults: CardData;
  private idPrefix: string;

  constructor(
    metaData: GeneratedDeckMetaData,
    defaultCardData?: Partial<CardData>,
    options?: { idPrefix?: string }
  ) {
    this.metaData = metaData;
    this.features = Object.keys(metaData);
    const optionLists = Object.values(metaData);
    this.numOptions = optionLists[0] ? optionLists[0].length : 0;
    this.defaults = { ...DEFAULT_CARD, ...defaultCardData };
    this.idPrefix = (options && options.idPrefix) || `d${instanceCounter++}`;
    this.cards = this.createDeck();
  }

  private setFeature<F extends FeatureName>(
    card: CardData,
    feature: F,
    optionIndex: number
  ): void {
    const options = this.metaData[feature];
    if (!options) {
      throw new Error(`Error attribute for ${feature} does not exist`);
    }
    card[feature] = options[optionIndex];
  }

  private resolveCard(optionIndexes: number[]): CardData {
    const card: CardData = { ...this.defaults };
    this.features.forEach((feature, i) => {
      if (isFeatureName(feature)) {
        this.setFeature(card, feature, optionIndexes[i]);
      }
    });
    return card;
  }

  private createDeck(): FeatureDeck {
    const deck: FeatureDeck = {};
    const indexes: number[] = [];
    const looper = (loopNumber: number) => {
      for (indexes[loopNumber] = 0; indexes[loopNumber] < this.numOptions; indexes[loopNumber]++) {
        if (loopNumber < this.features.length - 1) {
          looper(loopNumber + 1);
        } else {
          const id = indexes.join("_");
          deck[id] = (
            <CardSvg key={id} cardId={`${this.idPrefix}-${id}`} card={this.resolveCard(indexes)} />
          );
        }
      }
    };
    looper(0);
    return deck;
  }
}
