type gameType = 'original' | 'triangles' | 'filters' | 'animations' | 'custom';

interface SetVariant {
  gameType: gameType;
  name: string;
}

interface GameState {
  deck: string[];
  board: string[];
  numberOfSets: number;
  previousSelection?: {
    user: string;
    valid: boolean;
    selection: string;
  };
}

interface User {
  name: string;
  points: number;
}

interface FeatureDeck {
  [feature: string]: JSX.Element;
}

declare module 'set';
declare module '@giantmachines/redux-websocket';

