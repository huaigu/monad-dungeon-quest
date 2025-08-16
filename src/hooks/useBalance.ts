import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { loadWalletFromStorage, MONAD_TESTNET_CONFIG } from '@/utils/wallet';

interface BalanceState {
  balance: string;
  isLoading: boolean;
  error: string | null;
}

export function useBalance() {
  const [state, setState] = useState<BalanceState>({
    balance: '0.0000',
    isLoading: false,
    error: null,
  });

  // 获取余额
  const fetchBalance = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const walletInfo = loadWalletFromStorage();
      if (!walletInfo) {
        throw new Error('未找到钱包信息');
      }

      // 创建provider
      const provider = new ethers.JsonRpcProvider(MONAD_TESTNET_CONFIG.rpcUrl);
      
      // 获取余额
      const balanceWei = await provider.getBalance(walletInfo.address);
      const balanceEth = ethers.formatEther(balanceWei);
      
      // 保留4位小数
      const formattedBalance = parseFloat(balanceEth).toFixed(4);

      setState(prev => ({
        ...prev,
        balance: formattedBalance,
        isLoading: false,
      }));
    } catch (error) {
      console.error('获取余额失败:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '获取余额失败',
      }));
    }
  }, []);

  // 定时刷新余额（每30秒）
  useEffect(() => {
    // 立即获取一次余额
    fetchBalance();

    // 设置定时器
    const interval = setInterval(fetchBalance, 30000);

    return () => clearInterval(interval);
  }, []); // 移除 fetchBalance 依赖，只在挂载时执行

  return {
    ...state,
    refresh: fetchBalance,
  };
}