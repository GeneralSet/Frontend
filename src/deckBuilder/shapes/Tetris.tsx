import { definePathShape } from "./PathShape";

export const TetrisLBlock = definePathShape(
  "M0.5,119.5 L79.5,119.5 L79.5,80.5 L39.5,80.5 L39.5,0.5 L0.5,0.5 L0.5,119.5 Z"
);

export const TetrisSBlock = definePathShape(
  "M0.5,119.5 L79.5,119.5 L79.5,79.5 L119.5,79.5 L119.5,40.5 L40.5,40.5 L40.5,80.5 L0.5,80.5 L0.5,119.5 Z"
);

export const TetrisJBlock = definePathShape(
  "M80.5,0.5 L80.5,80.5 L40.5,80.5 L40.5,119.5 L119.5,119.5 L119.5,0.5 L80.5,0.5 Z"
);

export const TetrisTBlock = definePathShape(
  "M0.5,119.5 L119.5,119.5 L119.5,80.5 L79.5,80.5 L79.5,40.5 L40.5,40.5 L40.5,80.5 L0.5,80.5 L0.5,119.5 Z"
);
