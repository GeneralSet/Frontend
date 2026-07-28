import {
  DEFAULT_STATS,
  computeUpdatedStats,
  loadGameState,
  loadStats,
  newGameState,
  parseGameState,
  parseStats,
  saveGameState,
  saveStats,
} from "../storage";

const gameState = {
  dateKey: "2026-07-28",
  elapsedSeconds: 120,
  wrongGuesses: 2,
  hintsUsed: 1,
  completed: false,
  finalScoreSeconds: null,
};

beforeEach(() => {
  window.localStorage.clear();
});

test("game state round-trips through localStorage", () => {
  saveGameState(gameState);
  expect(loadGameState("2026-07-28")).toEqual(gameState);
});

test("a previous day's saved game is discarded", () => {
  saveGameState(gameState);
  expect(loadGameState("2026-07-29")).toBeNull();
});

test("corrupt game state is discarded", () => {
  expect(parseGameState("not json{", "2026-07-28")).toBeNull();
  expect(parseGameState('{"dateKey":"2026-07-28"}', "2026-07-28")).toBeNull();
  expect(parseGameState(null, "2026-07-28")).toBeNull();
});

test("stats round-trip through localStorage", () => {
  const stats = {
    completions: 5,
    currentStreak: 3,
    maxStreak: 4,
    bestScoreSeconds: 200,
    lastCompletedDateKey: "2026-07-27",
  };
  saveStats(stats);
  expect(loadStats()).toEqual(stats);
});

test("corrupt or missing stats fall back to defaults", () => {
  expect(parseStats(null)).toEqual(DEFAULT_STATS);
  expect(parseStats("not json{")).toEqual(DEFAULT_STATS);
  expect(parseStats('{"completions":"five"}')).toEqual(DEFAULT_STATS);
});

test("first ever completion starts a streak of 1", () => {
  const updated = computeUpdatedStats(DEFAULT_STATS, "2026-07-28", 300);
  expect(updated).toEqual({
    completions: 1,
    currentStreak: 1,
    maxStreak: 1,
    bestScoreSeconds: 300,
    lastCompletedDateKey: "2026-07-28",
  });
});

test("completing on consecutive days extends the streak", () => {
  const day1 = computeUpdatedStats(DEFAULT_STATS, "2026-07-27", 300);
  const day2 = computeUpdatedStats(day1, "2026-07-28", 250);
  expect(day2.currentStreak).toEqual(2);
  expect(day2.maxStreak).toEqual(2);
  expect(day2.completions).toEqual(2);
  expect(day2.bestScoreSeconds).toEqual(250);
});

test("a missed day resets the streak but keeps max streak and best score", () => {
  const before = {
    completions: 4,
    currentStreak: 4,
    maxStreak: 4,
    bestScoreSeconds: 180,
    lastCompletedDateKey: "2026-07-25",
  };
  const after = computeUpdatedStats(before, "2026-07-28", 400);
  expect(after.currentStreak).toEqual(1);
  expect(after.maxStreak).toEqual(4);
  expect(after.bestScoreSeconds).toEqual(180);
  expect(after.completions).toEqual(5);
});

test("recording the same day twice is a no-op", () => {
  const once = computeUpdatedStats(DEFAULT_STATS, "2026-07-28", 300);
  const twice = computeUpdatedStats(once, "2026-07-28", 100);
  expect(twice).toEqual(once);
});

test("localStorage failures degrade to defaults instead of throwing", () => {
  const getItem = jest
    .spyOn(Storage.prototype, "getItem")
    .mockImplementation(() => {
      throw new Error("storage disabled");
    });
  const setItem = jest
    .spyOn(Storage.prototype, "setItem")
    .mockImplementation(() => {
      throw new Error("storage disabled");
    });
  try {
    expect(loadGameState("2026-07-28")).toBeNull();
    expect(loadStats()).toEqual(DEFAULT_STATS);
    expect(() => saveGameState(newGameState("2026-07-28"))).not.toThrow();
    expect(() => saveStats(DEFAULT_STATS)).not.toThrow();
  } finally {
    getItem.mockRestore();
    setItem.mockRestore();
  }
});
