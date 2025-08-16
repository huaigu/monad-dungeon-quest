import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useWallet, getWalletStatusText, getWalletStatusColor } from '@/hooks/useWallet';
import { formatAddress, formatBalance, MONAD_TESTNET_CONFIG, loadWalletFromStorage } from '@/utils/wallet';
import { Copy, Eye, EyeOff, RefreshCw, Wallet, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WalletSetupProps {
  onWalletReady: () => void;
}

export function WalletSetup({ onWalletReady }: WalletSetupProps) {
  const wallet = useWallet();
  const { toast } = useToast();
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // 检查是否有存储的钱包（无论连接状态如何）
  const storedWallet = loadWalletFromStorage();

  const handleCreateWallet = async () => {
    try {
      await wallet.createWallet();
      toast({
        title: "钱包创建成功",
        description: "请为您的钱包充值以开始游戏",
      });
    } catch (error) {
      toast({
        title: "创建失败",
        description: "创建钱包时发生错误，请重试",
        variant: "destructive",
      });
    }
  };

  const handleCopyAddress = async () => {
    if (wallet.address) {
      try {
        await navigator.clipboard.writeText(wallet.address);
        toast({
          title: "复制成功",
          description: "钱包地址已复制到剪贴板",
        });
      } catch (error) {
        toast({
          title: "复制失败",
          description: "无法复制到剪贴板",
          variant: "destructive",
        });
      }
    }
  };

  const handleExportPrivateKey = async () => {
    setIsExporting(true);
    try {
      const privateKey = wallet.exportPrivateKey();
      if (privateKey) {
        await navigator.clipboard.writeText(privateKey);
        toast({
          title: "私钥已复制",
          description: "私钥已安全复制到剪贴板，请妥善保管",
        });
      }
    } catch (error) {
      toast({
        title: "导出失败",
        description: "无法导出私钥",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefreshBalance = async () => {
    await wallet.refreshBalance();
    toast({
      title: "余额已刷新",
      description: `当前余额: ${formatBalance(wallet.balance)} MON`,
    });
  };

  // 导出私钥组件 - 无论钱包连接状态如何都可以使用
  const ExportPrivateKeyDialog = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="nes-btn w-full">
          <Eye className="w-4 h-4 mr-2" />
          导出私钥
        </Button>
      </DialogTrigger>
      <DialogContent className="nes-dialog">
        <DialogHeader>
          <DialogTitle className="nes-text is-error">
            <AlertTriangle className="w-5 h-5 inline mr-2" />
            安全警告
          </DialogTitle>
          <DialogDescription className="nes-text text-sm space-y-2">
            <p>私钥是您钱包的完全控制权限。</p>
            <p className="text-red-400">请妥善保管，不要泄露给任何人！</p>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Alert className="nes-container is-error">
            <AlertDescription className="nes-text text-xs">
              任何人获得您的私钥都可以完全控制您的钱包资产。
            </AlertDescription>
          </Alert>
          
          <Button
            onClick={handleExportPrivateKey}
            disabled={isExporting}
            className="nes-btn is-error w-full"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                复制中...
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                复制私钥到剪贴板
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  // 统一使用burner wallet流程，检查钱包状态是否为ready
  const canStartGame = wallet.walletStatus === 'ready';

  if (canStartGame) {
    return (
      <div className="nes-container is-dark with-title">
        <p className="title text-white">钱包就绪</p>
        <div className="space-y-4">
          <div className="nes-container is-rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="nes-text">钱包地址:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAddress}
                className="nes-btn is-small"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <p className="nes-text text-xs break-all">{wallet.address}</p>
          </div>

          <div className="nes-container is-rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="nes-text">余额:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshBalance}
                disabled={wallet.isLoading}
                className="nes-btn is-small"
              >
                <RefreshCw className={`w-3 h-3 ${wallet.isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <p className="nes-text text-sm">
              {formatBalance(wallet.balance)} <span className="text-yellow-400">MON</span>
            </p>
          </div>

          <div className="text-center space-y-3">
            <p className={`nes-text ${getWalletStatusColor(wallet.walletStatus)}`}>
              ✓ {getWalletStatusText(wallet.walletStatus)}
            </p>
            
            <Button
              onClick={onWalletReady}
              className="nes-btn is-success w-full"
              disabled={wallet.isLoading}
            >
              开始游戏
            </Button>

            {/* 私钥导出 - 只要有存储的钱包就显示 */}
            {<ExportPrivateKeyDialog />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 创建钱包 */}
      {!wallet.isConnected && (
        <Card className="nes-container is-dark with-title">
          <p className="title text-white">{storedWallet ? '钱包管理' : '创建钱包'}</p>
          <CardContent className="space-y-4">
            {!storedWallet ? (
              <>
                <CardDescription className="nes-text">
                  需要创建一个临时钱包来开始游戏。钱包将存储在您的浏览器中。
                </CardDescription>
                
                <Button
                  onClick={handleCreateWallet}
                  disabled={wallet.isLoading}
                  className="nes-btn is-primary w-full"
                >
                  {wallet.isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      创建中...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      创建钱包
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <CardDescription className="nes-text">
                  检测到本地钱包数据。你可以重新加载钱包或导出私钥。
                </CardDescription>
                
                <div className="space-y-3">
                  <Button
                    onClick={() => window.location.reload()}
                    className="nes-btn is-primary w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    重新加载钱包
                  </Button>
                  
                  {/* 私钥导出 - 有存储钱包时显示 */}
                  <ExportPrivateKeyDialog />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* 钱包信息 */}
      {wallet.isConnected && (
        <div className="nes-container is-dark with-title">
          <p className="title text-white">钱包信息</p>
          <div className="space-y-4">
            {/* 地址 */}
            <div className="nes-container is-rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="nes-text">钱包地址:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyAddress}
                  className="nes-btn is-small"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <p className="nes-text text-xs break-all">{wallet.address}</p>
            </div>

            {/* 余额 */}
            <div className="nes-container is-rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="nes-text">余额:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshBalance}
                  disabled={wallet.isLoading}
                  className="nes-btn is-small"
                >
                  <RefreshCw className={`w-3 h-3 ${wallet.isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <p className="nes-text text-sm">
                {formatBalance(wallet.balance)} <span className="text-yellow-400">MON</span>
              </p>
            </div>

            {/* 状态 */}
            <div className="text-center">
              <p className={`nes-text ${getWalletStatusColor(wallet.walletStatus)}`}>
                {getWalletStatusText(wallet.walletStatus)}
              </p>
            </div>

            {/* 私钥导出 - 统一使用组件 */}
            {storedWallet && <ExportPrivateKeyDialog />}
          </div>
        </div>
      )}

      {/* 充值说明 */}
      {wallet.isConnected && !wallet.hasMinimumBalance && (
        <div className="nes-container is-warning with-title">
          <p className="title text-amber-600">充值说明</p>
          <div className="space-y-3">
            <p className="nes-text text-sm">
              您需要向钱包充值至少 <strong>0.01 MON</strong> 作为 Gas 费用才能开始游戏。
            </p>
            
            <div className="nes-container is-rounded">
              <h4 className="nes-text font-bold mb-2">网络信息:</h4>
              <div className="text-xs space-y-1">
                <p className="nes-text">网络名称: {MONAD_TESTNET_CONFIG.name}</p>
                <p className="nes-text">Chain ID: {MONAD_TESTNET_CONFIG.chainId}</p>
                <p className="nes-text">货币符号: {MONAD_TESTNET_CONFIG.currency}</p>
                <p className="nes-text">
                  区块浏览器: 
                  <a 
                    href={MONAD_TESTNET_CONFIG.blockExplorer} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 ml-1"
                  >
                    {MONAD_TESTNET_CONFIG.blockExplorer}
                  </a>
                </p>
              </div>
            </div>

            <Alert className="nes-container is-dark">
              <AlertDescription className="nes-text text-xs">
                请使用您的私钥导入钱包到 MetaMask 或其他钱包应用，然后向该地址转入一些 MON 代币。
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}


      {/* 错误信息 */}
      {wallet.error && (
        <Alert className="nes-container is-error">
          <AlertDescription className="nes-text">
            {wallet.error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}