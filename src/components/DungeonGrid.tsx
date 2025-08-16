import { Cell } from '@/types/game';

interface DungeonGridProps {
  grid: Cell[][];
}

export const DungeonGrid = ({ grid }: DungeonGridProps) => {
  const getCellClass = (cell: Cell) => {
    let baseClass = 'dungeon-cell ';
    
    switch (cell.type) {
      case 'wall':
        baseClass += 'cell-wall';
        break;
      case 'floor':
        baseClass += 'cell-floor';
        break;
      case 'treasure':
        if (cell.treasureCollected) {
          baseClass += 'cell-floor';
        } else {
          baseClass += 'cell-treasure';
        }
        break;
      case 'portal':
        baseClass += 'cell-portal';
        break;
    }
    
    return baseClass;
  };

  const getCellSymbol = (cell: Cell) => {
    if (cell.hasPlayer) return '';
    
    switch (cell.type) {
      case 'wall':
        return '█';
      case 'floor':
        return '';
      case 'treasure':
        return cell.treasureCollected ? '' : '★';
      case 'portal':
        return '◉';
      default:
        return '';
    }
  };

  return (
    <div className="nes-container is-dark with-title">
      <p className="title text-white">DUNGEON LEVEL</p>
      <div className="dungeon-grid">
        {grid.flat().map((cell, index) => (
          <div
            key={index}
            className={getCellClass(cell)}
          >
            {cell.hasPlayer && <div className="player-sprite" />}
            <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
              {getCellSymbol(cell)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};