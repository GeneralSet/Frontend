import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
var fs = require("fs");

export const VIEWPORT_SIZE = 100;

export default class GeometricDeckGenerator {
  private deckData: DeckData;
  private features: ValidFeatures[];
  private readonly numFeatures = 3;
  private numOptions: number;
  private readonly validFeatures: ValidFeatures[] = [
    "colors",
    "numbers",
    "unicode",
  ];

  constructor(deckData: DeckData) {
    this.numOptions = Object.values(deckData)[0].length;
    this.features = this.getFeatures(deckData);
    this.deckData = deckData;
  }

  private getFeatures(deckData: DeckData): ValidFeatures[] {
    const features: ValidFeatures[] = [];
    this.validFeatures.forEach((feature) => {
      const featureOptions = deckData[feature];
      if (typeof featureOptions === "undefined") {
        return;
      }
      if (featureOptions.length !== this.numOptions) {
        throw new Error(`
          Invalid deck data.
          All attributes must have ${this.numOptions} options.
          ${feature} has ${featureOptions.length} options.
        `);
      }
      features.push(feature);
    });
    return features;
  }

  private listSymbols(cardData: CardData) {
    const symbolList: JSX.Element[] = [];
    const size = VIEWPORT_SIZE / 3;
    const start = 0;
    const middle = VIEWPORT_SIZE / 2 - size / 2;
    const end = VIEWPORT_SIZE - size;
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
        <svg x={x} y={y} viewBox="0 0 30 30" width={size} height={size} key={`${x}${y}`}>
          <g style={{ fill: cardData.colors }} key={i}>
            <text dominantBaseline="hanging" textAnchor="start" fontSize={30}>
              {cardData.unicode}
            </text>
          </g>
        </svg>
      );
    }
    return symbolList;
  }

  private createSvg(features: number[]): JSX.Element {
    const cardData: Partial<CardData> = {};
    for (let i = 0; i < this.numFeatures; i++) {
      const feature = this.features[i];
      const optionValue = features[i];
      const f = this.deckData[feature];
      if (!f) {
        throw new Error("error attributes does not exist when it should :(");
      }
      (cardData[feature] as any) = f[optionValue];
    }
    return (
      <svg
        height="100%"
        width="100%"
        viewBox={`0 0 ${VIEWPORT_SIZE} ${VIEWPORT_SIZE}`}
        xmlns="http://www.w3.org/2000/svg"
        key={features.join('_')}
      >
        {this.listSymbols(cardData as CardData)}
      </svg>
    );
  }

  public createDeck(exportPath?: string): FeatureDeck {
    const deck: FeatureDeck = {};
    const indexes: number[] = [];
    const looper = (loopNumber: number) => {  
      for (indexes[loopNumber] = 0; indexes[loopNumber] < this.numOptions; indexes[loopNumber]++) {
         if (loopNumber < this.numFeatures - 1) {
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
