import {
  DAILY_PUZZLE_SCHEDULE,
  DEFAULT_DAILY_PUZZLE,
  DailyPuzzleDefinition,
  DailyPuzzleSchedule,
  getPuzzleForDate,
  resolvePuzzleForDate,
} from "../schedule";
import { createDailyDeck } from "../deck";

const puzzle = (name: string): DailyPuzzleDefinition => ({
  name,
  createDeck: createDailyDeck,
});

const schedule: DailyPuzzleSchedule = {
  "2024-07-28": puzzle("july 2024"),
  "2025-07-28": puzzle("july 2025"),
  "2026-07-28": puzzle("july 2026"),
  "2028-07-28": puzzle("july 2028"),
  "2025-12-25": puzzle("christmas 2025"),
};

test("the exact year-month-day entry wins", () => {
  expect(resolvePuzzleForDate(schedule, "2026-07-28")!.name).toEqual(
    "july 2026"
  );
});

test("a missing year falls back to the same day from the most recent earlier year", () => {
  expect(resolvePuzzleForDate(schedule, "2027-07-28")!.name).toEqual(
    "july 2026"
  );
  expect(resolvePuzzleForDate(schedule, "2026-12-25")!.name).toEqual(
    "christmas 2025"
  );
});

test("entries for future years never leak into earlier dates", () => {
  // 2028 is defined but the current year is 2027: only 2026 and older count
  expect(resolvePuzzleForDate(schedule, "2027-07-28")!.name).toEqual(
    "july 2026"
  );
  expect(resolvePuzzleForDate(schedule, "2024-12-25")).toBeNull();
});

test("other days in the month do not match", () => {
  expect(resolvePuzzleForDate(schedule, "2026-07-29")).toBeNull();
  expect(resolvePuzzleForDate(schedule, "2026-08-28")).toBeNull();
});

test("an undefined day resolves to null", () => {
  expect(resolvePuzzleForDate({}, "2026-07-28")).toBeNull();
});

test("getPuzzleForDate falls back to the default fixed deck", () => {
  // the checked-in schedule starts empty, so any date gets the default
  expect(Object.keys(DAILY_PUZZLE_SCHEDULE).length).toEqual(0);
  expect(getPuzzleForDate("2026-07-28")).toBe(DEFAULT_DAILY_PUZZLE);
});

test("the default puzzle builds the fixed 27-card deck", () => {
  const deck = DEFAULT_DAILY_PUZZLE.createDeck();
  expect(deck.features.length).toEqual(3);
  expect(Object.keys(deck.cards).length).toEqual(27);
});
