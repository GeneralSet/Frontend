export const WRONG_GUESS_PENALTY_SECONDS = 10;
export const HINT_PENALTY_SECONDS = 30;

export interface ScoreInput {
  elapsedSeconds: number;
  wrongGuesses: number;
  hintsUsed: number;
}

export const penaltySeconds = (input: {
  wrongGuesses: number;
  hintsUsed: number;
}): number =>
  input.wrongGuesses * WRONG_GUESS_PENALTY_SECONDS +
  input.hintsUsed * HINT_PENALTY_SECONDS;

/** Final score: play time plus penalty time. Lower is better. */
export const computeScore = (input: ScoreInput): number =>
  input.elapsedSeconds + penaltySeconds(input);
