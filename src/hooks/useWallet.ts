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
    console.log('initializeWalletState: Synchronously loading wallet...');
    const walletInfo = loadWalletFromStorage();
    
    if (walletInfo) {
      console.log('initializeWalletState: Found wallet in storage, setting connected state');
      return {
        isConnected: true,
        isLoading: false,
        address: walletInfo.address,
        balance: '0', // 余额稍后异步更新
        hasMinimumBalance: false, // 余额加载后更新
        error: null,
      };
    } else {
      console.log('initializeWalletState: No wallet found, using initial state');
      return INITIAL_STATE;
    }
  }, []);

  const [state, setState] = useState<WalletState>(() => initializeWalletState());

  // 刷新余额
  const refreshBalance = useCallback(async () => {
    if (!state.address) {
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const balance = await getWalletBalance(state.address);
      const hasMinBalance = hasEnoughBalance(balance, MIN_BALANCE_FOR_GAME);

      console.log('refreshBalance: Got balance:', balance);
      console.log('refreshBalance: MIN_BALANCE_FOR_GAME:', MIN_BALANCE_FOR_GAME);
      console.log('refreshBalance: hasMinBalance:', hasMinBalance);

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
  }, [state.address]);

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
    console.log('loadWallet: Starting to load wallet from storage');
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const walletInfo = loadWalletFromStorage();
      console.log('loadWallet: Wallet info from storage:', walletInfo);
      
      if (walletInfo) {
        console.log('loadWallet: Found wallet, setting connected state');
        setState(prev => ({
          ...prev,
          isConnected: true,
          address: walletInfo.address,
          isLoading: false,
          error: null,
        }));

        // 立即刷新余额
        setTimeout(() => {
          console.log('loadWallet: Triggering balance refresh');
          refreshBalance();
        }, 100);
      } else {
        console.log('loadWallet: No wallet found in storage');
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

  // 添加调试日志
  console.log('=== useWallet Debug Info ===');
  console.log('State:', state);
  console.log('Calculated walletStatus:', walletStatus);
  console.log('isConnected:', state.isConnected);
  console.log('address:', state.address);
  console.log('balance:', state.balance);
  console.log('hasMinimumBalance:', state.hasMinimumBalance);
  console.log('===============================');

  // 初始化和定时刷新
  useEffect(() => {
    console.log('useWallet: Initial effect - checking if wallet is already loaded');
    // 如果钱包已经连接但余额还没有加载，立即刷新余额
    if (state.isConnected && state.address && state.balance === '0') {
      console.log('useWallet: Wallet connected but balance not loaded, refreshing...');
      refreshBalance();
    }
  }, [state.isConnected, state.address, state.balance, refreshBalance]); // 添加正确的依赖

  useEffect(() => {
    // 如果有钱包地址，开始定时刷新余额
    if (state.address && state.isConnected) {
      const interval = setInterval(refreshBalance, BALANCE_REFRESH_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [state.address, state.isConnected, refreshBalance]);

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