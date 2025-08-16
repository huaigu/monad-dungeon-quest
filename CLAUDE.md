# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication Guidelines
- 总是用中文回复用户的问题

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (port 8080)
npm run dev

# Build for production
npm run build

# Build for development
npm run build:dev

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Project Architecture

This is a React-based dungeon exploration game using TypeScript and Vite. The architecture follows a modern React pattern:

### Core Structure
- **Game Logic**: Centralized in `src/hooks/useGameState.ts` - manages player movement, treasure collection, level progression
- **UI Components**: Split between game-specific components (`DungeonGrid.tsx`, `GameUI.tsx`) and shadcn-ui components
- **Game State**: TypeScript interfaces in `src/types/game.ts` define the core data structures
- **Level Generation**: `src/utils/levelGenerator.ts` handles procedural dungeon creation

### Key Patterns
- Game state is managed through React hooks with the main state in `useGameState.ts`
- Player input handled via `useKeyboard.ts` hook for WASD/arrow key movement
- Level progression system with 10 total levels, each requiring treasure collection before portal access
- Chinese UI text throughout the application

### Technical Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + NES.css for retro styling
- **UI Components**: shadcn-ui + Radix UI primitives
- **State Management**: React hooks (no external state library)
- **Routing**: React Router DOM
- **Build Tool**: Vite with SWC for fast compilation

### Game Mechanics
- 10x10 grid dungeons with procedurally generated layouts
- Four cell types: wall, floor, treasure, portal
- Player must collect all treasures before accessing the portal
- 10 levels total with completion celebration

The codebase uses path aliases (`@/` maps to `./src/`) and follows TypeScript strict mode conventions.