import { ShapeDefinition } from "../types";
import { CircleQuarter, CircleSemi, CircleThreeQuarter } from "./Circles";
import { FriedEgg } from "./FriedEgg";
import { Sandcastle } from "./Sandcastle";
import { TetrisJBlock, TetrisLBlock, TetrisSBlock, TetrisTBlock } from "./Tetris";
import { TracksDeer, TracksFrog, TracksWolf } from "./Tracks";
import { Triangle } from "./Triangle";

const defineShapes = <T extends Record<string, ShapeDefinition>>(shapes: T): T => shapes;

/**
 * Every shape available to generated decks. Keys are the values stored in
 * deck metadata (and in saved presets), so they must stay stable.
 *
 * To add a shape: create a component file in this directory that exports a
 * `ShapeDefinition` — either via `definePathShape` or a hand-written
 * `React.FC<ShapeProps>` — and register it here.
 */
export const SHAPE_REGISTRY = defineShapes({
  "Circle - Quarter": CircleQuarter,
  "Circle - Semi": CircleSemi,
  "Circle - Three Quarter": CircleThreeQuarter,
  "Tetris - L Block": TetrisLBlock,
  "Tetris - S Block": TetrisSBlock,
  "Tetris - J Block": TetrisJBlock,
  "Tetris - T Block": TetrisTBlock,
  "Triangle": Triangle,
  "Tracks - Deer": TracksDeer,
  "Tracks - Wolf": TracksWolf,
  "Tracks - Frog": TracksFrog,
  "Fried Egg": FriedEgg,
  "Sandcastle": Sandcastle,
});

export type ShapeName = keyof typeof SHAPE_REGISTRY;

export const SHAPE_NAMES = Object.keys(SHAPE_REGISTRY) as ShapeName[];
