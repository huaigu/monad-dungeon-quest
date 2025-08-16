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
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Game Grid */}
          <div className="flex justify-center">
            <DungeonGrid grid={gameState.dungeonGrid} />
          </div>
          
          {/* Game UI */}
          <div className="space-y-4">
            <GameUI gameState={gameState} onReset={resetGame} />
            
            {/* Legend */}
            <div className="nes-container is-dark with-title">
              <p className="title text-white">LEGEND</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="nes-legend-item">
                  <div className="w-4 h-4 bg-green-400 border border-white rounded-sm"></div>
                  <span className="nes-text">Player</span>
                </div>
                <div className="nes-legend-item">
                  <div className="w-4 h-4 bg-gradient-to-br from-yellow-300 to-yellow-500 border border-yellow-400 rounded-sm flex items-center justify-center">
                    <span className="text-xs">◆</span>
                  </div>
                  <span className="nes-text">Treasure</span>
                </div>
                <div className="nes-legend-item">
                  <div className="w-4 h-4 bg-gradient-to-br from-purple-400 to-purple-600 border border-purple-400 rounded-sm flex items-center justify-center">
                    <span className="text-xs text-white">⌂</span>
                  </div>
                  <span className="nes-text">Portal</span>
                </div>
                <div className="nes-legend-item">
                  <div className="w-4 h-4 bg-gradient-to-br from-gray-600 to-gray-800 border border-gray-500 rounded-sm"></div>
                  <span className="nes-text">Wall</span>
                </div>
              </div>
            </div>
            
            {/* Instructions */}
            <div className="nes-container is-dark with-title">
              <p className="title text-white">INSTRUCTIONS</p>
              <ul className="text-xs space-y-1">
                <li className="nes-text">• Move with WASD or Arrow Keys</li>
                <li className="nes-text">• Collect all treasures in each level</li>
                <li className="nes-text">• Find the portal to advance</li>
                <li className="nes-text">• Complete all 10 levels to win!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;