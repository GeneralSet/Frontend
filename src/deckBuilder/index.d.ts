
interface DeckData {
  colors?: string[];
  unicode?: string[];
  numbers?: number[];
}

type ValidFeatures = 'colors' | 'numbers' | 'unicode';

interface CardData {
  colors: string;
  unicode: string;
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
