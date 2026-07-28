/** "4:32", or "1:04:32" once an hour is reached. */
export const formatTime = (totalSeconds: number): string => {
  const total = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (n: number): string => (n < 10 ? `0${n}` : `${n}`);
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
};

export interface ShareInput {
  dateKey: string;
  scoreSeconds: number;
  wrongGuesses: number;
  hintsUsed: number;
  currentStreak: number;
}

export const formatShareText = (input: ShareInput): string =>
  [
    `GeneralSet Daily ${input.dateKey}`,
    `⏱️ ${formatTime(input.scoreSeconds)} (${input.wrongGuesses} wrong · ${
      input.hintsUsed
    } ${input.hintsUsed === 1 ? "hint" : "hints"})`,
    `🔥 Streak: ${input.currentStreak}`,
  ].join("\n");

/**
 * Copy text to the clipboard, trying the async clipboard API first and the
 * legacy execCommand path second. Resolves false when both fail so the caller
 * can fall back to showing the text for manual copy.
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    // fall through to the legacy path
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const succeeded = document.execCommand("copy");
    document.body.removeChild(textarea);
    return succeeded;
  } catch (e) {
    return false;
  }
};
