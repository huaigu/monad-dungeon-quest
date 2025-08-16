export type CellType = 'wall' | 'floor' | 'treasure' | 'portal';

export interface Cell {
  type: CellType;
  x: number;
  y: number;
  hasPlayer?: boolean;
  treasureCollected?: boolean;
}

export interface Player {
  x: number;
  y: number;
}

export interface GameState {
  currentLevel: number;
  player: Player;
  steps: number;
  treasuresCollected: number;
  totalTreasures: number;
  dungeonGrid: Cell[][];
  gameWon: boolean;
  isMoving: boolean;
}

export interface LevelData {
  grid: CellType[][];
  playerStart: { x: number; y: number };
  treasureCount: number;
}