
interface DeckData {
  colors?: string[];
  shapes?: string[];
  numbers?: number[];
}

type ValidFeatures = 'colors' | 'numbers' | 'shapes';

interface CardData {
  colors: string;
  shapes: string;
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
