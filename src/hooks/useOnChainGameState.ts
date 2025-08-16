import { useState, useCallback, useEffect } from 'react';
import { GameState, Player, Cell, CellType, DungeonLevel } from '@/types/game';
import { getLevelData, convertGridToCells, calculateLevelDiamonds } from '@/utils/dungeonLoader';
import { toast } from 'sonner';
import { useGameContract, Direction, PlayerState } from './useGameContract';
import { loadWalletFromStorage } from '@/utils/wallet';

const GRID_SIZE = 10;
const MAX_LEVELS = 10;

// 将字符串方向转换为合约枚举
const directionToEnum = (direction: 'up' | 'down' | 'left' | 'right'): Direction => {
  switch (direction) {
    case 'up': return Direction.Up;
    case 'down': return Direction.Down;
    case 'left': return Direction.Left;
    case 'right': return Direction.Right;
  }
};

export const useOnChainGameState = () => {
  const gameContract = useGameContract();
  
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
  const [isOnChain] = useState(true); // 永远使用链上模式
  const [playerState, setPlayerState] = useState<PlayerState | null>(null); // 链上玩家状态
  const [gameStarted, setGameStarted] = useState(false); // 游戏是否已开始
  const [playerStateLoaded, setPlayerStateLoaded] = useState(false); // 玩家状态是否已加载

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

  // 初始化游戏（只在组件挂载时执行一次）
  useEffect(() => {
    let mounted = true; // 防止组件卸载后继续执行
    
    const initializeGame = async () => {
      try {
        const walletInfo = loadWalletFromStorage();
        if (!walletInfo) {
          console.error('未找到钱包信息');
          if (mounted) await loadLevel(1);
          return;
        }

        const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
        if (!contractAddress) {
          console.error('合约地址未配置');
          if (mounted) await loadLevel(1);
          return;
        }

        console.log('使用合约地址:', contractAddress);
        
        const playerData = await gameContract.getPlayer(walletInfo.address);
        
        if (!mounted) return; // 组件已卸载，不更新状态
        
        console.log('加载到的玩家状态:', playerData);
        setPlayerState(playerData);
        setPlayerStateLoaded(true);
        setGameStarted(playerData.started);

        // 如果游戏已开始，加载相应关卡
        if (playerData.started && playerData.level > 0) {
          await loadLevel(playerData.level);
          
          if (mounted) {
            // 使用setTimeout确保在loadLevel完成后同步数据
            setTimeout(() => {
              if (mounted) {
                // 同步玩家位置和数据到本地状态（在loadLevel之后，确保覆盖关卡默认数据）
                setGameState(prev => {
                  // 更新dungeonGrid中的玩家位置
                  const newGrid = prev.dungeonGrid.map(row =>
                    row.map(cell => ({
                      ...cell,
                      hasPlayer: cell.x === playerData.x && cell.y === playerData.y,
                    }))
                  );

                  return {
                    ...prev,
                    currentLevel: playerData.level,
                    player: { x: playerData.x, y: playerData.y }, // 使用链上实际位置覆盖关卡起始位置
                    steps: playerData.steps,
                    totalDiamonds: playerData.gems,
                    dungeonGrid: newGrid, // 更新网格中的玩家位置
                    // 宝物和宝箱收集状态保持关卡默认值，因为每次加载关卡都会重置
                    // 这确保游戏逻辑的一致性
                  };
                });
              }
            }, 100);
          }
        } else {
          // 游戏未开始，加载第一关
          if (mounted) await loadLevel(1);
        }
      } catch (error) {
        console.error('初始化游戏失败:', error);
        // 如果加载失败，标记为未加载状态，显示开始游戏按钮
        if (mounted) {
          setPlayerStateLoaded(false);
          setPlayerState(null);
          setGameStarted(false);
          await loadLevel(1);
        }
      }
    };

    initializeGame();

    // 清理函数
    return () => {
      mounted = false;
    };
  }, []); // 空依赖数组，只在挂载时执行一次

  // 验证移动是否有效
  const isValidMove = useCallback((direction: 'up' | 'down' | 'left' | 'right'): boolean => {
    const currentPlayer = gameState.player;
    let targetX = currentPlayer.x;
    let targetY = currentPlayer.y;

    // 计算目标位置
    switch (direction) {
      case 'up':
        targetY = Math.max(0, currentPlayer.y - 1);
        break;
      case 'down':
        targetY = Math.min(GRID_SIZE - 1, currentPlayer.y + 1);
        break;
      case 'left':
        targetX = Math.max(0, currentPlayer.x - 1);
        break;
      case 'right':
        targetX = Math.min(GRID_SIZE - 1, currentPlayer.x + 1);
        break;
    }

    // 检查是否移动到了边界外（实际上没有移动）
    if (targetX === currentPlayer.x && targetY === currentPlayer.y) {
      return false;
    }

    // 检查目标位置是否在网格范围内
    if (targetY < 0 || targetY >= gameState.dungeonGrid.length || 
        targetX < 0 || targetX >= gameState.dungeonGrid[0].length) {
      return false;
    }

    // 检查目标位置是否是墙
    const targetCell = gameState.dungeonGrid[targetY][targetX];
    if (targetCell.type === 'wall') {
      return false;
    }

    return true;
  }, [gameState.player, gameState.dungeonGrid]);

  // 更新本地游戏状态
  const updateLocalGameState = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
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
        
        // 宝物固定获得1颗钻石（3积分）
        newTotalDiamonds += 1;
        toast.success(`宝物收集! +3积分 (${newTreasuresCollected}/${prev.totalTreasures})`);
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
            toast.success(`宝箱开启! +${diamonds * 3}积分 (${newChestsCollected}/${prev.totalChests})`);
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
  }, [currentLevelData]);

  // 链上移动玩家
  const movePlayerOnChain = useCallback(async (direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameState.isMoving || gameState.gameWon || gameContract.isProcessing) {
      return;
    }

    // 本地验证移动是否有效，如果无效则不发送交易
    if (!isValidMove(direction)) {
      console.log('移动无效，不发送交易:', direction);
      toast.warning('无法移动到该位置');
      return;
    }

    // 设置移动状态
    setGameState(prev => ({ ...prev, isMoving: true }));

    try {
      // 调用合约的step方法
      const contractDirection = directionToEnum(direction);
      await gameContract.step(contractDirection);
      
      // 先乐观更新本地状态，提供即时反馈
      updateLocalGameState(direction);
      
      // 延迟从合约获取最新状态，确保链上状态同步完成
      setTimeout(async () => {
        try {
          const walletInfo = loadWalletFromStorage();
          if (walletInfo) {
            const updatedPlayerData = await gameContract.getPlayer(walletInfo.address);
            setPlayerState(updatedPlayerData);
            
            // 用链上的真实数据覆盖本地状态，确保数据一致性
            setGameState(prev => {
              const newGrid = prev.dungeonGrid.map(row =>
                row.map(cell => ({
                  ...cell,
                  hasPlayer: cell.x === updatedPlayerData.x && cell.y === updatedPlayerData.y,
                }))
              );

              return {
                ...prev,
                player: { x: updatedPlayerData.x, y: updatedPlayerData.y },
                steps: updatedPlayerData.steps,
                totalDiamonds: updatedPlayerData.gems,
                dungeonGrid: newGrid,
              };
            });
          }
        } catch (syncError) {
          console.error('同步玩家状态失败:', syncError);
        }
      }, 500); // 给链上处理一些时间
      
      toast.success('移动成功！');
    } catch (error) {
      console.error('链上移动失败:', error);
      // 移动失败，不更新本地状态
    } finally {
      setGameState(prev => ({ ...prev, isMoving: false }));
    }
  }, [gameState.isMoving, gameState.gameWon, gameContract, updateLocalGameState, isValidMove]);

  // 手动开始游戏
  const startGameManually = useCallback(async () => {
    try {
      await gameContract.startGame(1);
      toast.success('游戏开始！');
      
      // 手动更新状态，无需重新加载
      setGameStarted(true);
      setPlayerState(prev => prev ? { ...prev, started: true, level: 1 } : null);
    } catch (error) {
      console.error('开始游戏失败:', error);
      toast.error('开始游戏失败');
    }
  }, [gameContract]);

  // 移动玩家（只支持链上模式）
  const movePlayer = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!gameStarted) {
      toast.warning('请先开始游戏！');
      return Promise.resolve();
    }
    return movePlayerOnChain(direction);
  }, [movePlayerOnChain, gameStarted]);

  // 激活传送门
  const activatePortal = useCallback(async () => {
    if (!gameState.isOnPortal) {
      toast.warning("需要站在传送门上才能使用");
      return;
    }

    if (gameState.currentLevel >= MAX_LEVELS) {
      setGameState(prev => ({ ...prev, gameWon: true }));
      toast.success("恭喜！你完成了所有关卡！");
      return;
    }

    const nextLevel = gameState.currentLevel + 1;
    await loadLevel(nextLevel);
    
    // 总是使用链上模式，需要重新开始游戏
    try {
      await gameContract.startGame(nextLevel);
      toast.success(`进入第 ${nextLevel} 关！`);
    } catch (error) {
      console.error('开始下一关失败:', error);
      toast.error('开始下一关失败');
    }
  }, [gameState, loadLevel, gameContract]);

  // 重置游戏
  const resetGame = useCallback(async () => {
    loadLevel(1);
    setGameState(prev => ({
      ...prev,
      steps: 0,
      totalDiamonds: 0,
      gameWon: false,
      isMoving: false,
    }));
    
    // 重新开始链上游戏
    try {
      await gameContract.startGame(1);
      console.log('重置后链上游戏重新启动成功');
    } catch (error) {
      console.error('重置后重新启动链上游戏失败:', error);
    }
  }, [loadLevel, gameContract]);

  return {
    gameState: {
      ...gameState,
      isMoving: gameState.isMoving || gameContract.isProcessing, // 包含链上处理状态
    },
    movePlayer,
    resetGame,
    activatePortal,
    isOnChain, // 总是为 true
    gameContract, // 暴露游戏合约状态
    playerState, // 链上玩家状态
    gameStarted, // 游戏是否已开始
    playerStateLoaded, // 玩家状态是否已加载
    startGameManually, // 手动开始游戏
  };
};