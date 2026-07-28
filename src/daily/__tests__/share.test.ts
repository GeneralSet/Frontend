import { copyToClipboard, formatShareText, formatTime } from "../share";

test("formatTime formats minutes and seconds", () => {
  expect(formatTime(0)).toEqual("0:00");
  expect(formatTime(61)).toEqual("1:01");
  expect(formatTime(599)).toEqual("9:59");
});

test("formatTime includes hours only past an hour", () => {
  expect(formatTime(3600)).toEqual("1:00:00");
  expect(formatTime(3661)).toEqual("1:01:01");
});

test("formatTime clamps negatives and fractions", () => {
  expect(formatTime(-5)).toEqual("0:00");
  expect(formatTime(61.9)).toEqual("1:01");
});

test("formatShareText produces the shareable summary", () => {
  expect(
    formatShareText({
      dateKey: "2026-07-28",
      scoreSeconds: 322,
      wrongGuesses: 2,
      hintsUsed: 1,
      currentStreak: 3,
    })
  ).toEqual(
    "GeneralSet Daily 2026-07-28\n⏱️ 5:22 (2 wrong · 1 hint)\n🔥 Streak: 3"
  );
});

test("formatShareText pluralizes hints", () => {
  const text = formatShareText({
    dateKey: "2026-07-28",
    scoreSeconds: 60,
    wrongGuesses: 0,
    hintsUsed: 2,
    currentStreak: 1,
  });
  expect(text).toContain("2 hints");
});

test("copyToClipboard uses the clipboard API when available", async () => {
  const writeText = jest.fn().mockResolvedValue(undefined);
  Object.assign(navigator, { clipboard: { writeText } });
  await expect(copyToClipboard("hello")).resolves.toBe(true);
  expect(writeText).toHaveBeenCalledWith("hello");
});

test("copyToClipboard reports failure when every path fails", async () => {
  Object.assign(navigator, {
    clipboard: { writeText: jest.fn().mockRejectedValue(new Error("denied")) },
  });
  const execCommand = jest.fn(() => {
    throw new Error("unsupported");
  });
  (document as any).execCommand = execCommand;
  await expect(copyToClipboard("hello")).resolves.toBe(false);
});
