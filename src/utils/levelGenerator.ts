import { CellType, LevelData } from '@/types/game';

const GRID_SIZE = 10;

export const generateLevel = (levelNumber: number): LevelData => {
  // Initialize grid with walls
  const grid: CellType[][] = Array(GRID_SIZE).fill(null).map(() => 
    Array(GRID_SIZE).fill('wall')
  );

  // Create basic room structure
  for (let y = 1; y < GRID_SIZE - 1; y++) {
    for (let x = 1; x < GRID_SIZE - 1; x++) {
      // Create more open spaces on higher levels
      const openChance = Math.min(0.7 + (levelNumber * 0.05), 0.9);
      if (Math.random() < openChance) {
        grid[y][x] = 'floor';
      }
    }
  }

  // Ensure player start position is always accessible (top-left area)
  const playerStart = { x: 1, y: 1 };
  grid[playerStart.y][playerStart.x] = 'floor';
  
  // Ensure some connected paths
  for (let i = 0; i < 3; i++) {
    const x = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
    const y = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
    grid[y][x] = 'floor';
    
    // Create cross pattern to ensure connectivity
    if (x > 0) grid[y][x - 1] = 'floor';
    if (x < GRID_SIZE - 1) grid[y][x + 1] = 'floor';
    if (y > 0) grid[y - 1][x] = 'floor';
    if (y < GRID_SIZE - 1) grid[y + 1][x] = 'floor';
  }

  // Place treasures (more treasures on higher levels)
  const treasureCount = Math.min(3 + Math.floor(levelNumber / 2), 8);
  let treasuresPlaced = 0;
  
  while (treasuresPlaced < treasureCount) {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    
    if (grid[y][x] === 'floor' && !(x === playerStart.x && y === playerStart.y)) {
      grid[y][x] = 'treasure';
      treasuresPlaced++;
    }
  }

  // Place portal (bottom-right area)
  let portalPlaced = false;
  while (!portalPlaced) {
    const x = Math.floor(Math.random() * 3) + (GRID_SIZE - 4);
    const y = Math.floor(Math.random() * 3) + (GRID_SIZE - 4);
    
    if (grid[y][x] === 'floor') {
      grid[y][x] = 'portal';
      portalPlaced = true;
    } else {
      // Force create portal space if needed
      grid[y][x] = 'portal';
      portalPlaced = true;
    }
  }

  return {
    grid,
    playerStart,
    treasureCount,
  };
};