import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import { SHAPES, VIEW_BOX } from "./features/shapes";
import { DeckMetaData } from "./PresetDeck";
var fs = require("fs");

export const MAIN_VIEWPORT_SIZE = 120;

export default class GeometricDeckGenerator {
  metaData: DeckMetaData;
  deckData: DeckData;
  features: ValidFeatures[];
  numOptions: number;
  private defaultCardData: CardData = {
    colors: "#000",
    shapes: SHAPES["Three Quarter Circle"],
    numbers: 1
  };
  cards: FeatureDeck;

  constructor(deckData: DeckData, defaultCardData?: CardData, exportPath?: string) {
    this.metaData = {}// TODO
    this.numOptions = Object.values(deckData)[0].length;
    this.features = this.getFeatures(deckData);
    this.deckData = deckData;
    if (defaultCardData) {
      this.defaultCardData = defaultCardData
    }
    this.cards = this.createDeck(exportPath);
  }

  private getFeatures(deckData: DeckData): ValidFeatures[] {
    const features: ValidFeatures[] = [];
    Object.keys(deckData).forEach((f: any) => {
      const featureOptions = (deckData as any)[f];
      if (typeof featureOptions === "undefined") {
        return;
      }
      if (featureOptions.length !== this.numOptions) {
        throw new Error(`
          Invalid deck data.
          All attributes must have ${this.numOptions} options.
          ${f} has ${featureOptions.length} options.
          type: ${typeof featureOptions}
        `);
      }
      features.push(f);
    });
    return features;
  }

  private listSymbols(cardData: CardData) {
    const symbolList: JSX.Element[] = [];
    const size = MAIN_VIEWPORT_SIZE / 3;
    const start = 0;
    const middle = MAIN_VIEWPORT_SIZE / 2 - size / 2;
    const end = MAIN_VIEWPORT_SIZE - size;
    const position = [
      { x: middle, y: middle },
      { x: start, y: end },
      { x: end, y: start },
      { x: end, y: end },
      { x: start, y: start },
      { x: end, y: middle },
      { x: start, y: middle },
      { x: middle, y: start },
      { x: middle, y: end },
    ];
    for (let i = 0; i < cardData.numbers; i++) {
      const offset = cardData.numbers % 2 ? 0 : 1;
      const x = position[i + offset].x;
      const y = position[i + offset].y;
      symbolList.push(
        <svg x={x} y={y} viewBox={VIEW_BOX} width={size} height={size} key={`${x}${y}`}>
          <g 
            stroke="none"
            strokeWidth="1"
            fill={cardData.colors}
            fillRule="evenodd"
            key={i}
          >
            <path d={cardData.shapes} stroke={cardData.colors}></path>
          </g>
        </svg>
      );
    }
    return symbolList;
  }

  private createSvg(features: number[]): JSX.Element {
    const cardData = {...this.defaultCardData};
    for (let i = 0; i < this.features.length; i++) {
      const feature = this.features[i];
      const optionValue = features[i];
      const f = this.deckData[feature];
      if (!f) {
        throw new Error(`Error attribute for ${feature} does not exist`);
      }
      (cardData as any)[feature] = f[optionValue] ;
    }
    return (
      <svg
        height="100%"
        width="100%"
        viewBox={`0 0 ${MAIN_VIEWPORT_SIZE} ${MAIN_VIEWPORT_SIZE}`}
        xmlns="http://www.w3.org/2000/svg"
        key={features.join('_')}
      >
        {this.listSymbols(cardData as CardData)}
      </svg>
    );
  }

  private createDeck(exportPath?: string): FeatureDeck {
    const deck: FeatureDeck = {};
    const indexes: number[] = [];
    const looper = (loopNumber: number) => {  
      for (indexes[loopNumber] = 0; indexes[loopNumber] < this.numOptions; indexes[loopNumber]++) {
         if (loopNumber < this.features.length - 1) {
          looper(loopNumber + 1);
         } else {
          const id = indexes.join('_');
          const symbol = this.createSvg(indexes);
          if (exportPath) {
            const svg = ReactDOMServer.renderToStaticMarkup(symbol);
            if (!fs.existsSync(exportPath)) {
              fs.mkdirSync(exportPath);
            }
            fs.writeFile(`${exportPath}${id}.svg`, svg, () => null);
          }
          deck[id] = symbol;
         }
      }
    }
    looper(0);
    return deck;
  }
}
