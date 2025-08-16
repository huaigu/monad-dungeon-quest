import { useState, useCallback, useEffect } from 'react';
import { GameState, Player, Cell, CellType } from '@/types/game';
import { generateLevel } from '@/utils/levelGenerator';
import { toast } from 'sonner';

const GRID_SIZE = 10;
const MAX_LEVELS = 10;

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const level = generateLevel(1);
    return {
      currentLevel: 1,
      player: level.playerStart,
      steps: 0,
      treasuresCollected: 0,
      totalTreasures: level.treasureCount,
      dungeonGrid: level.grid.map((row, y) =>
        row.map((cellType, x) => ({
          type: cellType,
          x,
          y,
          hasPlayer: x === level.playerStart.x && y === level.playerStart.y,
          treasureCollected: false,
        }))
      ),
      gameWon: false,
      isMoving: false,
    };
  });

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
      let newSteps = prev.steps + 1;
      
      // Collect treasure
      if (targetCell.type === 'treasure' && !targetCell.treasureCollected) {
        newGrid[newPlayer.y][newPlayer.x].treasureCollected = true;
        newTreasuresCollected++;
        toast.success(`Treasure collected! (${newTreasuresCollected}/${prev.totalTreasures})`);
      }

      // Check portal
      if (targetCell.type === 'portal') {
        if (newTreasuresCollected === prev.totalTreasures) {
          // Can advance to next level
          const nextLevel = prev.currentLevel + 1;
          if (nextLevel > MAX_LEVELS) {
            toast.success('🎉 Congratulations! You completed Monad Dungeon!');
            return {
              ...prev,
              gameWon: true,
              player: newPlayer,
              steps: newSteps,
              treasuresCollected: newTreasuresCollected,
              dungeonGrid: newGrid,
            };
          } else {
            // Generate next level
            const level = generateLevel(nextLevel);
            toast.success(`Level ${nextLevel} unlocked!`);
            return {
              currentLevel: nextLevel,
              player: level.playerStart,
              steps: newSteps,
              treasuresCollected: 0,
              totalTreasures: level.treasureCount,
              dungeonGrid: level.grid.map((row, y) =>
                row.map((cellType, x) => ({
                  type: cellType,
                  x,
                  y,
                  hasPlayer: x === level.playerStart.x && y === level.playerStart.y,
                  treasureCollected: false,
                }))
              ),
              gameWon: false,
              isMoving: false,
            };
          }
        } else {
          toast.warning(`Collect all treasures first! (${newTreasuresCollected}/${prev.totalTreasures})`);
        }
      }

      return {
        ...prev,
        player: newPlayer,
        steps: newSteps,
        treasuresCollected: newTreasuresCollected,
        dungeonGrid: newGrid,
      };
    });
  }, [gameState.isMoving, gameState.gameWon]);

  const resetGame = useCallback(() => {
    const level = generateLevel(1);
    setGameState({
      currentLevel: 1,
      player: level.playerStart,
      steps: 0,
      treasuresCollected: 0,
      totalTreasures: level.treasureCount,
      dungeonGrid: level.grid.map((row, y) =>
        row.map((cellType, x) => ({
          type: cellType,
          x,
          y,
          hasPlayer: x === level.playerStart.x && y === level.playerStart.y,
          treasureCollected: false,
        }))
      ),
      gameWon: false,
      isMoving: false,
    });
    toast.success('Game reset!');
  }, []);

  return {
    gameState,
    movePlayer,
    resetGame,
  };
};