import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
var fs = require("fs");

export const VIEWPORT_SIZE = 100;

export default class GeometricDeckGenerator {
  private deckData: DeckData;
  private features: ValidFeatures[];
  private readonly numFeatures = 3;
  private readonly featureOptionsLength = 3;
  private readonly validFeatures: ValidFeatures[] = [
    "colors",
    "numbers",
    "unicode",
  ];

  constructor(deckData: DeckData) {
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
      if (featureOptions.length !== this.featureOptionsLength) {
        throw new Error(`
          Invalid deck data.
          All attributes must have ${this.featureOptionsLength} options.
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
        <svg x={x} y={y} viewBox="0 0 30 30" width={size} height={size}>
          <g style={{ fill: cardData.colors }} key={i}>
            <text dominant-baseline="hanging" text-anchor="start" fontSize={30}>
              {cardData.unicode}
            </text>
          </g>
        </svg>
      );
    }
    return symbolList;
  }

  private createSvg(cardData: CardData): JSX.Element {
    return (
      <svg
        height="100%"
        width="100%"
        viewBox={`0 0 ${VIEWPORT_SIZE} ${VIEWPORT_SIZE}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {this.listSymbols(cardData)}
      </svg>
    );
  }

  private createCardData(features: number[]): CardData {
    const cardData: CardData = {} as any;
    for (let i = 0; i < this.numFeatures; i++) {
      const feature = this.features[i];
      const optionValue = features[i];
      const f = this.deckData[feature];
      if (!f) {
        throw new Error("error attributes does not exist when it should :(");
      }
      (cardData[feature] as any) = f[optionValue];
    }
    return cardData;
  }

  public exportDeck(path: string): void {
    for (let i = 0; i < this.featureOptionsLength; i++) {
      for (let j = 0; j < this.featureOptionsLength; j++) {
        for (let k = 0; k < this.featureOptionsLength; k++) {
          const filename = `${i}_${j}_${k}`;
          const cardData = this.createCardData([i, j, k]);
          const symbol = this.createSvg(cardData);
          const svg = ReactDOMServer.renderToStaticMarkup(symbol);
          if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
          }
          fs.writeFile(`${path}${filename}.svg`, svg, () => null);
        }
      }
    }
  }

  public arrayDeck(): FeatureDeck {
    const deck: FeatureDeck = {};
    for (let i = 0; i < this.featureOptionsLength; i++) {
      for (let j = 0; j < this.featureOptionsLength; j++) {
        for (let k = 0; k < this.featureOptionsLength; k++) {
          const filename = `${i}_${j}_${k}`;
          const cardData = this.createCardData([i, j, k]);
          const symbol = this.createSvg(cardData);
          deck[filename] = symbol;
        }
      }
    }
    return deck;
  }

  public createSymbol(features: number[]): JSX.Element {
    return this.createSvg(this.createCardData(features));
  }
}
