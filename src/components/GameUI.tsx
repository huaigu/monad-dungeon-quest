import { GameState } from '@/types/game';
import { Button } from '@/components/ui/button';

interface GameUIProps {
  gameState: GameState;
  onReset: () => void;
}

export const GameUI = ({ gameState, onReset }: GameUIProps) => {
  return (
    <div className="game-ui space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-game-highlight mb-2">
          MONAD DUNGEON
        </h1>
        <div className="text-sm text-muted-foreground">
          Collect treasures and find the portal to advance!
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Level:</span>
            <span className="text-game-highlight font-bold">
              {gameState.currentLevel}/10
            </span>
          </div>
          <div className="flex justify-between">
            <span>Steps:</span>
            <span className="text-game-warning font-bold">
              {gameState.steps}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Treasures:</span>
            <span className="text-game-success font-bold">
              {gameState.treasuresCollected}/{gameState.totalTreasures}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className={`font-bold ${
              gameState.gameWon 
                ? 'text-game-success' 
                : gameState.treasuresCollected === gameState.totalTreasures
                  ? 'text-accent'
                  : 'text-muted-foreground'
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

      <div className="space-y-2">
        <div className="text-xs text-muted-foreground text-center">
          Controls: WASD or Arrow Keys
        </div>
        <Button 
          onClick={onReset} 
          className="pixel-button w-full"
          variant="secondary"
        >
          RESET GAME
        </Button>
      </div>

      {gameState.gameWon && (
        <div className="text-center p-4 bg-game-success/10 border border-game-success rounded">
          <div className="text-game-success font-bold">
            🎉 VICTORY! 🎉
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Completed in {gameState.steps} steps!
          </div>
        </div>
      )}
    </div>
  );
};