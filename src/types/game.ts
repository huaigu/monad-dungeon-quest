export type CellType = 'wall' | 'floor' | 'treasure' | 'portal' | 'chest';

export interface Cell {
  type: CellType;
  x: number;
  y: number;
  hasPlayer?: boolean;
  treasureCollected?: boolean;
  chestCollected?: boolean;
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
  chestsCollected: number;
  totalChests: number;
  totalDiamonds: number; // 收集到的钻石总数
  dungeonGrid: Cell[][];
  gameWon: boolean;
  isMoving: boolean;
  isOnPortal: boolean; // 玩家是否在传送门位置
}

export interface LevelData {
  grid: CellType[][];
  playerStart: { x: number; y: number };
  treasureCount: number;
}

export interface DungeonTreasure {
  x: number;
  y: number;
  diamonds: number; // 每个宝物固定1颗钻石
}

export interface DungeonChest {
  x: number;
  y: number;
  diamonds: number; // 宝箱开出的钻石数量（0-10颗）
}

export interface DungeonLevel {
  level: number;
  grid: number[];
  playerStart: { x: number; y: number };
  portal: { x: number; y: number };
  treasures: DungeonTreasure[];
  treasureCount: number;
  chests: DungeonChest[];
  chestCount: number;
}

export interface DungeonData {
  metadata: {
    gridSize: number;
    totalLevels: number;
    cellTypes: Record<string, number>;
    rewards: {
      treasureDiamonds: number; // 宝物固定钻石数
      chestDiamondsRange: {
        min: number;
        max: number;
      };
    };
    generated: string;
  };
  levels: DungeonLevel[];
}