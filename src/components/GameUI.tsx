import { GameState } from '@/types/game';
import { Button } from '@/components/ui/button';

interface GameUIProps {
  gameState: GameState;
  onReset: () => void;
}

export const GameUI = ({ gameState, onReset }: GameUIProps) => {
  return (
    <div className="space-y-4">
      {/* Game Title */}
      <div className="nes-container is-dark with-title">
        <p className="title text-white">魔纳地牢</p>
        <div className="text-center">
          <p className="nes-text is-primary text-sm mb-2">
            收集宝物，找到传送门！
          </p>
        </div>
      </div>
      
      {/* Game Stats */}
      <div className="nes-container is-dark">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="nes-text">层数:</span>
              <span className="nes-text is-warning">
                {gameState.currentLevel}/10
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="nes-text">步数:</span>
              <span className="nes-text is-primary">
                {gameState.steps}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="nes-text">宝物:</span>
              <span className="nes-text is-success">
                {gameState.treasuresCollected}/{gameState.totalTreasures}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="nes-text">宝箱:</span>
              <span className="nes-text is-warning">
                {gameState.chestsCollected}/{gameState.totalChests}
              </span>
            </div>
          </div>
          
          <div className="col-span-2 space-y-2">
            <div className="flex justify-between items-center">
              <span className="nes-text">积分:</span>
              <span className="nes-text is-primary">
                {gameState.totalDiamonds * 3}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="nes-text">状态:</span>
              <span className={`nes-text ${
                gameState.gameWon 
                  ? 'is-success' 
                  : gameState.isOnPortal
                    ? 'is-warning'
                    : 'is-disabled'
              }`}>
                {gameState.gameWon 
                  ? '胜利!' 
                  : gameState.isOnPortal
                    ? '按空格进入'
                    : '探索中'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Victory Screen */}
      {gameState.gameWon && (
        <div className="nes-container is-dark">
          <div className="text-center">
            <p className="nes-text is-success mb-2">
              🎉 胜利! 🎉
            </p>
            <p className="nes-text text-xs">
              用时 {gameState.steps} 步完成!
            </p>
            <p className="nes-text text-xs">
              总积分: {gameState.totalDiamonds * 3}分
            </p>
          </div>
        </div>
      )}
    </div>
  );
};