import { useEffect } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right';

interface UseKeyboardProps {
  onMove: (direction: Direction) => void;
  onActivatePortal?: () => void;
  enabled?: boolean;
}

export const useKeyboard = ({ onMove, onActivatePortal, enabled = true }: UseKeyboardProps) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      // Prevent default behavior for game keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', ' '].includes(event.key)) {
        event.preventDefault();
      }

      switch (event.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          onMove('up');
          break;
        case 'arrowdown':
        case 's':
          onMove('down');
          break;
        case 'arrowleft':
        case 'a':
          onMove('left');
          break;
        case 'arrowright':
        case 'd':
          onMove('right');
          break;
        case ' ':
          if (onActivatePortal) {
            onActivatePortal();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onMove, onActivatePortal, enabled]);
};