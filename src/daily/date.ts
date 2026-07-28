const pad = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

/**
 * Local calendar date key ("2026-07-28"). Uses local getters, never
 * toISOString: the puzzle must roll over at the player's midnight, not UTC's.
 */
export const getDateKey = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Date key of the day before `dateKey`. Anchored at noon so DST shifts can't skip a day. */
export const yesterdayKey = (dateKey: string): string => {
  const [year, month, day] = dateKey.split("-").map(Number);
  const noon = new Date(year, month - 1, day, 12);
  noon.setDate(noon.getDate() - 1);
  return getDateKey(noon);
};

/** Milliseconds until the next local midnight (when the next puzzle unlocks). */
export const msUntilNextMidnight = (now: Date): number =>
  new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() -
  now.getTime();
