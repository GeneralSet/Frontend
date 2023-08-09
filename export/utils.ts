export const getPermutations = (array: string[], size: number) => {
  var result: string[][] = [];

  function p(t: string[], i: number) {
      if (t.length === size) {
          result.push(t);
          return;
      }
      if (i + 1 > array.length) {
          return;
      }
      p(t.concat(array[i]), i + 1);
      p(t, i + 1);
  }

  p([], 0);
  return result;
}

export const isSet = (cards: string[]) => {
  // format ids
  const cardArray = cards.map(c => c.split('_'));
  // rotate card ids so each array is options of a single feature
  const selections = cardArray[0].map((_, index) => cardArray.map(row => row[index]).reverse());
  // verify if set
  for (const s of selections) {
    const optionsSelected = new Set(s).size;
    if (optionsSelected === 1) {
      continue;
    }
    if (optionsSelected === cards.length) {
      continue;
    }
    return false;
  }
  return true;
}