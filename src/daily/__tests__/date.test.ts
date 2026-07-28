import { getDateKey, msUntilNextMidnight, yesterdayKey } from "../date";

test("getDateKey zero-pads month and day", () => {
  expect(getDateKey(new Date(2026, 0, 5))).toEqual("2026-01-05");
  expect(getDateKey(new Date(2026, 11, 31))).toEqual("2026-12-31");
});

test("yesterdayKey handles plain days", () => {
  expect(yesterdayKey("2026-07-28")).toEqual("2026-07-27");
});

test("yesterdayKey crosses month boundaries", () => {
  expect(yesterdayKey("2026-03-01")).toEqual("2026-02-28");
  expect(yesterdayKey("2024-03-01")).toEqual("2024-02-29");
});

test("yesterdayKey crosses year boundaries", () => {
  expect(yesterdayKey("2026-01-01")).toEqual("2025-12-31");
});

test("msUntilNextMidnight is positive and at most 24 hours", () => {
  const ms = msUntilNextMidnight(new Date(2026, 6, 28, 15, 30, 12));
  expect(ms).toBeGreaterThan(0);
  expect(ms).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
});

test("msUntilNextMidnight just before midnight", () => {
  const ms = msUntilNextMidnight(new Date(2026, 6, 28, 23, 59, 59));
  expect(ms).toEqual(1000);
});
