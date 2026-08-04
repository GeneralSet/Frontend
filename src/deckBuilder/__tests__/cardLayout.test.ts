import { computeGrid, layoutCard } from "../cardLayout";

// The deck builder's original fixed layout: 9 slots on a 3x3 grid, center
// first, then corners, then edge-midpoints, cell size 35.
const LEGACY_POSITIONS = [
  { x: 42.5, y: 42.5 },
  { x: 0, y: 85 },
  { x: 85, y: 0 },
  { x: 85, y: 85 },
  { x: 0, y: 0 },
  { x: 85, y: 42.5 },
  { x: 0, y: 42.5 },
  { x: 42.5, y: 0 },
  { x: 42.5, y: 85 },
];

test("capacities 7-9 all resolve to the legacy 3x3 grid", () => {
  expect(computeGrid(9)).toEqual({ cols: 3, rows: 3, cellSize: 35 });
  expect(computeGrid(8)).toEqual({ cols: 3, rows: 3, cellSize: 35 });
  expect(computeGrid(7)).toEqual({ cols: 3, rows: 3, cellSize: 35 });
});

test("capacity 1 fills nearly the whole card", () => {
  expect(computeGrid(1)).toEqual({ cols: 1, rows: 1, cellSize: 115 });
});

test("capacity 6 ties between 2x3 and 3x2, resolved toward fewer columns", () => {
  expect(computeGrid(6)).toEqual({ cols: 2, rows: 3, cellSize: 35 });
});

test("layoutCard(9, n) reproduces the legacy position table exactly", () => {
  for (let n = 1; n <= 9; n++) {
    const { cellSize, slots } = layoutCard(9, n);
    expect(cellSize).toBe(35);
    const offset = n % 2 ? 0 : 1;
    expect(slots).toEqual(LEGACY_POSITIONS.slice(offset, offset + n));
  }
});

test("no two slots ever overlap, for any capacity/count combination", () => {
  for (let capacity = 1; capacity <= 9; capacity++) {
    for (let count = 1; count <= capacity; count++) {
      const { cellSize, slots } = layoutCard(capacity, count);
      expect(slots).toHaveLength(count);
      for (let i = 0; i < slots.length; i++) {
        for (let j = i + 1; j < slots.length; j++) {
          const dx = Math.abs(slots[i].x - slots[j].x);
          const dy = Math.abs(slots[i].y - slots[j].y);
          expect(dx >= cellSize || dy >= cellSize).toBe(true);
        }
      }
    }
  }
});
