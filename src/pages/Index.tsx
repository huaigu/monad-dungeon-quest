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
                  <div className="w-4 h-4 bg-green-400 border-2 border-white"></div>
                  <span className="nes-text">Player</span>
                </div>
                <div className="nes-legend-item">
                  <span className="text-yellow-400 font-bold">★</span>
                  <span className="nes-text">Treasure</span>
                </div>
                <div className="nes-legend-item">
                  <span className="text-purple-400 font-bold">◉</span>
                  <span className="nes-text">Portal</span>
                </div>
                <div className="nes-legend-item">
                  <span className="text-gray-600 font-bold">█</span>
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