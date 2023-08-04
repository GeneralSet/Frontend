
export const COLORS = {
  Red: "#e6194B",
  Green: "#3cb44b",
  Yellow: "#ffe119",
  Blue: "#4363d8",
  Orange: "#f58231",
  Purple: "#911eb4",
  Cyan: "#42d4f4",
  Magenta: "#f032e6",
  Lime: "#bfef45",
  Pink: "#fabed4",
  Teal: "#469990",
  Lavender: "#dcbeff",
  Brown: "#9a6324",
  Beige: "#fffac8",
  Maroon: "#800000",
  Mint: "#aaffc3",
  Olive: "#808000",
  Apricot: "#ffd8b1",
  Navy: "#000075",
  Black: "#000000",
};

export const NUMBERS = [1,2,3,4,5,6,7,8,9];
export const SYMBOLS = ["★", "✚", "⎈", "▲", "■", "⬥", "●", "⬟", "⬢", "✖", "♥"];


const featureOptions = {
  colors: Object.values(COLORS),
  unicode: SYMBOLS,
  numbers: NUMBERS
}

export const getAvailableValue = (feature: ValidFeatures, used: (string |number)[]) => {
  const options = featureOptions[feature];
  const difference = (options as string[]).filter(x => !used.includes(x));
  return difference[Math.floor(Math.random()*difference.length)];
}