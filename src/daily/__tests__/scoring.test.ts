import {
  computeScore,
  penaltySeconds,
  HINT_PENALTY_SECONDS,
  WRONG_GUESS_PENALTY_SECONDS,
} from "../scoring";

test("a clean game scores its elapsed time", () => {
  expect(
    computeScore({ elapsedSeconds: 272, wrongGuesses: 0, hintsUsed: 0 })
  ).toEqual(272);
});

test("wrong guesses and hints add their penalties", () => {
  expect(
    computeScore({ elapsedSeconds: 100, wrongGuesses: 2, hintsUsed: 1 })
  ).toEqual(100 + 2 * WRONG_GUESS_PENALTY_SECONDS + HINT_PENALTY_SECONDS);
});

test("penaltySeconds only counts penalties", () => {
  expect(penaltySeconds({ wrongGuesses: 3, hintsUsed: 2 })).toEqual(
    3 * WRONG_GUESS_PENALTY_SECONDS + 2 * HINT_PENALTY_SECONDS
  );
  expect(penaltySeconds({ wrongGuesses: 0, hintsUsed: 0 })).toEqual(0);
});
