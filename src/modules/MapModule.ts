import { MapModule, Point } from '../types';

function generateGrid(width: number, height: number, gridSize: number, path: Point[]): boolean[][] {
  const cols = Math.floor(width / gridSize);
  const rows = Math.floor(height / gridSize);
  const grid: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(true));
  
  // Mark path cells as non-buildable
  for (let i = 0; i < path.length - 1; i++) {
    const start = path[i];
    const end = path[i + 1];
    const steps = Math.max(Math.abs(end.x - start.x), Math.abs(end.y - start.y)) / gridSize;
    for (let s = 0; s <= steps; s++) {
      const t = steps === 0 ? 0 : s / steps;
      const px = Math.floor((start.x + (end.x - start.x) * t) / gridSize);
      const py = Math.floor((start.y + (end.y - start.y) * t) / gridSize);
      if (py >= 0 && py < rows && px >= 0 && px < cols) {
        grid[py][px] = false;
        // Also mark adjacent cells
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ny = py + dy;
            const nx = px + dx;
            if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
              // Keep path wider
            }
          }
        }
      }
    }
  }
  return grid;
}

export const classicMap: MapModule = {
  name: 'Классическая S-образная',
  width: 800,
  height: 600,
  gridSize: 40,
  path: [
    { x: 0, y: 100 },
    { x: 300, y: 100 },
    { x: 300, y: 300 },
    { x: 600, y: 300 },
    { x: 600, y: 500 },
    { x: 800, y: 500 },
  ],
  buildableGrid: [],
};

export const spiralMap: MapModule = {
  name: 'Спиральная',
  width: 800,
  height: 600,
  gridSize: 40,
  path: [
    { x: 0, y: 60 },
    { x: 740, y: 60 },
    { x: 740, y: 540 },
    { x: 100, y: 540 },
    { x: 100, y: 140 },
    { x: 660, y: 140 },
    { x: 660, y: 460 },
    { x: 180, y: 460 },
    { x: 180, y: 220 },
    { x: 580, y: 220 },
    { x: 580, y: 380 },
    { x: 400, y: 380 },
  ],
  buildableGrid: [],
};

export const zigzagMap: MapModule = {
  name: 'Зигзаг',
  width: 800,
  height: 600,
  gridSize: 40,
  path: [
    { x: 0, y: 80 },
    { x: 700, y: 80 },
    { x: 700, y: 200 },
    { x: 100, y: 200 },
    { x: 100, y: 320 },
    { x: 700, y: 320 },
    { x: 700, y: 440 },
    { x: 100, y: 440 },
    { x: 100, y: 560 },
    { x: 800, y: 560 },
  ],
  buildableGrid: [],
};

export const directMap: MapModule = {
  name: 'Прямая (хардкор)',
  width: 800,
  height: 600,
  gridSize: 40,
  path: [
    { x: 0, y: 300 },
    { x: 200, y: 300 },
    { x: 200, y: 100 },
    { x: 400, y: 100 },
    { x: 400, y: 500 },
    { x: 600, y: 500 },
    { x: 600, y: 300 },
    { x: 800, y: 300 },
  ],
  buildableGrid: [],
};

// Initialize grids
[classicMap, spiralMap, zigzagMap, directMap].forEach(map => {
  map.buildableGrid = generateGrid(map.width, map.height, map.gridSize, map.path);
});

export const mapPresets: Record<string, MapModule> = {
  classic: classicMap,
  spiral: spiralMap,
  zigzag: zigzagMap,
  direct: directMap,
};
