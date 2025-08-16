#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 常量定义
const GRID_SIZE = 10;
const TOTAL_LEVELS = 10;
const MIN_TREASURES = 2;
const MAX_TREASURES = 3;
const MIN_CHESTS = 1;
const MAX_CHESTS = 2;

// 钻石设置
const TREASURE_DIAMONDS = 1;  // 宝物固定钻石数
const MIN_CHEST_DIAMONDS = 0; // 宝箱最小钻石数
const MAX_CHEST_DIAMONDS = 10; // 宝箱最大钻石数

// 数字编码
const CELL_TYPES = {
  FLOOR: 0,      // 可移动地块
  WALL: 1,       // 墙壁
  TREASURE: 2,   // 钻石/宝物 (固定1颗钻石)
  PORTAL: 3,     // 传送门
  PLAYER: 4,     // 人物初始位置
  CHEST: 5       // 宝箱 (随机0-10颗钻石)
};

/**
 * 生成随机宝箱钻石数
 */
function generateChestDiamonds() {
  return Math.floor(Math.random() * (MAX_CHEST_DIAMONDS - MIN_CHEST_DIAMONDS + 1)) + MIN_CHEST_DIAMONDS;
}

/**
 * 创建一个填满墙壁的网格
 */
function createEmptyGrid() {
  return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(CELL_TYPES.WALL));
}

/**
 * 获取相邻的有效坐标
 */
function getNeighbors(x, y) {
  const neighbors = [];
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  
  for (const [dx, dy] of directions) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
      neighbors.push([nx, ny]);
    }
  }
  
  return neighbors;
}

/**
 * 使用BFS检查从起点到目标点是否可达
 */
function isReachable(grid, start, target) {
  if (grid[start[1]][start[0]] === CELL_TYPES.WALL || 
      grid[target[1]][target[0]] === CELL_TYPES.WALL) {
    return false;
  }

  const visited = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
  const queue = [start];
  visited[start[1]][start[0]] = true;

  while (queue.length > 0) {
    const [x, y] = queue.shift();
    
    if (x === target[0] && y === target[1]) {
      return true;
    }

    for (const [nx, ny] of getNeighbors(x, y)) {
      if (!visited[ny][nx] && grid[ny][nx] !== CELL_TYPES.WALL) {
        visited[ny][nx] = true;
        queue.push([nx, ny]);
      }
    }
  }

  return false;
}

/**
 * 检查所有重要位置之间的可达性
 */
function validateReachability(grid, playerStart, treasures, chests, portal) {
  // 检查玩家起始位置到传送门的可达性
  if (!isReachable(grid, playerStart, portal)) {
    return false;
  }

  // 检查玩家起始位置到所有宝物的可达性
  for (const treasure of treasures) {
    if (!isReachable(grid, playerStart, treasure)) {
      return false;
    }
  }

  // 检查玩家起始位置到所有宝箱的可达性
  for (const chest of chests) {
    if (!isReachable(grid, playerStart, chest.position)) {
      return false;
    }
  }

  return true;
}

/**
 * 生成基础地牢布局
 */
function generateBasicLayout(levelNumber) {
  const grid = createEmptyGrid();
  
  // 创建房间结构 - 在边界留1格墙壁
  for (let y = 1; y < GRID_SIZE - 1; y++) {
    for (let x = 1; x < GRID_SIZE - 1; x++) {
      // 根据关卡增加开放度
      const openChance = Math.min(0.65 + (levelNumber * 0.03), 0.85);
      if (Math.random() < openChance) {
        grid[y][x] = CELL_TYPES.FLOOR;
      }
    }
  }

  // 确保一些连通路径
  const pathCount = 2 + Math.floor(levelNumber / 3);
  for (let i = 0; i < pathCount; i++) {
    const x = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
    const y = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
    
    // 创建十字形路径确保连通性
    grid[y][x] = CELL_TYPES.FLOOR;
    for (const [nx, ny] of getNeighbors(x, y)) {
      if (nx > 0 && nx < GRID_SIZE - 1 && ny > 0 && ny < GRID_SIZE - 1) {
        grid[ny][nx] = CELL_TYPES.FLOOR;
      }
    }
  }

  return grid;
}

/**
 * 生成单个关卡数据
 */
function generateLevel(levelNumber) {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    attempts++;
    
    // 生成基础布局
    const grid = generateBasicLayout(levelNumber);
    
    // 确定玩家起始位置 (左上区域)
    let playerStart;
    let playerPlaced = false;
    
    for (let y = 1; y < Math.min(4, GRID_SIZE - 1) && !playerPlaced; y++) {
      for (let x = 1; x < Math.min(4, GRID_SIZE - 1) && !playerPlaced; x++) {
        if (grid[y][x] === CELL_TYPES.FLOOR) {
          playerStart = [x, y];
          playerPlaced = true;
        }
      }
    }
    
    if (!playerPlaced) {
      // 强制创建玩家位置
      playerStart = [1, 1];
      grid[1][1] = CELL_TYPES.FLOOR;
    }

    // 放置传送门 (右下区域)
    let portal;
    let portalPlaced = false;
    
    for (let y = Math.max(GRID_SIZE - 4, 1); y < GRID_SIZE - 1 && !portalPlaced; y++) {
      for (let x = Math.max(GRID_SIZE - 4, 1); x < GRID_SIZE - 1 && !portalPlaced; x++) {
        if (grid[y][x] === CELL_TYPES.FLOOR && 
            (x !== playerStart[0] || y !== playerStart[1])) {
          portal = [x, y];
          portalPlaced = true;
        }
      }
    }
    
    if (!portalPlaced) {
      // 强制创建传送门位置
      portal = [GRID_SIZE - 2, GRID_SIZE - 2];
      grid[GRID_SIZE - 2][GRID_SIZE - 2] = CELL_TYPES.FLOOR;
    }

    // 放置宝物
    const treasureCount = MIN_TREASURES + Math.floor(Math.random() * (MAX_TREASURES - MIN_TREASURES + 1));
    const treasures = [];
    const availablePositions = [];
    
    // 收集所有可用位置
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (grid[y][x] === CELL_TYPES.FLOOR && 
            (x !== playerStart[0] || y !== playerStart[1]) &&
            (x !== portal[0] || y !== portal[1])) {
          availablePositions.push([x, y]);
        }
      }
    }
    
    // 随机选择宝物位置
    if (availablePositions.length >= treasureCount) {
      for (let i = 0; i < treasureCount; i++) {
        const randomIndex = Math.floor(Math.random() * availablePositions.length);
        const [x, y] = availablePositions.splice(randomIndex, 1)[0];
        treasures.push([x, y]);
      }
    } else {
      continue; // 重新生成
    }

    // 放置宝箱
    const chestCount = MIN_CHESTS + Math.floor(Math.random() * (MAX_CHESTS - MIN_CHESTS + 1));
    const chests = [];
    
    // 宝箱从剩余可用位置中选择
    if (availablePositions.length >= chestCount) {
      for (let i = 0; i < chestCount; i++) {
        const randomIndex = Math.floor(Math.random() * availablePositions.length);
        const [x, y] = availablePositions.splice(randomIndex, 1)[0];
        chests.push({
          position: [x, y],
          score: generateChestDiamonds()
        });
      }
    }

    // 验证可达性
    if (validateReachability(grid, playerStart, treasures, chests, portal)) {
      // 在网格中标记特殊位置
      grid[playerStart[1]][playerStart[0]] = CELL_TYPES.PLAYER;
      grid[portal[1]][portal[0]] = CELL_TYPES.PORTAL;
      
      for (const [x, y] of treasures) {
        grid[y][x] = CELL_TYPES.TREASURE;
      }
      
      for (const chest of chests) {
        const [x, y] = chest.position;
        grid[y][x] = CELL_TYPES.CHEST;
      }

      // 转换为一维数组
      const flatGrid = [];
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          flatGrid.push(grid[y][x]);
        }
      }

      return {
        level: levelNumber,
        grid: flatGrid,
        playerStart: { x: playerStart[0], y: playerStart[1] },
        portal: { x: portal[0], y: portal[1] },
        treasures: treasures.map(([x, y]) => ({ x, y, score: TREASURE_DIAMONDS })),
        treasureCount: treasureCount,
        chests: chests.map(chest => ({
          x: chest.position[0],
          y: chest.position[1],
          score: chest.score
        })),
        chestCount: chestCount
      };
    }
  }

  throw new Error(`无法为第 ${levelNumber} 关生成有效的地牢布局`);
}

/**
 * 生成所有关卡数据
 */
function generateAllLevels() {
  console.log('开始生成地牢数据...');
  
  const dungeonData = {
    metadata: {
      gridSize: GRID_SIZE,
      totalLevels: TOTAL_LEVELS,
      cellTypes: {
        floor: CELL_TYPES.FLOOR,
        wall: CELL_TYPES.WALL,
        treasure: CELL_TYPES.TREASURE,
        portal: CELL_TYPES.PORTAL,
        player: CELL_TYPES.PLAYER,
        chest: CELL_TYPES.CHEST
      },
      rewards: {
        treasureDiamonds: TREASURE_DIAMONDS,
        chestDiamondsRange: {
          min: MIN_CHEST_DIAMONDS,
          max: MAX_CHEST_DIAMONDS
        }
      },
      generated: new Date().toISOString()
    },
    levels: []
  };

  for (let i = 1; i <= TOTAL_LEVELS; i++) {
    console.log(`生成第 ${i} 关...`);
    try {
      const levelData = generateLevel(i);
      dungeonData.levels.push(levelData);
      console.log(`第 ${i} 关生成成功 (宝物: ${levelData.treasureCount}个, 宝箱: ${levelData.chestCount}个)`);
    } catch (error) {
      console.error(`第 ${i} 关生成失败:`, error.message);
      process.exit(1);
    }
  }

  return dungeonData;
}

/**
 * 主函数
 */
function main() {
  try {
    const dungeonData = generateAllLevels();
    
    // 确保 public 目录存在
    const publicDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // 写入文件
    const outputPath = path.join(publicDir, 'dungeonData.json');
    fs.writeFileSync(outputPath, JSON.stringify(dungeonData, null, 2), 'utf8');
    
    console.log('\n✅ 地牢数据生成完成!');
    console.log(`📁 文件位置: ${outputPath}`);
    console.log(`📊 总关卡数: ${dungeonData.levels.length}`);
    console.log(`🏗️  网格大小: ${GRID_SIZE}x${GRID_SIZE}`);
    
    // 显示统计信息
    console.log('\n📈 关卡统计:');
    dungeonData.levels.forEach(level => {
      const chestDiamonds = level.chests.map(c => c.score).join(', ');
      console.log(`   第${level.level}关: ${level.treasureCount}个宝物(${TREASURE_DIAMONDS}颗钻石), ${level.chestCount}个宝箱(${chestDiamonds}颗钻石)`);
    });
    
  } catch (error) {
    console.error('❌ 生成失败:', error.message);
    process.exit(1);
  }
}

// 运行脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  generateLevel,
  generateAllLevels,
  CELL_TYPES
};