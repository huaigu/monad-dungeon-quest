import { useState, useEffect, useCallback } from 'react';
import { 
  WalletState, 
  WalletInfo, 
  WalletActions, 
  WalletStatus 
} from '@/types/game';
import {
  generateWallet,
  saveWalletToStorage,
  loadWalletFromStorage,
  clearWalletFromStorage,
  getWalletBalance,
  hasEnoughBalance,
  MONAD_TESTNET_CONFIG,
} from '@/utils/wallet';

const INITIAL_STATE: WalletState = {
  isConnected: false,
  isLoading: false,
  address: null,
  balance: '0',
  hasMinimumBalance: false,
  error: null,
};

const BALANCE_REFRESH_INTERVAL = 10000; // 10秒刷新一次余额
const MIN_BALANCE_FOR_GAME = '0.01'; // 最小游戏余额 0.01 MON

export function useWallet(): WalletState & WalletActions & { walletStatus: WalletStatus } {
  // 同步初始化钱包状态，避免异步导致的时序问题
  const initializeWalletState = useCallback((): WalletState => {
    const walletInfo = loadWalletFromStorage();
    
    if (walletInfo) {
      return {
        isConnected: true,
        isLoading: false,
        address: walletInfo.address,
        balance: '0', // 余额稍后异步更新
        hasMinimumBalance: false, // 余额加载后更新
        error: null,
      };
    } else {
      return INITIAL_STATE;
    }
  }, []);

  const [state, setState] = useState<WalletState>(() => initializeWalletState());

  // 刷新余额
  const refreshBalance = useCallback(async () => {
    const walletInfo = loadWalletFromStorage();
    if (!walletInfo?.address) {
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const balance = await getWalletBalance(walletInfo.address);
      const hasMinBalance = hasEnoughBalance(balance, MIN_BALANCE_FOR_GAME);

      setState(prev => ({
        ...prev,
        balance,
        hasMinimumBalance: hasMinBalance,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error('刷新余额失败:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: '获取余额失败',
      }));
    }
  }, []); // 移除所有依赖，使用函数内部获取最新的钱包信息

  // 创建新钱包
  const createWallet = useCallback(async (): Promise<WalletInfo> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const walletInfo = generateWallet();
      saveWalletToStorage(walletInfo);

      setState(prev => ({
        ...prev,
        isConnected: true,
        address: walletInfo.address,
        balance: '0',
        hasMinimumBalance: false,
        isLoading: false,
        error: null,
      }));

      // 立即刷新余额
      setTimeout(() => {
        refreshBalance();
      }, 100);

      return walletInfo;
    } catch (error) {
      console.error('创建钱包失败:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: '创建钱包失败',
      }));
      throw error;
    }
  }, [refreshBalance]);

  // 加载钱包
  const loadWallet = useCallback((): WalletInfo | null => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const walletInfo = loadWalletFromStorage();
      
      if (walletInfo) {
        setState(prev => ({
          ...prev,
          isConnected: true,
          address: walletInfo.address,
          isLoading: false,
          error: null,
        }));

        // 立即刷新余额
        setTimeout(() => {
          refreshBalance();
        }, 100);
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }

      return walletInfo;
    } catch (error) {
      console.error('加载钱包失败:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: '加载钱包失败',
      }));
      return null;
    }
  }, [refreshBalance]);

  // 清除钱包
  const clearWallet = useCallback(() => {
    clearWalletFromStorage();
    setState(INITIAL_STATE);
  }, []);

  // 导出私钥
  const exportPrivateKey = useCallback((): string | null => {
    const walletInfo = loadWalletFromStorage();
    return walletInfo?.privateKey || null;
  }, []);

  // 计算钱包状态
  const walletStatus: WalletStatus = (() => {
    if (!state.isConnected || !state.address) {
      return 'disconnected';
    }
    if (state.hasMinimumBalance) {
      return 'ready';
    }
    if (parseFloat(state.balance) > 0) {
      return 'insufficient_balance';
    }
    return 'connected';
  })();

  // 初始化和定时刷新
  useEffect(() => {
    // 如果钱包已经连接但余额还没有加载，立即刷新余额
    if (state.isConnected && state.address && state.balance === '0') {
      refreshBalance();
    }
  }, [state.isConnected, state.address, state.balance]); // 移除 refreshBalance 依赖

  useEffect(() => {
    // 如果有钱包地址，开始定时刷新余额
    if (state.address && state.isConnected) {
      const interval = setInterval(refreshBalance, BALANCE_REFRESH_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [state.address, state.isConnected]); // 移除 refreshBalance 依赖

  return {
    ...state,
    walletStatus,
    createWallet,
    loadWallet,
    clearWallet,
    refreshBalance,
    exportPrivateKey,
  };
}

// 钱包状态的辅助函数
export function getWalletStatusText(status: WalletStatus): string {
  switch (status) {
    case 'disconnected':
      return '未连接钱包';
    case 'connected':
      return '钱包已连接';
    case 'insufficient_balance':
      return '余额不足';
    case 'ready':
      return '准备就绪';
    default:
      return '未知状态';
  }
}

export function getWalletStatusColor(status: WalletStatus): string {
  switch (status) {
    case 'disconnected':
      return 'text-red-400';
    case 'connected':
      return 'text-yellow-400';
    case 'insufficient_balance':
      return 'text-orange-400';
    case 'ready':
      return 'text-green-400';
    default:
      return 'text-gray-400';
  }
}