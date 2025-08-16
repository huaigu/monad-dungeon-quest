import { DungeonGrid } from '@/components/DungeonGrid';
import { GameUI } from '@/components/GameUI';
import { useGameState } from '@/hooks/useGameState';
import { useKeyboard } from '@/hooks/useKeyboard';

const Index = () => {
  const { gameState, movePlayer, resetGame, activatePortal } = useGameState();

  useKeyboard({
    onMove: movePlayer,
    onActivatePortal: activatePortal,
    enabled: !gameState.gameWon,
  });

  return (
    <div className="min-h-screen bg-background p-2">
      <div className="max-w-7xl mx-auto">
        <div className="grid xl:grid-cols-3 gap-4 items-start">
          {/* Game Grid - Takes 2/3 of the space */}
          <div className="xl:col-span-2 flex justify-center">
            <DungeonGrid grid={gameState.dungeonGrid} gameState={gameState} />
          </div>
          
          {/* Game UI - Takes 1/3 of the space */}
          <div className="space-y-3">
            <GameUI gameState={gameState} onReset={resetGame} />
            
            {/* Legend */}
            <div className="nes-container is-dark with-title">
              <p className="title text-white">图例</p>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-400 border border-white rounded-sm"></div>
                  <span className="nes-text">玩家</span>
                  <div className="w-4 h-4 bg-gradient-to-br from-yellow-300 to-yellow-500 border border-yellow-400 rounded-sm flex items-center justify-center">
                    <span className="text-xs">◆</span>
                  </div>
                  <span className="nes-text">宝物</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-purple-400 to-purple-600 border border-purple-400 rounded-sm flex items-center justify-center">
                    <span className="text-xs text-white">⌂</span>
                  </div>
                  <span className="nes-text">传送门</span>
                  <div className="w-4 h-4 bg-gradient-to-br from-amber-600 to-amber-800 border border-amber-500 rounded-sm flex items-center justify-center">
                    <span className="text-xs text-white">📦</span>
                  </div>
                  <span className="nes-text">宝箱</span>
                </div>
              </div>
            </div>
            
            {/* Instructions */}
            <div className="nes-container is-dark with-title">
              <p className="title text-white">操作说明</p>
              <div className="text-xs space-y-1">
                <p className="nes-text">移动: WASD/方向键</p>
                <p className="nes-text">传送: 空格键</p>
                <p className="nes-text">目标: 完成10层获胜</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;