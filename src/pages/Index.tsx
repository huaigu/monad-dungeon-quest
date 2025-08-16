import { DungeonGrid } from '@/components/DungeonGrid';
import { GameUI } from '@/components/GameUI';
import { WalletDisplay, WalletDisplayRef } from '@/components/WalletDisplay';
import { useOnChainGameState } from '@/hooks/useOnChainGameState';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useWallet } from '@/hooks/useWallet';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Link } from 'lucide-react';

const Index = () => {
  const { gameState, movePlayer, resetGame, activatePortal, isOnChain, gameContract, playerState, gameStarted, playerStateLoaded, startGameManually } = useOnChainGameState();
  const wallet = useWallet();
  const navigate = useNavigate();
  const walletDisplayRef = useRef<WalletDisplayRef>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // 跟踪是否为首次加载

  // 检查钱包状态，如果不满足游戏条件则重定向到主页
  useEffect(() => {
    // 如果钱包还在加载中，等待加载完成
    if (wallet.isLoading) {
      return;
    }
    
    // 钱包加载完成，标记不再是初始加载状态
    if (isInitialLoad && !wallet.isLoading) {
      setIsInitialLoad(false);
    }
    
    // 如果钱包未连接，重定向到主页
    if (!wallet.isConnected) {
      navigate('/');
      return;
    }
    
    // 如果钱包已连接但余额仍为0（可能还在加载），给一些时间等待余额加载
    if (wallet.isConnected && wallet.balance === '0') {
      // 给3秒时间让余额加载完成
      const timeoutId = setTimeout(() => {
        // 3秒后如果仍然没有最小余额，则重定向
        if (!wallet.hasMinimumBalance) {
          navigate('/');
        }
        // 无论如何，3秒后都标记为非初始加载
        setIsInitialLoad(false);
      }, 3000);
      
      return () => clearTimeout(timeoutId);
    }
    
    // 余额已加载但不足时，重定向到主页
    if (wallet.balance !== '0' && !wallet.hasMinimumBalance) {
      navigate('/');
    }
  }, [wallet.isConnected, wallet.hasMinimumBalance, wallet.isLoading, wallet.balance, navigate, isInitialLoad]);

  // 包装移动函数，在操作后刷新余额
  const handleMovePlayer = async (direction: 'up' | 'down' | 'left' | 'right') => {
    try {
      await movePlayer(direction);
      // 操作完成后静默刷新余额，不显示loading状态
      setTimeout(() => {
        walletDisplayRef.current?.silentRefresh();
      }, 1000); // 等待1秒确保交易完成
    } catch (error) {
      console.error('移动失败:', error);
    }
  };

  useKeyboard({
    onMove: handleMovePlayer,
    onActivatePortal: activatePortal,
    enabled: !gameState.gameWon && wallet.walletStatus === 'ready',
  });

  // 只有在首次加载且钱包正在加载时，才显示全屏加载状态
  if (isInitialLoad && (wallet.isLoading || (wallet.isConnected && wallet.balance === '0'))) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="max-w-md mx-auto">
          <div className="nes-container is-dark">
            <div className="flex items-center gap-3">
              <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full"></div>
              <span className="nes-text text-blue-400">
                {wallet.isLoading ? '正在加载钱包...' : '正在获取余额...'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 如果钱包状态不满足游戏条件，显示警告
  const shouldShowWarning = !wallet.isConnected || !wallet.hasMinimumBalance;
    
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
        {/* Top Navigation Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <Button
              onClick={() => navigate('/')}
              className="nes-btn is-primary"
              style={{ fontSize: '14px', height: '36px' }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
            <h1 className="nes-text is-primary text-xl md:text-2xl pixel-font">
              魔纳地牢
            </h1>
          </div>
        </div>

        <div className="grid xl:grid-cols-3 gap-4 items-start">
          {/* Game Grid - Takes 2/3 of the space */}
          <div className="xl:col-span-2 flex justify-center">
            <DungeonGrid grid={gameState.dungeonGrid} gameState={gameState} />
          </div>
          
          {/* Game UI - Takes 1/3 of the space */}
          <div className="space-y-3">

            {/* Wallet Display */}
            <WalletDisplay 
              ref={walletDisplayRef}
              onBalanceUpdate={() => {
                // 余额更新回调 - 移除调试日志避免过多输出
              }}
            />

            {/* Chain Mode Status */}
            <div className="nes-container is-dark with-title">
              <p className="title text-white">游戏状态</p>
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <Link className="w-4 h-4 text-green-400" />
                  <span className="nes-text">链上模式</span>
                </div>
                
                <div className="text-xs text-gray-400">
                  合约: {import.meta.env.VITE_CONTRACT_ADDRESS?.slice(0, 6)}...{import.meta.env.VITE_CONTRACT_ADDRESS?.slice(-4)}
                </div>

                {/* 显示玩家状态信息 */}
                {playerState && (
                  <div className="space-y-1">
                    <div className="text-xs text-blue-400">
                      关卡: {playerState.level} | 步数: {playerState.steps} | 积分: {playerState.gems * 3}
                    </div>
                    <div className="text-xs text-green-400">
                      位置: ({playerState.x}, {playerState.y})
                    </div>
                  </div>
                )}

                {/* 开始游戏按钮 - 只有在无法获取到玩家状态或玩家状态显示未开始时才显示 */}
                {(!playerStateLoaded || (playerState && !gameStarted)) && !gameContract.isProcessing && (
                  <Button
                    onClick={async () => {
                      await startGameManually();
                      // 操作完成后静默刷新余额，不显示loading状态
                      setTimeout(() => {
                        walletDisplayRef.current?.silentRefresh();
                      }, 1000);
                    }}
                    className="nes-btn is-success is-small w-full"
                    style={{ fontSize: '10px', height: '28px' }}
                  >
                    开始游戏
                  </Button>
                )}

                {playerStateLoaded && gameStarted && (
                  <div className="text-xs text-green-400">
                    ✓ 游戏已开始，可以移动了！
                  </div>
                )}

                {/* 显示加载状态 */}
                {!playerStateLoaded && !gameContract.isProcessing && (
                  <div className="text-xs text-yellow-400">
                    正在加载玩家状态...
                  </div>
                )}

                {gameContract.isProcessing && (
                  <div className="nes-container is-rounded bg-yellow-900 border-yellow-500">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-3 h-3 border border-yellow-400 border-t-transparent rounded-full"></div>
                      <span className="nes-text text-yellow-400">正在上链...</span>
                    </div>
                    {gameContract.lastTxHash && (
                      <div className="mt-1">
                        <a
                          href={`https://testnet.monadexplorer.com/tx/${gameContract.lastTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-xs break-all"
                        >
                          查看交易
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {gameContract.error && (
                  <div className="nes-container is-rounded bg-red-900 border-red-500">
                    <span className="nes-text text-red-400 text-xs">{gameContract.error}</span>
                  </div>
                )}
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
                <p className="nes-text">宝石积分: 3分</p>
                <p className="nes-text">宝箱积分: 1-5分不等</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;