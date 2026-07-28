import * as React from "react";
import { Deck, DeckMetaData, FeatureDeck } from "./types";

export type { DeckMetaData } from "./types";

/**
 * A deck whose cards are pre-rendered images served from
 * `public/decks/<path>/<id>.<ext>`, addressed by the same underscore-joined
 * option-index ids that `GeometricDeckGenerator` produces.
 */
export default class PresetDeck implements Deck {
  metaData: DeckMetaData;
  numOptions: number;
  features: string[];
  cards: FeatureDeck;

  constructor(metaData: DeckMetaData, path: string, ext: "png" | "svg") {
    this.metaData = metaData;
    this.numOptions = Object.values(metaData)[0].length;
    this.features = Object.keys(metaData);
    this.cards = this.createDeck(path, ext);
  }

  private createDeck(path: string, ext: string): FeatureDeck {
    const deck: FeatureDeck = {};
    const indexes: number[] = [];
    const looper = (loopNumber: number) => {
      for (indexes[loopNumber] = 0; indexes[loopNumber] < this.numOptions; indexes[loopNumber]++) {
        if (loopNumber < this.features.length - 1) {
          looper(loopNumber + 1);
        } else {
          const id = indexes.join("_");
          deck[id] = (
            <img src={`${process.env.PUBLIC_URL}/decks/${path}/${id}.${ext}`} alt="id" />
          );
        }
      }
    };
    looper(0);
    return deck;
  }
}
