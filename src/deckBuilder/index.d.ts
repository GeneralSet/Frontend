
interface Shape {
  name?: string;
  shape: JSX.Element;
}

type ShadingFunction = (shape: JSX.Element, color: string) => JSX.Element;

interface DeckData {
  colors: string[];
  unicode: string[];
  numbers: number[];
}

type ValidFeatures = 'colors' | 'numbers' | 'unicode';

interface CardData {
  colors: string;
  unicode: string;
  numbers: number;
}

// jsx types hack

declare namespace JSX {
  interface IntrinsicElements {
    'animateTransform': React.SVGProps<SVGElement>;
  }
}
