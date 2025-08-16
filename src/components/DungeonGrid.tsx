import { Cell } from '@/types/game';
import { DiamondIcon, PortalIcon, PlayerIcon } from '@/components/GameIcons';

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

  const getCellContent = (cell: Cell) => {
    if (cell.hasPlayer) {
      return <PlayerIcon className="text-white" size={20} />;
    }
    
    switch (cell.type) {
      case 'treasure':
        if (!cell.treasureCollected) {
          return <DiamondIcon className="text-yellow-100" size={18} />;
        }
        return null;
      case 'portal':
        return <PortalIcon className="text-purple-100" size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="nes-container is-dark with-title">
      <p className="title text-white">地牢层数</p>
      <div className="dungeon-grid">
        {grid.flat().map((cell, index) => (
          <div
            key={index}
            className={getCellClass(cell)}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              {getCellContent(cell)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};