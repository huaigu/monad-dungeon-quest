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
              <p className="title text-white">图例</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="nes-legend-item">
                  <div className="w-4 h-4 bg-green-400 border border-white rounded-sm"></div>
                  <span className="nes-text">玩家</span>
                </div>
                <div className="nes-legend-item">
                  <div className="w-4 h-4 bg-gradient-to-br from-yellow-300 to-yellow-500 border border-yellow-400 rounded-sm flex items-center justify-center">
                    <span className="text-xs">◆</span>
                  </div>
                  <span className="nes-text">宝物</span>
                </div>
                <div className="nes-legend-item">
                  <div className="w-4 h-4 bg-gradient-to-br from-purple-400 to-purple-600 border border-purple-400 rounded-sm flex items-center justify-center">
                    <span className="text-xs text-white">⌂</span>
                  </div>
                  <span className="nes-text">传送门</span>
                </div>
                <div className="nes-legend-item">
                  <div className="w-4 h-4 bg-gradient-to-br from-gray-600 to-gray-800 border border-gray-500 rounded-sm"></div>
                  <span className="nes-text">墙壁</span>
                </div>
              </div>
            </div>
            
            {/* Instructions */}
            <div className="nes-container is-dark with-title">
              <p className="title text-white">游戏说明</p>
              <ul className="text-xs space-y-1">
                <li className="nes-text">• 使用 WASD 或方向键移动</li>
                <li className="nes-text">• 收集每层的所有宝物</li>
                <li className="nes-text">• 找到传送门进入下一层</li>
                <li className="nes-text">• 完成全部10层获得胜利!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;