import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="nes-text is-primary text-4xl md:text-6xl mb-4 pixel-font">
            魔纳地牢
          </h1>
          <p className="nes-text text-lg mb-2">MONAD DUNGEON</p>
          <p className="nes-text is-warning">复古像素风格区块链冒险游戏</p>
        </div>

        {/* Game Introduction */}
        <div className="nes-container is-dark with-title mb-6">
          <p className="title text-white">游戏介绍</p>
          <div className="space-y-3">
            <p className="nes-text">
              欢迎来到魔纳地牢！这是一款结合区块链技术的复古像素风格地牢探险游戏。
            </p>
            <p className="nes-text">
              在神秘的地下城中收集宝物，穿越传送门，完成10层挑战获得最终胜利！
            </p>
          </div>
        </div>

        {/* Game Features */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="nes-container is-dark with-title">
            <p className="title text-white">游戏玩法</p>
            <ul className="nes-text space-y-2 text-sm">
              <li>• 使用 WASD 或方向键控制角色移动</li>
              <li>• 收集每层地牢中的所有宝物</li>
              <li>• 找到传送门进入下一层挑战</li>
              <li>• 避开墙壁，规划最佳路径</li>
              <li>• 完成全部10层获得最终胜利</li>
            </ul>
          </div>

          <div className="nes-container is-dark with-title">
            <p className="title text-white">区块链特色</p>
            <ul className="nes-text space-y-2 text-sm">
              <li>• 基于 Monad 区块链技术</li>
              <li>• 游戏进度上链记录</li>
              <li>• 宝物收集NFT化</li>
              <li>• 去中心化游戏体验</li>
              <li>• 透明公平的游戏机制</li>
            </ul>
          </div>
        </div>

        {/* Getting Started */}
        <div className="nes-container is-dark with-title mb-8">
          <p className="title text-white">开始游戏</p>
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="nes-container is-rounded">
                <h3 className="nes-text is-primary mb-2">1. 创建钱包</h3>
                <p className="nes-text text-xs">创建临时钱包用于游戏</p>
              </div>
              <div className="nes-container is-rounded">
                <h3 className="nes-text is-success mb-2">2. 充值Gas</h3>
                <p className="nes-text text-xs">为钱包充值用于交易费用</p>
              </div>
              <div className="nes-container is-rounded">
                <h3 className="nes-text is-warning mb-2">3. 开始冒险</h3>
                <p className="nes-text text-xs">进入地牢开始你的探险</p>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <p className="nes-text is-error text-sm">
                注意：您需要创建一个临时钱包并充值少量资金作为Gas费用来开始游戏
              </p>
              
              <div className="space-x-4">
                <Button 
                  variant="default"
                  size="lg"
                  onClick={() => navigate('/game')}
                  className="nes-btn is-primary pixel-font"
                >
                  创建钱包 & 开始游戏
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="nes-text text-xs opacity-75">
            Powered by Monad Blockchain • Made with ❤️ using NES.css
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;