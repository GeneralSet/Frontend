
interface DeckData {
  colors?: string[];
  shapes?: string[];
  rotations?: number[];
  numbers?: number[];
}

interface CardData {
  colors: string;
  shapes: string;
  rotations: number;
  numbers: number;
}

interface FeatureDeck {
  [id: string]: JSX.Element;
}


// jsx types hack

declare namespace JSX {
  interface IntrinsicElements {
    'animateTransform': React.SVGProps<SVGElement>;
  }
}
