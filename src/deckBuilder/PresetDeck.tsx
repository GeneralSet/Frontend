import * as React from "react";

export default class PresetDeck {
  features: string[];
  numOptions: number;
  cards: FeatureDeck;

  constructor(options: number, features: string[], path: string, ext: "png" | "svg") {
    this.numOptions = options;
    this.features = features;
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
          const id = indexes.join('_');
          const symbol = (
            <img src={`${process.env.PUBLIC_URL}/decks/${path}/${id}.${ext}`}/>
          );

          deck[id] = symbol;
         }
      }
    }
    looper(0);
    return deck;
  }

}
