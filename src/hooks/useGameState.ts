import { useState, useCallback, useEffect } from 'react';
import { GameState, Player, Cell, CellType, DungeonLevel } from '@/types/game';
import { getLevelData, convertGridToCells, calculateLevelDiamonds } from '@/utils/dungeonLoader';
import { toast } from 'sonner';

const GRID_SIZE = 10;
const MAX_LEVELS = 10;

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentLevel: 1,
    player: { x: 1, y: 1 }, // 临时值，会被异步加载的数据覆盖
    steps: 0,
    treasuresCollected: 0,
    totalTreasures: 0,
    chestsCollected: 0,
    totalChests: 0,
    totalDiamonds: 0,
    dungeonGrid: [],
    gameWon: false,
    isMoving: false,
    isOnPortal: false,
  });

  const [currentLevelData, setCurrentLevelData] = useState<DungeonLevel | null>(null);

  // 加载关卡数据的函数
  const loadLevel = useCallback(async (levelNumber: number) => {
    try {
      const levelData = await getLevelData(levelNumber);
      if (!levelData) {
        toast.error(`无法加载第 ${levelNumber} 关数据`);
        return;
      }

      setCurrentLevelData(levelData);

      const dungeonGrid = convertGridToCells(
        levelData.grid,
        GRID_SIZE,
        levelData.playerStart,
        levelData.treasures,
        levelData.chests
      );

      setGameState(prev => ({
        ...prev,
        currentLevel: levelNumber,
        player: levelData.playerStart,
        totalTreasures: levelData.treasureCount,
        totalChests: levelData.chestCount,
        treasuresCollected: 0,
        chestsCollected: 0,
        dungeonGrid,
      }));
    } catch (error) {
      toast.error('加载关卡数据失败');
      console.error('Error loading level data:', error);
    }
  }, []);

  // 初始化第一关
  useEffect(() => {
    loadLevel(1);
  }, [loadLevel]);

  const movePlayer = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameState.isMoving || gameState.gameWon) return;

    setGameState(prev => {
      const newPlayer: Player = { ...prev.player };
      
      switch (direction) {
        case 'up':
          newPlayer.y = Math.max(0, prev.player.y - 1);
          break;
        case 'down':
          newPlayer.y = Math.min(GRID_SIZE - 1, prev.player.y + 1);
          break;
        case 'left':
          newPlayer.x = Math.max(0, prev.player.x - 1);
          break;
        case 'right':
          newPlayer.x = Math.min(GRID_SIZE - 1, prev.player.x + 1);
          break;
      }

      const targetCell = prev.dungeonGrid[newPlayer.y][newPlayer.x];
      
      // Can't move through walls
      if (targetCell.type === 'wall') {
        return prev;
      }

      // Update grid
      const newGrid = prev.dungeonGrid.map(row =>
        row.map(cell => ({
          ...cell,
          hasPlayer: cell.x === newPlayer.x && cell.y === newPlayer.y,
        }))
      );

      let newTreasuresCollected = prev.treasuresCollected;
      let newChestsCollected = prev.chestsCollected;
      let newTotalDiamonds = prev.totalDiamonds;
      const newSteps = prev.steps + 1;
      
      // Collect treasure
      if (targetCell.type === 'treasure' && !targetCell.treasureCollected) {
        newGrid[newPlayer.y][newPlayer.x].treasureCollected = true;
        newTreasuresCollected++;
        
        // 宝物固定获得1颗钻石
        newTotalDiamonds += 1;
        toast.success(`宝物收集! +1颗钻石 (${newTreasuresCollected}/${prev.totalTreasures})`);
      }

      // Collect chest
      if (targetCell.type === 'chest' && !targetCell.chestCollected) {
        newGrid[newPlayer.y][newPlayer.x].chestCollected = true;
        newChestsCollected++;
        
        // 从当前关卡数据中找到对应宝箱的钻石数
        if (currentLevelData) {
          const chest = currentLevelData.chests.find(c => c.x === newPlayer.x && c.y === newPlayer.y);
          if (chest) {
            const diamonds = chest.score; // 使用score作为钻石数量
            newTotalDiamonds += diamonds;
            toast.success(`宝箱开启! +${diamonds}颗钻石 (${newChestsCollected}/${prev.totalChests})`);
          }
        }
      }

      // Check if on portal
      const isOnPortal = targetCell.type === 'portal';
      if (isOnPortal && !prev.isOnPortal) {
        toast.info("按空格键进入传送门");
      }

      return {
        ...prev,
        player: newPlayer,
        steps: newSteps,
        treasuresCollected: newTreasuresCollected,
        chestsCollected: newChestsCollected,
        totalDiamonds: newTotalDiamonds,
        dungeonGrid: newGrid,
        isOnPortal,
      };
    });
  }, [gameState.isMoving, gameState.gameWon, currentLevelData]);

  const activatePortal = useCallback(() => {
    if (!gameState.isOnPortal || gameState.gameWon) return;

    const nextLevel = gameState.currentLevel + 1;
    if (nextLevel > MAX_LEVELS) {
      toast.success("🎉 恭喜! 你完成了魔纳地牢!");
      setGameState(prev => ({
        ...prev,
        gameWon: true,
      }));
    } else {
      toast.success(`第 ${nextLevel} 层解锁!`);
      setTimeout(() => loadLevel(nextLevel), 100);
    }
  }, [gameState.isOnPortal, gameState.gameWon, gameState.currentLevel, loadLevel]);

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      steps: 0,
      treasuresCollected: 0,
      chestsCollected: 0,
      gameWon: false,
      isMoving: false,
      isOnPortal: false,
    }));
    loadLevel(1);
    toast.success("游戏重置!");
  }, [loadLevel]);

  return {
    gameState,
    movePlayer,
    resetGame,
    activatePortal,
  };
};