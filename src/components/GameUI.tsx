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
        <p className="title text-white">MONAD DUNGEON</p>
        <div className="text-center">
          <p className="nes-text is-primary text-sm mb-2">
            Collect treasures and find portals!
          </p>
        </div>
      </div>
      
      {/* Game Stats */}
      <div className="nes-container is-dark">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="nes-text">LEVEL:</span>
              <span className="nes-text is-warning">
                {gameState.currentLevel}/10
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="nes-text">STEPS:</span>
              <span className="nes-text is-primary">
                {gameState.steps}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="nes-text">TREASURE:</span>
              <span className="nes-text is-success">
                {gameState.treasuresCollected}/{gameState.totalTreasures}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="nes-text">STATUS:</span>
              <span className={`nes-text ${
                gameState.gameWon 
                  ? 'is-success' 
                  : gameState.treasuresCollected === gameState.totalTreasures
                    ? 'is-warning'
                    : 'is-disabled'
              }`}>
                {gameState.gameWon 
                  ? 'WON!' 
                  : gameState.treasuresCollected === gameState.totalTreasures
                    ? 'READY!'
                    : 'EXPLORE'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="nes-container is-dark">
        <div className="text-center space-y-3">
          <p className="nes-text text-xs">
            CONTROLS: WASD or ARROW KEYS
          </p>
          <button 
            className="nes-btn is-error"
            onClick={onReset}
          >
            RESET GAME
          </button>
        </div>
      </div>

      {/* Victory Screen */}
      {gameState.gameWon && (
        <div className="nes-container is-dark">
          <div className="text-center">
            <p className="nes-text is-success mb-2">
              🎉 VICTORY! 🎉
            </p>
            <p className="nes-text text-xs">
              Completed in {gameState.steps} steps!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};