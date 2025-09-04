import type { Board, Player, Position } from './types';

export function createEmptyBoard(): Board {
  return [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];
}

export function deepCopyBoard(board: Board): Board {
  return board.map(row => [...row]);
}

export function rotate90(board: Board): Board {
  const rotated: Board = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];
  
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      rotated[j][2 - i] = board[i][j];
    }
  }
  
  return rotated;
}

export function flipHorizontal(board: Board): Board {
  const flipped: Board = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];
  
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      flipped[i][2 - j] = board[i][j];
    }
  }
  
  return flipped;
}

export function boardToString(board: Board): string {
  let result = '';
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      result += board[i][j].toString();
    }
  }
  return result;
}

export function getSymmetries(board: Board): Board[] {
  const symmetries: Board[] = [];
  let current = deepCopyBoard(board);
  
  // 4 rotations
  for (let rotation = 0; rotation < 4; rotation++) {
    symmetries.push(deepCopyBoard(current));
    current = rotate90(current);
  }
  
  // Flip and 4 more rotations
  current = flipHorizontal(board);
  for (let rotation = 0; rotation < 4; rotation++) {
    symmetries.push(deepCopyBoard(current));
    current = rotate90(current);
  }
  
  return symmetries;
}

export function getCanonicalForm(board: Board): { canonical: Board; hash: string } {
  const symmetries = getSymmetries(board);
  let canonical = deepCopyBoard(board);
  let minHash = boardToString(board);
  
  for (const sym of symmetries) {
    const symHash = boardToString(sym);
    if (symHash < minHash) {
      minHash = symHash;
      canonical = deepCopyBoard(sym);
    }
  }
  
  return { canonical, hash: minHash };
}

export function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < 3 && col >= 0 && col < 3;
}

export function isCellEmpty(board: Board, row: number, col: number): boolean {
  return isValidPosition(row, col) && board[row][col] === 0;
}

export function makeMove(board: Board, position: Position, player: Player): Board {
  if (!isCellEmpty(board, position.row, position.col)) {
    throw new Error('Invalid move: cell is not empty');
  }
  
  const newBoard = deepCopyBoard(board);
  newBoard[position.row][position.col] = player;
  return newBoard;
}