import { useState, forwardRef, useImperativeHandle } from 'react';
import { Copy, Check, Wallet } from 'lucide-react';
import { useBalance } from '@/hooks/useBalance';
import { loadWalletFromStorage, formatAddress } from '@/utils/wallet';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface WalletDisplayProps {
  onBalanceUpdate?: () => void; // 余额更新后的回调
}

export interface WalletDisplayRef {
  refresh: () => Promise<void>;
  silentRefresh: () => Promise<void>;
}

export const WalletDisplay = forwardRef<WalletDisplayRef, WalletDisplayProps>(
  ({ onBalanceUpdate }, ref) => {
    const { balance, isLoading, refresh, silentRefresh } = useBalance();
    const [copied, setCopied] = useState(false);

    const walletInfo = loadWalletFromStorage();

    // 暴露refresh方法给父组件
    useImperativeHandle(ref, () => ({
      refresh: async () => {
        await refresh();
        onBalanceUpdate?.();
      },
      silentRefresh: async () => {
        await silentRefresh();
        onBalanceUpdate?.();
      },
    }));

    // 复制地址到剪贴板
    const copyAddress = async () => {
      if (!walletInfo) return;

      try {
        await navigator.clipboard.writeText(walletInfo.address);
        setCopied(true);
        toast.success('地址已复制');
        
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('复制失败:', error);
        toast.error('复制失败');
      }
    };

    // 手动刷新余额
    const handleRefresh = async () => {
      await refresh();
      onBalanceUpdate?.();
    };

    if (!walletInfo) {
      return (
        <div className="nes-container is-dark is-rounded">
          <span className="nes-text text-red-400">未找到钱包</span>
        </div>
      );
    }

    return (
      <div className="nes-container is-dark with-title">
        <p className="title text-white">钱包信息</p>
        <div className="space-y-2 text-xs">
          {/* 地址显示和复制 */}
          <div className="flex items-center gap-2">
            <Wallet className="w-3 h-3 text-blue-400" />
            <span className="nes-text text-blue-400 flex-1">
              {formatAddress(walletInfo.address)}
            </span>
            <Button
              onClick={copyAddress}
              size="sm"
              className="nes-btn is-small p-1"
              style={{ fontSize: '8px', height: '20px', width: '20px' }}
            >
              {copied ? (
                <Check className="w-2 h-2 text-green-400" />
              ) : (
                <Copy className="w-2 h-2" />
              )}
            </Button>
          </div>

          {/* 余额显示 */}
          <div className="flex items-center justify-between">
            <span className="nes-text text-yellow-400">
              余额: {isLoading ? '...' : `${balance} MON`}
            </span>
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              size="sm"
              className="nes-btn is-small"
              style={{ fontSize: '8px', height: '18px' }}
            >
              {isLoading ? '刷新中' : '刷新'}
            </Button>
          </div>
        </div>
      </div>
    );
  }
);