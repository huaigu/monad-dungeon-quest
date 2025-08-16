# 魔纳地牢 (Monad Dungeon Quest)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)](https://typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-green)](https://vitejs.dev/)

一款基于 **Monad 区块链**的复古像素风格地牢探险游戏。收集宝物，穿越传送门，在链上记录你的冒险历程！

![Monad Dungeon Quest](https://img.shields.io/badge/Game-Monad_Dungeon_Quest-purple)

## 🎮 游戏介绍

**魔纳地牢**是一款结合区块链技术的复古像素风格地牢探险游戏。玩家需要在 10 层神秘地牢中收集宝物，找到传送门，完成终极挑战。每次移动、收集和传送都会记录在 Monad 区块链上，确保游戏进度的透明性和永久性。

### 🎯 游戏目标
- 🏛️ 探索 10 层神秘地牢
- 💎 收集所有宝物解锁传送门
- 📦 开启宝箱获得额外钻石奖励
- 🏆 完成全部关卡获得最终胜利

### 🕹️ 游戏操作
- **移动**: `WASD` 键或方向键控制角色移动
- **传送**: 站在传送门上按 `空格键` 进入下一层
- **收集**: 自动收集踩到的宝物和宝箱

## ⛓️ 区块链集成

### 智能合约
本游戏集成了部署在 **Monad 测试网**上的智能合约，实现真正的链上游戏体验：

**合约仓库**: [monad-dungeon-quest-contracts](https://github.com/TheDAS-designer/monad-dungeon-quest-contracts)

### 区块链特性
- ✅ **链上游戏状态**: 玩家位置、等级、钻石数量等实时同步
- ✅ **Gas 优化移动验证**: 本地验证移动有效性，避免无效交易
- ✅ **Burner Wallet**: 轻量级临时钱包，降低使用门槛
- ✅ **实时状态同步**: 与合约状态实时同步，确保数据一致性

### 网络信息
- **网络**: Monad Testnet
- **Chain ID**: 10143
- **货币**: MON
- **区块浏览器**: https://testnet.monadexplorer.com

## 🚀 快速开始

### 前置要求
- Node.js 18+ 
- npm 或 yarn
- 少量 MON 测试币（用于 Gas 费用）

### 安装与运行

```bash
# 克隆项目
git clone https://github.com/huaigu/monad-dungeon-quest.git
cd monad-dungeon-quest

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 环境变量配置

创建 `.env` 文件并配置智能合约地址：

```env
VITE_CONTRACT_ADDRESS=your_contract_address_here
```

## 🎨 技术架构

### 前端技术栈
- **⚛️ React 18**: 现代化 React 应用框架
- **📘 TypeScript**: 类型安全的开发体验
- **⚡ Vite**: 极速构建工具
- **🎨 Tailwind CSS**: 原子化 CSS 框架
- **🎮 NES.css**: 复古像素风格样式库
- **🧩 shadcn/ui**: 现代化 UI 组件库

### 区块链技术
- **🔗 Ethers.js 6**: 以太坊交互库
- **🔐 BIP39**: 助记词生成和验证
- **💰 Burner Wallet**: 临时钱包方案

### 状态管理
- **🪝 React Hooks**: 原生状态管理
- **🔄 TanStack Query**: 服务端状态同步
- **🎯 Custom Hooks**: 游戏逻辑封装

## 🏗️ 项目结构

```
src/
├── components/           # UI 组件
│   ├── ui/              # shadcn 基础组件
│   ├── DungeonGrid.tsx  # 地牢网格显示
│   ├── GameUI.tsx       # 游戏界面
│   └── WalletSetup.tsx  # 钱包设置
├── hooks/               # 自定义 Hooks
│   ├── useGameContract.ts   # 智能合约交互
│   ├── useOnChainGameState.ts # 链上游戏状态
│   ├── useWallet.ts     # 钱包管理
│   └── useBalance.ts    # 余额管理
├── pages/               # 页面组件
│   ├── Landing.tsx      # 首页
│   ├── Index.tsx        # 游戏页面
│   └── Admin.tsx        # 管理页面
├── types/               # 类型定义
├── utils/               # 工具函数
└── public/
    └── dungeonData.json # 地牢数据
```

## 🎯 游戏机制

### 地牢系统
- **网格大小**: 10x10 格子
- **总层数**: 10 层
- **地牢类型**: 预生成随机布局

### 格子类型编码
| 数字 | 类型 | 描述 | 视觉效果 |
|------|------|------|----------|
| `0` | 地板 (floor) | 可移动区域 | 灰色背景 |
| `1` | 墙壁 (wall) | 不可通过障碍 | 深灰色背景 |
| `2` | 宝物 (treasure) | 必收集钻石 | 黄色背景 + ◆ |
| `3` | 传送门 (portal) | 下一层入口 | 紫色背景 + ⌂ |
| `4` | 玩家起始点 (player) | 玩家出生位置 | 玩家头像 |
| `5` | 宝箱 (chest) | 额外奖励 | 棕色背景 + 📦 |

### 奖励系统
- **💎 宝物**: 固定 1 颗钻石 (3 积分)
- **📦 宝箱**: 随机 1-5 颗钻石 (3-15 积分)
- **🏆 完成条件**: 收集当前层所有宝物后可使用传送门

## 🛠️ 开发指南

### 本地开发
```bash
# 启动开发服务器 (localhost:8080)
npm run dev

# 类型检查
npm run lint

# 构建开发版本
npm run build:dev
```

### 地牢数据生成
使用脚本重新生成地牢布局：
```bash
node scripts/generateDungeonData.js
```

### 智能合约部署
请参考合约仓库的部署指南：
[monad-dungeon-quest-contracts](https://github.com/TheDAS-designer/monad-dungeon-quest-contracts)

## 🎮 游戏特性

### 链上游戏体验
- ⛓️ **完全链上**: 游戏状态完全存储在区块链上
- 🔒 **透明公平**: 所有操作都可在区块浏览器中验证
- 💰 **Gas 优化**: 智能的本地验证减少无效交易

### 用户体验优化
- 🚀 **静默刷新**: 余额更新不干扰游戏流程
- ⚡ **即时反馈**: 乐观更新提供流畅体验
- 🎨 **复古风格**: NES.css 带来经典像素游戏感觉
- 📱 **响应式设计**: 支持桌面和移动设备

### 钱包集成
- 🔑 **Burner Wallet**: 一键创建临时钱包
- 🔐 **安全存储**: 本地加密存储私钥
- 💰 **余额管理**: 实时显示 MON 余额
- 📋 **私钥导出**: 支持导出到其他钱包

## 📚 相关资源

- **🎮 游戏合约**: [monad-dungeon-quest-contracts](https://github.com/TheDAS-designer/monad-dungeon-quest-contracts)
- **⛓️ Monad 官网**: [monad.xyz](https://monad.xyz)
- **🔍 区块浏览器**: [testnet.monadexplorer.com](https://testnet.monadexplorer.com)
- **🎨 NES.css**: [nostalgic-css.github.io/NES.css](https://nostalgic-css.github.io/NES.css/)

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建特性分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🎯 开发路线图

- [ ] 🏆 成就系统
- [ ] 🎵 背景音乐和音效
- [ ] 👥 多人游戏模式
- [ ] 🏪 NFT 装备系统
- [ ] 📊 链上排行榜
- [ ] 🎲 随机地牢生成器

---

<div align="center">

**🚀 开始你的魔纳地牢冒险之旅！**

Made with ❤️ for the Monad ecosystem

</div>