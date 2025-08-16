import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import './polyfills'; // 确保 polyfills 被加载

// Monad Testnet 网络配置
export const MONAD_TESTNET_CONFIG = {
  chainId: 10143,
  name: 'Monad Testnet',
  currency: 'MON',
  blockExplorer: 'https://testnet.monadexplorer.com',
  rpcUrl: 'https://testnet-rpc.monad.xyz',
};

// 钱包存储键名
export const WALLET_STORAGE_KEYS = {
  PRIVATE_KEY: 'monad_wallet_private_key',
  ADDRESS: 'monad_wallet_address',
  MNEMONIC: 'monad_wallet_mnemonic',
} as const;

/**
 * 生成新的钱包
 */
export function generateWallet(): {
  address: string;
  privateKey: string;
  mnemonic: string;
} {
  // 生成助记词
  const mnemonic = bip39.generateMnemonic();
  
  // 从助记词创建钱包
  const wallet = ethers.Wallet.fromPhrase(mnemonic);
  
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic,
  };
}

/**
 * 从私钥恢复钱包
 */
export function restoreWalletFromPrivateKey(privateKey: string): {
  address: string;
  privateKey: string;
} {
  const wallet = new ethers.Wallet(privateKey);
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
}

/**
 * 从助记词恢复钱包
 */
export function restoreWalletFromMnemonic(mnemonic: string): {
  address: string;
  privateKey: string;
  mnemonic: string;
} {
  const wallet = ethers.Wallet.fromPhrase(mnemonic);
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic,
  };
}

/**
 * 保存钱包到 localStorage
 */
export function saveWalletToStorage(wallet: {
  address: string;
  privateKey: string;
  mnemonic: string;
}): void {
  try {
    localStorage.setItem(WALLET_STORAGE_KEYS.ADDRESS, wallet.address);
    localStorage.setItem(WALLET_STORAGE_KEYS.PRIVATE_KEY, wallet.privateKey);
    localStorage.setItem(WALLET_STORAGE_KEYS.MNEMONIC, wallet.mnemonic);
  } catch (error) {
    console.error('保存钱包失败:', error);
    throw new Error('保存钱包失败');
  }
}

/**
 * 从 localStorage 加载钱包
 */
export function loadWalletFromStorage(): {
  address: string;
  privateKey: string;
  mnemonic: string;
} | null {
  try {
    const address = localStorage.getItem(WALLET_STORAGE_KEYS.ADDRESS);
    const privateKey = localStorage.getItem(WALLET_STORAGE_KEYS.PRIVATE_KEY);
    const mnemonic = localStorage.getItem(WALLET_STORAGE_KEYS.MNEMONIC);

    if (!address || !privateKey || !mnemonic) {
      return null;
    }

    return {
      address,
      privateKey,
      mnemonic,
    };
  } catch (error) {
    console.error('加载钱包失败:', error);
    return null;
  }
}

/**
 * 删除钱包数据
 */
export function clearWalletFromStorage(): void {
  try {
    localStorage.removeItem(WALLET_STORAGE_KEYS.ADDRESS);
    localStorage.removeItem(WALLET_STORAGE_KEYS.PRIVATE_KEY);
    localStorage.removeItem(WALLET_STORAGE_KEYS.MNEMONIC);
  } catch (error) {
    console.error('清除钱包失败:', error);
  }
}

/**
 * 获取钱包余额
 */
export async function getWalletBalance(address: string): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider(MONAD_TESTNET_CONFIG.rpcUrl);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('获取余额失败:', error);
    throw new Error('获取余额失败');
  }
}

/**
 * 检查是否有足够的余额开始游戏
 * @param balance 余额字符串（MON 单位）
 * @param minAmount 最小金额（默认 0.01 MON）
 */
export function hasEnoughBalance(balance: string, minAmount: string = '0.01'): boolean {
  try {
    const balanceNum = parseFloat(balance);
    const minAmountNum = parseFloat(minAmount);
    return balanceNum >= minAmountNum;
  } catch (error) {
    console.error('检查余额失败:', error);
    return false;
  }
}

/**
 * 格式化地址显示
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) {
    return address;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * 格式化余额显示
 */
export function formatBalance(balance: string): string {
  try {
    const num = parseFloat(balance);
    if (isNaN(num)) {
      return '0.0000';
    }
    return num.toFixed(4);
  } catch (error) {
    return '0.0000';
  }
}

/**
 * 验证私钥格式
 */
export function isValidPrivateKey(privateKey: string): boolean {
  try {
    new ethers.Wallet(privateKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证助记词格式
 */
export function isValidMnemonic(mnemonic: string): boolean {
  return bip39.validateMnemonic(mnemonic);
}