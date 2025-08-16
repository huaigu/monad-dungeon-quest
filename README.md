# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/9c18a08c-a6cb-41fa-8720-7b177bb18835

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/9c18a08c-a6cb-41fa-8720-7b177bb18835) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/9c18a08c-a6cb-41fa-8720-7b177bb18835) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## 魔纳地牢游戏

这是一个基于 React 的地牢探索游戏，玩家需要在10层地牢中收集宝物并找到传送门。

### 地牢格子类型编码

游戏中的地牢数据使用数字编码表示不同的格子类型：

| 数字 | 类型 | 描述 | 显示 |
|------|------|------|------|
| **0** | 地板 (floor) | 可移动的空地 | 灰色背景 |
| **1** | 墙壁 (wall) | 不可通过的障碍 | 深灰色背景 |
| **2** | 宝物 (treasure) | 需要收集的钻石 | 黄色背景 + ◆ |
| **3** | 传送门 (portal) | 进入下一层的入口 | 紫色背景 + ⌂ |
| **4** | 玩家起始位置 (player) | 玩家的初始位置 | 玩家头像 |
| **5** | 宝箱 (chest) | 随机钻石奖励 | 棕色背景 + 📦 |

### 钻石系统

- **宝物 (2)**: 固定 **1颗钻石** 
- **宝箱 (5)**: 随机 **0-10颗钻石**

### 游戏规则

- 使用 WASD 或方向键控制玩家移动
- 必须收集当前层的所有宝物才能使用传送门
- 宝箱为可选收集物品，可获得额外钻石
- 完成全部10层即可获胜
- 每层都有3-4个宝物和1-2个宝箱

### 地牢数据文件

地牢布局数据存储在 `public/dungeonData.json` 中，包含：
- 10层预生成的地牢数据
- 每层为10x10网格（100个数字的一维数组）
- 玩家起始位置、传送门位置信息
- 宝物位置和钻石信息（固定1颗）
- 宝箱位置和随机钻石信息（0-10颗）

### 数据生成

使用 `scripts/generateDungeonData.js` 脚本重新生成地牢数据：

```bash
node scripts/generateDungeonData.js
```

脚本会自动：
- 生成具有连通性的地牢布局
- 确保所有宝物和宝箱都可到达
- 为每个宝箱分配随机钻石数量（0-10颗）
- 验证玩家起始位置到传送门的可达性
