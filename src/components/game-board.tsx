import { component$, useSignal, $ } from '@builder.io/qwik';
import type { QRL } from '@builder.io/qwik';
import type { Board, Position, Player } from '../game/types';

interface GameBoardProps {
  board: Board;
  onCellClick: QRL<(position: Position) => void>;
  disabled?: boolean;
  winningLine?: Position[];
}

export const GameBoard = component$<GameBoardProps>(({ board, onCellClick, disabled = false, winningLine = [] }) => {
  const hoveredCell = useSignal<string | null>(null);

  const handleCellHover = $((row: number, col: number, isHovering: boolean) => {
    if (!disabled && board[row][col] === 0) {
      hoveredCell.value = isHovering ? `${row}-${col}` : null;
    }
  });

  const getCellContent = (player: Player) => {
    if (player === 1) return 'X';
    if (player === 2) return 'O';
    return '';
  };

  const getCellClass = (row: number, col: number) => {
    const baseClass = 'cell';
    const player = board[row][col];
    const isWinning = winningLine.some(pos => pos.row === row && pos.col === col);
    const isHovered = hoveredCell.value === `${row}-${col}`;
    const isEmpty = player === 0;
    const isDisabled = disabled;

    const classes = [baseClass];
    
    if (player === 1) classes.push('cell-x');
    if (player === 2) classes.push('cell-o');
    if (isWinning) classes.push('cell-winning');
    if (isHovered && isEmpty && !isDisabled) classes.push('cell-hover');
    if (isEmpty && !isDisabled) classes.push('cell-empty');
    if (isDisabled) classes.push('cell-disabled');

    return classes.join(' ');
  };

  return (
    <div class="game-board">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} class="board-row">
          {row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              class={getCellClass(rowIndex, colIndex)}
              onClick$={() => onCellClick({ row: rowIndex, col: colIndex })}
              onMouseEnter$={() => handleCellHover(rowIndex, colIndex, true)}
              onMouseLeave$={() => handleCellHover(rowIndex, colIndex, false)}
              disabled={disabled || cell !== 0}
              aria-label={`Cell ${rowIndex + 1}, ${colIndex + 1}`}
            >
              <span class="cell-content">{getCellContent(cell)}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
});