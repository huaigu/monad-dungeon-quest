import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';

export interface MetaMaskState {
  isInstalled: boolean;
  isConnected: boolean;
  isLoading: boolean;
  account: string | null;
  chainId: string | null;
  error: string | null;
}

export interface MetaMaskActions {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToMonadTestnet: () => Promise<void>;
}

const MONAD_TESTNET = {
  chainId: '0x279F', // 10143 in hex
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: ['https://testnet1.monad.xyz'],
  blockExplorerUrls: ['https://testnet.monadexplorer.com'],
};

const INITIAL_STATE: MetaMaskState = {
  isInstalled: false,
  isConnected: false,
  isLoading: false,
  account: null,
  chainId: null,
  error: null,
};

export function useMetaMask(): MetaMaskState & MetaMaskActions {
  const [state, setState] = useState<MetaMaskState>(INITIAL_STATE);

  // 检查MetaMask是否安装
  const checkMetaMaskInstalled = useCallback(() => {
    const isInstalled = typeof window !== 'undefined' && Boolean(window.ethereum);
    setState(prev => ({ ...prev, isInstalled }));
    return isInstalled;
  }, []);

  // 获取当前账户信息
  const getCurrentAccount = useCallback(async () => {
    if (!window.ethereum) return null;
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      return accounts.length > 0 ? accounts[0] : null;
    } catch (error) {
      console.error('获取账户失败:', error);
      return null;
    }
  }, []);

  // 获取当前链ID
  const getCurrentChainId = useCallback(async () => {
    if (!window.ethereum) return null;
    
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('获取到的chainId:', chainId, '类型:', typeof chainId);
      return chainId;
    } catch (error) {
      console.error('获取链ID失败:', error);
      return null;
    }
  }, []);

  // 连接MetaMask
  const connect = useCallback(async () => {
    if (!checkMetaMaskInstalled()) {
      setState(prev => ({ ...prev, error: '请先安装MetaMask钱包' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('未获取到账户');
      }

      const chainId = await getCurrentChainId();
      
      setState(prev => ({
        ...prev,
        isConnected: true,
        account: accounts[0],
        chainId,
        isLoading: false,
        error: null,
      }));
    } catch (error: unknown) {
      console.error('连接MetaMask失败:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '连接MetaMask失败',
      }));
    }
  }, [checkMetaMaskInstalled, getCurrentChainId]);

  // 断开连接
  const disconnect = useCallback(() => {
    setState(prev => ({
      ...prev,
      isConnected: false,
      account: null,
      chainId: null,
      error: null,
    }));
  }, []);

  // 切换到Monad测试网
  const switchToMonadTestnet = useCallback(async () => {
    if (!window.ethereum) {
      setState(prev => ({ ...prev, error: '未检测到MetaMask' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // 尝试切换到Monad测试网
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MONAD_TESTNET.chainId }],
      });
    } catch (switchError: unknown) {
      // 如果网络不存在，添加网络
      if (switchError instanceof Error && 'code' in switchError && (switchError as { code: number }).code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MONAD_TESTNET],
          });
        } catch (addError: unknown) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: `添加网络失败: ${addError instanceof Error ? addError.message : '未知错误'}`,
          }));
          return;
        }
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: `切换网络失败: ${switchError instanceof Error ? switchError.message : '未知错误'}`,
        }));
        return;
      }
    }

    // 更新链ID
    const newChainId = await getCurrentChainId();
    setState(prev => ({
      ...prev,
      chainId: newChainId,
      isLoading: false,
      error: null,
    }));
  }, [getCurrentChainId]);

  // 监听账户和网络变化
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setState(prev => ({
          ...prev,
          account: accounts[0],
          isConnected: true,
        }));
      }
    };

    const handleChainChanged = (chainId: string) => {
      setState(prev => ({ ...prev, chainId }));
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnect]);

  // 初始化检查
  useEffect(() => {
    checkMetaMaskInstalled();
    
    // 如果已经连接，获取当前状态
    if (window.ethereum) {
      getCurrentAccount().then(account => {
        if (account) {
          getCurrentChainId().then(chainId => {
            setState(prev => ({
              ...prev,
              isConnected: true,
              account,
              chainId,
            }));
          });
        }
      });
    }
  }, [checkMetaMaskInstalled, getCurrentAccount, getCurrentChainId]);

  return {
    ...state,
    connect,
    disconnect,
    switchToMonadTestnet,
  };
}