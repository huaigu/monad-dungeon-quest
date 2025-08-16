import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import contractABI from './abi.json';
import { DungeonLevel } from '@/types/game';

export interface ContractState {
  isLoading: boolean;
  error: string | null;
  contractAddress: string;
  uploadProgress: number;
  lastTxHash: string | null;
}

export interface ContractActions {
  setContractAddress: (address: string) => void;
  uploadLevelsToContract: (levelsData: DungeonLevel[]) => Promise<void>;
  checkOwnership: (userAddress: string) => Promise<boolean>;
}

const INITIAL_STATE: ContractState = {
  isLoading: false,
  error: null,
  contractAddress: '',
  uploadProgress: 0,
  lastTxHash: null,
};

export function useContract(): ContractState & ContractActions {
  const [state, setState] = useState<ContractState>(INITIAL_STATE);

  // 设置合约地址
  const setContractAddress = useCallback((address: string) => {
    setState(prev => ({ ...prev, contractAddress: address, error: null }));
  }, []);

  // 检查用户是否为合约所有者
  const checkOwnership = useCallback(async (userAddress: string): Promise<boolean> => {
    if (!state.contractAddress || !userAddress) {
      return false;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(state.contractAddress, contractABI.abi, provider);
      
      const owner = await contract.owner();
      return owner.toLowerCase() === userAddress.toLowerCase();
    } catch (error) {
      console.error('检查所有权失败:', error);
      return false;
    }
  }, [state.contractAddress]);

  // 将关卡数据转换为合约格式
  const convertLevelsToContractFormat = useCallback((levelsData: DungeonLevel[]) => {
    const levels: number[] = [];
    const tilesArrays: number[][] = [];

    levelsData.forEach(levelData => {
      levels.push(levelData.level);
      tilesArrays.push(levelData.grid);
    });

    return { levels, tilesArrays };
  }, []);

  // 上传关卡数据到合约
  const uploadLevelsToContract = useCallback(async (levelsData: DungeonLevel[]) => {
    if (!state.contractAddress) {
      setState(prev => ({ ...prev, error: '请先设置合约地址' }));
      return;
    }

    if (!window.ethereum) {
      setState(prev => ({ ...prev, error: '未检测到MetaMask' }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null, 
      uploadProgress: 0,
      lastTxHash: null 
    }));

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(state.contractAddress, contractABI.abi, signer);

      // 检查用户是否为合约所有者
      const userAddress = await signer.getAddress();
      const isOwner = await checkOwnership(userAddress);
      
      if (!isOwner) {
        throw new Error('只有合约所有者才能上传关卡数据');
      }

      setState(prev => ({ ...prev, uploadProgress: 10 }));

      // 转换数据格式
      const { levels, tilesArrays } = convertLevelsToContractFormat(levelsData);
      
      setState(prev => ({ ...prev, uploadProgress: 20 }));

      // 估算gas
      let gasEstimate;
      try {
        gasEstimate = await contract.setLevelsArray.estimateGas(levels, tilesArrays);
        console.log('预估Gas:', gasEstimate.toString());
      } catch (gasError) {
        console.warn('Gas估算失败，使用默认值:', gasError);
        gasEstimate = BigInt(2000000); // 默认gas限制
      }

      setState(prev => ({ ...prev, uploadProgress: 30 }));

      // 调用合约方法
      const tx = await contract.setLevelsArray(levels, tilesArrays, {
        gasLimit: gasEstimate + BigInt(100000) // 增加一些余量
      });

      setState(prev => ({ 
        ...prev, 
        uploadProgress: 50, 
        lastTxHash: tx.hash 
      }));

      console.log('交易已提交:', tx.hash);

      // 等待交易确认
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          uploadProgress: 100,
          error: null,
        }));
        console.log('关卡数据上传成功!');
      } else {
        throw new Error('交易失败');
      }
    } catch (error: unknown) {
      console.error('上传关卡数据失败:', error);
      
      let errorMessage = '上传失败';
      
      if (error instanceof Error) {
        if ('code' in error) {
          const ethError = error as { code: string };
          if (ethError.code === 'ACTION_REJECTED') {
            errorMessage = '用户取消了交易';
          } else if (ethError.code === 'INSUFFICIENT_FUNDS') {
            errorMessage = '余额不足，无法支付gas费用';
          }
        }
        
        if (error.message.includes('execution reverted')) {
          if (error.message.includes('OwnableUnauthorizedAccount')) {
            errorMessage = '只有合约所有者才能执行此操作';
          } else if (error.message.includes('length mismatch')) {
            errorMessage = '关卡数据格式错误：数组长度不匹配';
          } else if (error.message.includes('tiles length')) {
            errorMessage = '关卡数据格式错误：瓦片数组长度必须为100';
          } else {
            errorMessage = `合约执行失败: ${error.message}`;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        uploadProgress: 0,
        error: errorMessage,
      }));
    }
  }, [state.contractAddress, checkOwnership, convertLevelsToContractFormat]);

  return {
    ...state,
    setContractAddress,
    uploadLevelsToContract,
    checkOwnership,
  };
}