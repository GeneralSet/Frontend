// function returns a pair of set ids
// example [0_0, 1_1, 2_2]
export const getASet = (options: number, features: number): string[] => {
  return [...Array(options)].map((_, i) => {
      const id = [];
      for (let j = 0; j < features; j++) id.push(i);
      return id.join('_');
  });
}
