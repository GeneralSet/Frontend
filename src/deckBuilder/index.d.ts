
interface Shape {
  name?: string;
  shape: JSX.Element;
}

type ShadingFunction = (shape: JSX.Element, color: string) => JSX.Element;

interface DeckData {
  shapes?: Shape[];
  colors?: string[];
  shadings?: ShadingFunction[];
  numbers?: number[];
  animation?: JSX.Element[];
}

type ValidFeatures = 'shapes' | 'colors' | 'shadings' | 'numbers' | 'animation';

interface CardData {
  shapes?: Shape;
  colors?: string;
  shadings?: ShadingFunction;
  numbers?: number;
  animation?: JSX.Element;
}

// jsx types hack

declare namespace JSX {
  interface IntrinsicElements {
    'animateTransform': React.SVGProps<SVGElement>;
  }
}
