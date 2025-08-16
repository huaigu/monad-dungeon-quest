import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import contractABI from './abi.json';
import { loadWalletFromStorage, MONAD_TESTNET_CONFIG } from '@/utils/wallet';

// 方向枚举，对应合约中的 Direction enum
export enum Direction {
  Up = 0,
  Down = 1,
  Left = 2,
  Right = 3
}

// 玩家状态类型，对应合约中的 PlayerState struct
export interface PlayerState {
  level: number;
  x: number;
  y: number;
  steps: number;
  gems: number;
  started: boolean;
}

export interface GameContractState {
  isProcessing: boolean;
  lastTxHash: string | null;
  error: string | null;
  contractAddress: string;
}

export interface GameContractActions {
  setContractAddress: (address: string) => void;
  step: (direction: Direction) => Promise<void>;
  startGame: (level: number) => Promise<void>;
  getPlayer: (address: string) => Promise<PlayerState>;
}

const INITIAL_STATE: GameContractState = {
  isProcessing: false,
  lastTxHash: null,
  error: null,
  contractAddress: '',
};

export function useGameContract(): GameContractState & GameContractActions {
  const [state, setState] = useState<GameContractState>(INITIAL_STATE);

  // 设置合约地址
  const setContractAddress = useCallback((address: string) => {
    setState(prev => ({ ...prev, contractAddress: address, error: null }));
  }, []);

  // 获取合约实例
  const getContract = useCallback(async () => {
    if (!state.contractAddress) {
      throw new Error('合约地址未设置');
    }

    // 使用 burner wallet 而不是 MetaMask
    const walletInfo = loadWalletFromStorage();
    if (!walletInfo) {
      throw new Error('未找到 burner wallet，请先创建钱包');
    }

    // 创建 provider 和 signer
    const provider = new ethers.JsonRpcProvider(MONAD_TESTNET_CONFIG.rpcUrl);
    const wallet = new ethers.Wallet(walletInfo.privateKey, provider);
    
    return new ethers.Contract(state.contractAddress, contractABI.abi, wallet);
  }, [state.contractAddress]);

  // 执行移动操作
  const step = useCallback(async (direction: Direction) => {
    console.log('step: Starting move operation, direction:', direction);
    
    setState(prev => ({
      ...prev,
      isProcessing: true,
      error: null,
      lastTxHash: null,
    }));

    try {
      const contract = await getContract();
      
      console.log('step: Calling contract step method...');
      
      // 估算gas
      let gasEstimate;
      try {
        gasEstimate = await contract.step.estimateGas(direction);
        console.log('step: Gas estimate:', gasEstimate.toString());
      } catch (gasError) {
        console.warn('Gas estimation failed, using default:', gasError);
        gasEstimate = BigInt(100000); // 默认gas限制
      }

      // 调用合约方法
      const tx = await contract.step(direction, {
        gasLimit: gasEstimate + BigInt(20000) // 增加一些余量
      });

      console.log('step: Transaction submitted:', tx.hash);
      
      setState(prev => ({
        ...prev,
        lastTxHash: tx.hash,
      }));

      // 等待交易确认
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        console.log('step: Transaction confirmed successfully');
        setState(prev => ({
          ...prev,
          isProcessing: false,
          error: null,
        }));
      } else {
        throw new Error('交易失败');
      }
    } catch (error: unknown) {
      console.error('step: Move operation failed:', error);
      
      let errorMessage = '移动操作失败';
      
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
          if (error.message.includes('invalid move')) {
            errorMessage = '无效移动：不能移动到墙或超出边界';
          } else if (error.message.includes('game not started')) {
            errorMessage = '游戏未开始，请先开始游戏';
          } else {
            errorMessage = `合约执行失败: ${error.message}`;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
      }

      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage,
      }));
      
      throw error; // 重新抛出错误，让调用者处理
    }
  }, [getContract]);

  // 开始游戏
  const startGame = useCallback(async (level: number) => {
    console.log('startGame: Starting game at level:', level);
    
    setState(prev => ({
      ...prev,
      isProcessing: true,
      error: null,
      lastTxHash: null,
    }));

    try {
      const contract = await getContract();
      
      console.log('startGame: Calling contract startGame method...');
      
      // 估算gas
      let gasEstimate;
      try {
        gasEstimate = await contract.startGame.estimateGas(level);
        console.log('startGame: Gas estimate:', gasEstimate.toString());
      } catch (gasError) {
        console.warn('Gas estimation failed, using default:', gasError);
        gasEstimate = BigInt(150000);
      }

      // 调用合约方法
      const tx = await contract.startGame(level, {
        gasLimit: gasEstimate + BigInt(30000)
      });

      console.log('startGame: Transaction submitted:', tx.hash);
      
      setState(prev => ({
        ...prev,
        lastTxHash: tx.hash,
      }));

      // 等待交易确认
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        console.log('startGame: Transaction confirmed successfully');
        setState(prev => ({
          ...prev,
          isProcessing: false,
          error: null,
        }));
      } else {
        throw new Error('交易失败');
      }
    } catch (error: unknown) {
      console.error('startGame: Start game failed:', error);
      
      let errorMessage = '开始游戏失败';
      
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
          if (error.message.includes('level does not exist')) {
            errorMessage = '关卡不存在';
          } else if (error.message.includes('already started')) {
            errorMessage = '游戏已经开始';
          } else {
            errorMessage = `合约执行失败: ${error.message}`;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
      }

      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage,
      }));
      
      throw error;
    }
  }, [getContract]);

  // 获取玩家状态（添加重试机制和回退处理）
  const getPlayer = useCallback(async (address: string): Promise<PlayerState> => {
    console.log('getPlayer: Fetching player state for address:', address);
    
    const maxRetries = 2; // 减少重试次数
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        const contract = await getContract();
        
        console.log(`getPlayer: Calling contract getPlayer method... (attempt ${attempt + 1}/${maxRetries})`);
        
        // 调用合约的只读方法
        const playerData = await contract.getPlayer(address);
        
        // 将BigInt转换为number
        const playerState: PlayerState = {
          level: Number(playerData.level),
          x: Number(playerData.x),
          y: Number(playerData.y),
          steps: Number(playerData.steps),
          gems: Number(playerData.gems),
          started: playerData.started,
        };

        console.log('getPlayer: Player state retrieved:', playerState);
        
        // 清除错误状态（如果之前有错误）
        setState(prev => ({
          ...prev,
          error: null,
        }));
        
        return playerState;
      } catch (error: unknown) {
        attempt++;
        console.error(`getPlayer: Attempt ${attempt} failed:`, error);
        
        // 如果是最后一次尝试，返回默认状态而不是抛出错误
        if (attempt >= maxRetries) {
          let errorMessage = '获取玩家状态失败，使用默认状态';
          
          if (error instanceof Error) {
            // 处理特定的错误类型
            if (error.message.includes('missing revert data') || error.message.includes('CALL_EXCEPTION')) {
              errorMessage = '合约调用失败，可能是网络不稳定';
            } else if (error.message.includes('network')) {
              errorMessage = '网络连接失败';
            }
          }

          // 只记录错误但不阻止游戏继续
          setState(prev => ({
            ...prev,
            error: errorMessage,
          }));
          
          console.warn('getPlayer: Returning default player state due to errors');
          
          // 返回默认的玩家状态，让游戏可以继续
          return {
            level: 1,
            x: 1,
            y: 1,
            steps: 0,
            gems: 0,
            started: false,
          };
        }
        
        // 如果不是最后一次尝试，等待一下再重试
        if (attempt < maxRetries) {
          const delay = 500; // 固定500ms延迟
          console.log(`getPlayer: Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // 这行不应该被执行到，但为了类型安全
    throw new Error('获取玩家状态失败：所有重试都已用尽');
  }, [getContract]);

  return {
    ...state,
    setContractAddress,
    step,
    startGame,
    getPlayer,
  };
}