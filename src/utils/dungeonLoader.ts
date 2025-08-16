import { DungeonData, DungeonLevel, Cell, CellType } from '@/types/game';

// 数字到单元格类型的映射
const CELL_TYPE_MAP: Record<number, CellType> = {
  0: 'floor',
  1: 'wall',
  2: 'treasure',
  3: 'portal',
  4: 'floor', // 玩家起始位置在数据中是4，但渲染时是floor
  5: 'chest'
};

let dungeonDataCache: DungeonData | null = null;

/**
 * 加载地牢数据
 */
export async function loadDungeonData(): Promise<DungeonData> {
  if (dungeonDataCache) {
    return dungeonDataCache;
  }

  try {
    const response = await fetch('/dungeonData.json');
    if (!response.ok) {
      throw new Error('Failed to load dungeon data');
    }
    dungeonDataCache = await response.json();
    return dungeonDataCache;
  } catch (error) {
    console.error('Error loading dungeon data:', error);
    throw error;
  }
}

/**
 * 获取指定关卡的数据
 */
export async function getLevelData(levelNumber: number): Promise<DungeonLevel | null> {
  const dungeonData = await loadDungeonData();
  return dungeonData.levels.find(level => level.level === levelNumber) || null;
}

/**
 * 将一维网格数据转换为二维单元格数组
 */
export function convertGridToCells(
  flatGrid: number[], 
  gridSize: number, 
  playerStart: { x: number; y: number },
  treasures: Array<{ x: number; y: number; score: number }>,
  chests: Array<{ x: number; y: number; score: number }>
): Cell[][] {
  const grid: Cell[][] = [];
  
  // 创建宝物和宝箱的查找映射
  const treasureMap = new Map<string, number>();
  treasures.forEach(treasure => {
    treasureMap.set(`${treasure.x},${treasure.y}`, treasure.score);
  });
  
  const chestMap = new Map<string, number>();
  chests.forEach(chest => {
    chestMap.set(`${chest.x},${chest.y}`, chest.score);
  });

  for (let y = 0; y < gridSize; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < gridSize; x++) {
      const index = y * gridSize + x;
      const cellValue = flatGrid[index];
      const cellType = CELL_TYPE_MAP[cellValue] || 'wall';
      
      const cell: Cell = {
        type: cellType,
        x,
        y,
        hasPlayer: x === playerStart.x && y === playerStart.y,
        treasureCollected: false,
        chestCollected: false
      };

      row.push(cell);
    }
    grid.push(row);
  }

  return grid;
}

/**
 * 计算关卡的总钻石数
 */
export function calculateLevelDiamonds(
  treasures: Array<{ x: number; y: number; score: number }>,
  chests: Array<{ x: number; y: number; score: number }>
): { maxTreasureDiamonds: number; maxChestDiamonds: number; maxTotalDiamonds: number } {
  // 宝物每个固定1颗钻石
  const maxTreasureDiamonds = treasures.length;
  // 宝箱的钻石数等于其score值
  const maxChestDiamonds = chests.reduce((sum, chest) => sum + chest.score, 0);
  const maxTotalDiamonds = maxTreasureDiamonds + maxChestDiamonds;
  
  return { maxTreasureDiamonds, maxChestDiamonds, maxTotalDiamonds };
}