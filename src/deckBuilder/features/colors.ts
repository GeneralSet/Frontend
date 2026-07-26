import { ColorSet } from "../types";

/** Mix a hex color toward white (amount > 0) or black (amount < 0). */
const shade = (hex: string, amount: number): string => {
  const target = amount < 0 ? 0 : 255;
  const strength = Math.abs(amount);
  const value = parseInt(hex.slice(1), 16);
  const mix = (channel: number) => Math.round(channel + (target - channel) * strength);
  const r = mix((value >> 16) & 0xff);
  const g = mix((value >> 8) & 0xff);
  const b = mix(value & 0xff);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

/**
 * Derive a full color set from a single hue: the hue itself, a lighter tint,
 * and a darker shade. Individual entries can swap this for hand-tuned sets.
 */
const derive = (primary: string): ColorSet => ({
  primary,
  secondary: shade(primary, 0.45),
  tertiary: shade(primary, -0.3),
});

/**
 * The deck palette. Keys are the values stored in deck metadata, so they must
 * stay stable; primaries are chosen to be easily distinguishable.
 */
export const COLOR_SETS = {
  Red: derive("#e6194B"),
  Green: derive("#3cb44b"),
  Yellow: derive("#ffe119"),
  Blue: derive("#4363d8"),
  Orange: derive("#f58231"),
  Purple: derive("#911eb4"),
  Cyan: derive("#42d4f4"),
  Magenta: derive("#f032e6"),
  Lime: derive("#bfef45"),
  Pink: derive("#fabed4"),
  Teal: derive("#469990"),
  Lavender: derive("#dcbeff"),
  Brown: derive("#9a6324"),
  Beige: derive("#fffac8"),
  Maroon: derive("#800000"),
  Mint: derive("#aaffc3"),
  Olive: derive("#808000"),
  Apricot: derive("#ffd8b1"),
  Navy: derive("#000075"),
  Black: derive("#000000"),
};

export type ColorName = keyof typeof COLOR_SETS;

export const COLOR_NAMES = Object.keys(COLOR_SETS) as ColorName[];

export const isColorName = (name: string | number): name is ColorName =>
  typeof name === "string" && name in COLOR_SETS;

/**
 * Restrict a color set to the number of colors a shape supports: unsupported
 * slots repeat the last supported color, so shapes and patterns can always
 * read all three slots safely.
 */
export const clampColorSet = (colors: ColorSet, count: 1 | 2 | 3): ColorSet => {
  if (count === 1) {
    return { primary: colors.primary, secondary: colors.primary, tertiary: colors.primary };
  }
  if (count === 2) {
    return { primary: colors.primary, secondary: colors.secondary, tertiary: colors.secondary };
  }
  return colors;
};
