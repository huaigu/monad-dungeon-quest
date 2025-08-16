import { DungeonGrid } from '@/components/DungeonGrid';
import { GameUI } from '@/components/GameUI';
import { useGameState } from '@/hooks/useGameState';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useWallet } from '@/hooks/useWallet';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEffect } from 'react';
import { formatAddress, formatBalance } from '@/utils/wallet';
import { ArrowLeft, Wallet } from 'lucide-react';

const Index = () => {
  const { gameState, movePlayer, resetGame, activatePortal } = useGameState();
  const wallet = useWallet();
  const navigate = useNavigate();

  // 检查钱包状态，如果不满足游戏条件则重定向到主页
  useEffect(() => {
    // 在开发环境下，只要有钱包连接就允许进入游戏
    if (import.meta.env.DEV) {
      if (!wallet.isConnected) {
        navigate('/');
      }
    } else {
      // 生产环境需要满足余额要求
      if (!wallet.isConnected || !wallet.hasMinimumBalance) {
        navigate('/');
      }
    }
  }, [wallet.isConnected, wallet.hasMinimumBalance, navigate]);

  useKeyboard({
    onMove: movePlayer,
    onActivatePortal: activatePortal,
    enabled: !gameState.gameWon && (
      import.meta.env.DEV 
        ? wallet.isConnected 
        : wallet.walletStatus === 'ready'
    ),
  });

  // 如果钱包状态不满足游戏条件，显示警告
  const shouldShowWarning = import.meta.env.DEV 
    ? !wallet.isConnected 
    : (!wallet.isConnected || !wallet.hasMinimumBalance);
    
  if (shouldShowWarning) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="max-w-md mx-auto">
          <Alert className="nes-container is-error">
            <AlertDescription className="nes-text">
              请先设置钱包并充值足够的 MON 代币后再开始游戏。
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button
              onClick={() => navigate('/')}
              className="nes-btn is-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回设置钱包
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
            {/* Wallet Info */}
            <div className="nes-container is-dark with-title">
              <p className="title text-white">钱包信息</p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Wallet className="w-3 h-3" />
                  <span className="nes-text">{formatAddress(wallet.address || '')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="nes-text">余额:</span>
                  <span className="nes-text text-yellow-400">
                    {formatBalance(wallet.balance)} MON
                  </span>
                </div>
                <div className="text-center">
                  <Button
                    onClick={() => navigate('/')}
                    variant="outline"
                    size="sm"
                    className="nes-btn is-small w-full"
                  >
                    返回钱包设置
                  </Button>
                </div>
              </div>
            </div>

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