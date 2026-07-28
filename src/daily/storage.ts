import { yesterdayKey } from "./date";

export interface DailyGameState {
  dateKey: string;
  elapsedSeconds: number;
  wrongGuesses: number;
  hintsUsed: number;
  completed: boolean;
  finalScoreSeconds: number | null;
}

export interface DailyStats {
  completions: number;
  currentStreak: number;
  maxStreak: number;
  bestScoreSeconds: number | null;
  lastCompletedDateKey: string | null;
}

export const DEFAULT_STATS: DailyStats = {
  completions: 0,
  currentStreak: 0,
  maxStreak: 0,
  bestScoreSeconds: null,
  lastCompletedDateKey: null,
};

const GAME_KEY = "generalset.daily.game";
const STATS_KEY = "generalset.daily.stats";

export const newGameState = (dateKey: string): DailyGameState => ({
  dateKey,
  elapsedSeconds: 0,
  wrongGuesses: 0,
  hintsUsed: 0,
  completed: false,
  finalScoreSeconds: null,
});

/**
 * Fold a completion into lifetime stats. Idempotent for a day that is already
 * recorded, so re-renders and revisits can't double count. A completion the
 * day after the last one extends the streak; any gap restarts it.
 */
export const computeUpdatedStats = (
  stats: DailyStats,
  dateKey: string,
  scoreSeconds: number
): DailyStats => {
  if (stats.lastCompletedDateKey === dateKey) {
    return stats;
  }
  const currentStreak =
    stats.lastCompletedDateKey === yesterdayKey(dateKey)
      ? stats.currentStreak + 1
      : 1;
  return {
    completions: stats.completions + 1,
    currentStreak,
    maxStreak: Math.max(stats.maxStreak, currentStreak),
    bestScoreSeconds:
      stats.bestScoreSeconds === null
        ? scoreSeconds
        : Math.min(stats.bestScoreSeconds, scoreSeconds),
    lastCompletedDateKey: dateKey,
  };
};

/** Parse stored game state; null for corrupt JSON, bad shapes, or another day's state. */
export const parseGameState = (
  raw: string | null,
  dateKey: string
): DailyGameState | null => {
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      parsed.dateKey !== dateKey ||
      typeof parsed.elapsedSeconds !== "number" ||
      typeof parsed.wrongGuesses !== "number" ||
      typeof parsed.hintsUsed !== "number" ||
      typeof parsed.completed !== "boolean" ||
      (parsed.finalScoreSeconds !== null &&
        typeof parsed.finalScoreSeconds !== "number")
    ) {
      return null;
    }
    return {
      dateKey: parsed.dateKey,
      elapsedSeconds: parsed.elapsedSeconds,
      wrongGuesses: parsed.wrongGuesses,
      hintsUsed: parsed.hintsUsed,
      completed: parsed.completed,
      finalScoreSeconds: parsed.finalScoreSeconds,
    };
  } catch (e) {
    return null;
  }
};

/** Parse stored stats; DEFAULT_STATS for corrupt JSON or bad shapes. */
export const parseStats = (raw: string | null): DailyStats => {
  if (!raw) {
    return DEFAULT_STATS;
  }
  try {
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.completions !== "number" ||
      typeof parsed.currentStreak !== "number" ||
      typeof parsed.maxStreak !== "number" ||
      (parsed.bestScoreSeconds !== null &&
        typeof parsed.bestScoreSeconds !== "number") ||
      (parsed.lastCompletedDateKey !== null &&
        typeof parsed.lastCompletedDateKey !== "string")
    ) {
      return DEFAULT_STATS;
    }
    return {
      completions: parsed.completions,
      currentStreak: parsed.currentStreak,
      maxStreak: parsed.maxStreak,
      bestScoreSeconds: parsed.bestScoreSeconds,
      lastCompletedDateKey: parsed.lastCompletedDateKey,
    };
  } catch (e) {
    return DEFAULT_STATS;
  }
};

// localStorage itself can throw (Safari private mode, storage disabled), so
// every touch is wrapped: the game degrades to in-memory play instead of crashing.

export const loadGameState = (dateKey: string): DailyGameState | null => {
  try {
    return parseGameState(window.localStorage.getItem(GAME_KEY), dateKey);
  } catch (e) {
    return null;
  }
};

export const saveGameState = (state: DailyGameState): void => {
  try {
    window.localStorage.setItem(GAME_KEY, JSON.stringify(state));
  } catch (e) {
    // storage unavailable; play continues in memory
  }
};

export const loadStats = (): DailyStats => {
  try {
    return parseStats(window.localStorage.getItem(STATS_KEY));
  } catch (e) {
    return DEFAULT_STATS;
  }
};

export const saveStats = (stats: DailyStats): void => {
  try {
    window.localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    // storage unavailable; stats lost for this session
  }
};
