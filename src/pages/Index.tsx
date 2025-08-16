import { DungeonGrid } from '@/components/DungeonGrid';
import { GameUI } from '@/components/GameUI';
import { useGameState } from '@/hooks/useGameState';
import { useKeyboard } from '@/hooks/useKeyboard';

const Index = () => {
  const { gameState, movePlayer, resetGame } = useGameState();

  useKeyboard({
    onMove: movePlayer,
    enabled: !gameState.gameWon,
  });

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Game Grid */}
          <div className="flex justify-center">
            <div className="p-4 bg-card border border-border rounded-lg">
              <DungeonGrid grid={gameState.dungeonGrid} />
            </div>
          </div>
          
          {/* Game UI */}
          <div className="space-y-4">
            <GameUI gameState={gameState} onReset={resetGame} />
            
            {/* Legend */}
            <div className="game-ui">
              <h3 className="font-bold mb-3 text-game-highlight">LEGEND</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🧙</span>
                  <span>Player</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">💎</span>
                  <span>Treasure</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌀</span>
                  <span>Portal</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">█</span>
                  <span>Wall</span>
                </div>
              </div>
            </div>
            
            {/* Instructions */}
            <div className="game-ui">
              <h3 className="font-bold mb-2 text-game-highlight">HOW TO PLAY</h3>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Move with WASD or Arrow Keys</li>
                <li>• Collect all treasures in each level</li>
                <li>• Find the portal to advance</li>
                <li>• Complete all 10 levels to win!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;