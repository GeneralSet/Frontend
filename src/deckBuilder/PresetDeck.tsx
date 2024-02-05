import * as React from "react";

export interface DeckMetaData {
  [feature: string]: string[]
}


export default class PresetDeck {
  metaData: DeckMetaData;
  numOptions: number;
  features: string[];
  cards: FeatureDeck;

  constructor(metaData: DeckMetaData, path: string, ext: "png" | "svg") {
    this.metaData = metaData;
    this.numOptions = Object.keys(metaData).length;
    this.features = Object.values(metaData)[0];//Object.values(options)[0].length;
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
            <img src={`${process.env.PUBLIC_URL}/decks/${path}/${id}.${ext}`} alt="id"/>
          );
          deck[id] = symbol;
         }
      }
    }
    looper(0);
    return deck;
  }

}
