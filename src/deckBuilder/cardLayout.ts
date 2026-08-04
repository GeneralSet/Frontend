export const MAIN_VIEWPORT_SIZE = 120;
export const SYMBOL_MARGIN = 5;

export interface GridSlot {
  x: number;
  y: number;
}

export interface CardGrid {
  cols: number;
  rows: number;
  cellSize: number;
}

// The deck builder's original fixed 3x3 layout, in its hand-picked
// center-first, then corners, then edge-midpoints order. Kept as a literal
// constant (rather than derived) so every capacity that resolves to this
// same grid (7, 8, and 9) renders pixel-identical to that original layout.
const LEGACY_CELL_SIZE = MAIN_VIEWPORT_SIZE / 3 - SYMBOL_MARGIN;
const LEGACY_START = 0;
const LEGACY_MIDDLE = MAIN_VIEWPORT_SIZE / 2 - LEGACY_CELL_SIZE / 2;
const LEGACY_END = MAIN_VIEWPORT_SIZE - LEGACY_CELL_SIZE;
const LEGACY_SLOTS: GridSlot[] = [
  { x: LEGACY_MIDDLE, y: LEGACY_MIDDLE },
  { x: LEGACY_START, y: LEGACY_END },
  { x: LEGACY_END, y: LEGACY_START },
  { x: LEGACY_END, y: LEGACY_END },
  { x: LEGACY_START, y: LEGACY_START },
  { x: LEGACY_END, y: LEGACY_MIDDLE },
  { x: LEGACY_START, y: LEGACY_MIDDLE },
  { x: LEGACY_MIDDLE, y: LEGACY_START },
  { x: LEGACY_MIDDLE, y: LEGACY_END },
];

/**
 * The cols x rows split (rows = ceil(capacity / cols)) that maximizes each
 * cell's size — min(120/cols, 120/rows) minus the fixed symbol margin — for
 * `capacity` shape slots. Ties favor the more square split, then fewer
 * columns, so results are deterministic.
 */
export function computeGrid(capacity: number): CardGrid {
  let best: CardGrid | undefined;
  for (let cols = 1; cols <= capacity; cols++) {
    const rows = Math.ceil(capacity / cols);
    const cellSize = Math.min(MAIN_VIEWPORT_SIZE / cols, MAIN_VIEWPORT_SIZE / rows) - SYMBOL_MARGIN;
    const squareness = Math.abs(cols - rows);
    if (
      !best ||
      cellSize > best.cellSize ||
      (cellSize === best.cellSize &&
        (squareness < Math.abs(best.cols - best.rows) ||
          (squareness === Math.abs(best.cols - best.rows) && cols < best.cols)))
    ) {
      best = { cols, rows, cellSize };
    }
  }
  return best as CardGrid;
}

/** Evenly spaced positions along one 120-unit axis for `count` cells of
 * `cellSize`: a single cell centers, more than one runs edge to edge. */
function axisPositions(count: number, cellSize: number): number[] {
  if (count === 1) {
    return [(MAIN_VIEWPORT_SIZE - cellSize) / 2];
  }
  const pitch = (MAIN_VIEWPORT_SIZE - cellSize) / (count - 1);
  return Array.from({ length: count }, (_, i) => i * pitch);
}

function gridSlots(grid: CardGrid): GridSlot[] {
  const xs = axisPositions(grid.cols, grid.cellSize);
  const ys = axisPositions(grid.rows, grid.cellSize);
  const slots: GridSlot[] = [];
  ys.forEach((y) => xs.forEach((x) => slots.push({ x, y })));
  return slots;
}

/** True when the grid has a single, unambiguous center cell (odd columns
 * and odd rows) — the case the legacy layout special-cases by skipping the
 * center slot for an even count. */
function hasCenterCell(grid: CardGrid): boolean {
  return grid.cols % 2 === 1 && grid.rows % 2 === 1;
}

const CENTER = MAIN_VIEWPORT_SIZE / 2;

function distanceFromCenter(slot: GridSlot, cellSize: number): number {
  const cx = slot.x + cellSize / 2;
  const cy = slot.y + cellSize / 2;
  return Math.hypot(cx - CENTER, cy - CENTER);
}

/**
 * The cell size and slot positions to render `count` shapes at `capacity`
 * grid resolution (`count` must be <= `capacity`). Reproduces the deck
 * builder's original fixed 3x3 layout exactly whenever the capacity
 * resolves to that grid (capacities 7-9); every other capacity uses an
 * evenly spaced grid, filled from the center outward, skipping the true
 * center cell for an even count the same way the legacy layout does. A
 * single shape always sits dead center, regardless of the capacity grid's
 * own shape (e.g. an even-columned grid has no cell that's exactly
 * centered on both axes).
 *
 * Cells are disjoint axis-aligned boxes by construction — computeGrid only
 * ever picks a cellSize small enough that the per-axis pitch between
 * adjacent cells exceeds the cell size — so slots never overlap.
 */
export function layoutCard(capacity: number, count: number): { cellSize: number; slots: GridSlot[] } {
  const grid = computeGrid(capacity);
  const isLegacyGrid = grid.cols === 3 && grid.rows === 3;
  const cellSize = isLegacyGrid ? LEGACY_CELL_SIZE : grid.cellSize;

  if (count === 1) {
    const center = (MAIN_VIEWPORT_SIZE - cellSize) / 2;
    return { cellSize, slots: [{ x: center, y: center }] };
  }

  if (isLegacyGrid) {
    const offset = count % 2 ? 0 : 1;
    return { cellSize, slots: LEGACY_SLOTS.slice(offset, offset + count) };
  }

  const slots = gridSlots(grid);
  const skipCenter = hasCenterCell(grid) && count % 2 === 0;
  const ordered = slots
    .filter((slot) => !skipCenter || distanceFromCenter(slot, cellSize) > 1e-6)
    .sort((a, b) => distanceFromCenter(a, cellSize) - distanceFromCenter(b, cellSize));
  return { cellSize, slots: ordered.slice(0, count) };
}
