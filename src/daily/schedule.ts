import { Deck } from "deckBuilder/types";
import GeometricDeckGenerator from "deckBuilder/GeometricDeckGenerator";
import { createDailyDeck } from "./deck";

export interface DailyPuzzleDefinition {
  /** Shown in the daily game header so players know which puzzle they got. */
  name: string;
  /**
   * Builds the deck for this puzzle. Any Deck works: a generated symbol deck
   * (GeometricDeckGenerator) or a pre-rendered image deck (PresetDeck). Give
   * generated decks a unique idPrefix so their SVG ids never collide.
   */
  createDeck: () => Deck;
}

/** Puzzle definitions keyed by local date, "YYYY-MM-DD". */
export interface DailyPuzzleSchedule {
  [dateKey: string]: DailyPuzzleDefinition;
}

/**
 * Define which puzzle appears on which day by adding entries here.
 *
 * Resolution order for a given date:
 *   1. the entry for that exact year-month-day;
 *   2. the entry for the same month and day from the most recent earlier
 *      year (so a puzzle defined once recurs annually until overridden —
 *      entries for future years stay hidden until their year arrives);
 *   3. the default fixed deck (DEFAULT_DAILY_PUZZLE).
 *
 * Examples (import GeometricDeckGenerator from "deckBuilder/GeometricDeckGenerator"
 * or PresetDeck from "deckBuilder/PresetDeck" as needed):
 *
 *   "2026-10-31": {
 *     name: "Halloween",
 *     createDeck: () =>
 *       new GeometricDeckGenerator(
 *         {
 *           shapes: ["Triangle", "Circle - Semi", "Tetris - T Block"],
 *           colors: ["Maroon", "Olive", "Black"],
 *           numbers: [1, 2, 3],
 *         },
 *         undefined,
 *         { idPrefix: "daily-halloween" }
 *       ),
 *   },
 *   "2026-12-25": {
 *     name: "Cute Animals",
 *     createDeck: () =>
 *       new PresetDeck(
 *         {
 *           Animal: ["Cat", "Dog", "Bird"],
 *           Hat: ["Top Hat", "Beret", "Hard Hat"],
 *           Color: ["Black", "Orange", "White"],
 *         },
 *         "SD-XL/animal-hat-color",
 *         "png"
 *       ),
 *   },
 */
export const DAILY_PUZZLE_SCHEDULE: DailyPuzzleSchedule = {
  "2026-06-03": {
    name: "National Egg Day",
    createDeck: () =>
      new GeometricDeckGenerator(
        {
          numbers: [1, 2, 3],
          yolks: [1, 2, 3],
          colors: ["Yellow", "Orange", "Red"],
        },
        { shapes: "Fried Egg" },
        { idPrefix: "daily-egg" }
      ),
  },
  "2026-08-01": {
    name: "National Sand Castle Day",
    createDeck: () =>
      new GeometricDeckGenerator(
        {
          numbers: [1, 2, 3, 4],
          spires: [1, 2, 3, 4],
          colors: ["Beige", "Orange", "Brown", "Maroon"],
        },
        { shapes: "Sandcastle" },
        { idPrefix: "daily-sandcastle" }
      ),
  },
};

/** The deck used whenever no scheduled puzzle matches the date. */
export const DEFAULT_DAILY_PUZZLE: DailyPuzzleDefinition = {
  name: "Circles",
  createDeck: createDailyDeck,
};

/**
 * Look up the puzzle for a date in a schedule: the exact date if defined,
 * otherwise the same month/day from the most recent earlier year, otherwise
 * null. Future years never leak into earlier dates.
 */
export const resolvePuzzleForDate = (
  schedule: DailyPuzzleSchedule,
  dateKey: string
): DailyPuzzleDefinition | null => {
  if (schedule[dateKey]) {
    return schedule[dateKey];
  }
  const year = Number(dateKey.slice(0, 4));
  const monthDay = dateKey.slice(4); // "-MM-DD"
  let bestYear = -1;
  Object.keys(schedule).forEach((key) => {
    if (key.slice(4) !== monthDay) {
      return;
    }
    const keyYear = Number(key.slice(0, 4));
    if (keyYear < year && keyYear > bestYear) {
      bestYear = keyYear;
    }
  });
  return bestYear >= 0 ? schedule[`${bestYear}${monthDay}`] : null;
};

/** The puzzle the daily game plays on `dateKey`. */
export const getPuzzleForDate = (dateKey: string): DailyPuzzleDefinition =>
  resolvePuzzleForDate(DAILY_PUZZLE_SCHEDULE, dateKey) || DEFAULT_DAILY_PUZZLE;
