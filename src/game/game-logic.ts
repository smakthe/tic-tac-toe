import type { Board, Player, GameStatus, Position, GameState } from './types';
import { createEmptyBoard, isCellEmpty } from './board-utils';

export function createInitialState(): GameState {
  return {
    board: createEmptyBoard(),
    currentPlayer: 1, // X starts first
    gameStatus: 0, // ongoing
    moveHistory: [],
    depth: 0
  };
}

export function checkWinner(board: Board): GameStatus {
  // Check rows
  for (let i = 0; i < 3; i++) {
    if (board[i][0] !== 0 && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
      return board[i][0] as GameStatus;
    }
  }
  
  // Check columns
  for (let j = 0; j < 3; j++) {
    if (board[0][j] !== 0 && board[0][j] === board[1][j] && board[1][j] === board[2][j]) {
      return board[0][j] as GameStatus;
    }
  }
  
  // Check diagonals
  if (board[0][0] !== 0 && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
    return board[0][0] as GameStatus;
  }
  
  if (board[0][2] !== 0 && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
    return board[0][2] as GameStatus;
  }
  
  // Check for draw
  let hasEmptyCell = false;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] === 0) {
        hasEmptyCell = true;
        break;
      }
    }
    if (hasEmptyCell) break;
  }
  
  return hasEmptyCell ? 0 : 3; // 0 = ongoing, 3 = draw
}

export function isGameOver(state: GameState): boolean {
  return state.gameStatus !== 0;
}

export function getLegalMoves(state: GameState): Position[] {
  const moves: Position[] = [];
  
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (isCellEmpty(state.board, i, j)) {
        moves.push({ row: i, col: j });
      }
    }
  }
  
  return moves;
}

export function getLegalMovesOrdered(state: GameState): Position[] {
  const moves = getLegalMoves(state);
  
  // Priority order: center (1,1), corners, edges
  const priorities = new Map<string, number>();
  priorities.set('1,1', 3); // center
  priorities.set('0,0', 2); // corners
  priorities.set('0,2', 2);
  priorities.set('2,0', 2);
  priorities.set('2,2', 2);
  priorities.set('0,1', 1); // edges
  priorities.set('1,0', 1);
  priorities.set('1,2', 1);
  priorities.set('2,1', 1);
  
  // Sort moves by priority (highest first)
  return moves.sort((a, b) => {
    const priorityA = priorities.get(`${a.row},${a.col}`) || 0;
    const priorityB = priorities.get(`${b.row},${b.col}`) || 0;
    return priorityB - priorityA;
  });
}

export function makeGameMove(state: GameState, position: Position): GameState {
  if (!isCellEmpty(state.board, position.row, position.col)) {
    throw new Error('Invalid move: cell is not empty');
  }
  
  const newBoard = [...state.board.map(row => [...row])];
  newBoard[position.row][position.col] = state.currentPlayer;
  
  const newState: GameState = {
    board: newBoard,
    currentPlayer: state.currentPlayer === 1 ? 2 : 1,
    gameStatus: checkWinner(newBoard),
    moveHistory: [...state.moveHistory, position],
    depth: state.depth + 1
  };
  
  return newState;
}

export function evaluateTerminalState(state: GameState, player: Player): number {
  if (state.gameStatus === player) {
    return 1; // Win
  } else if (state.gameStatus === 3) {
    return 0; // Draw
  } else {
    return -1; // Loss
  }
}

export function evaluatePosition(state: GameState): number {
  const winner = checkWinner(state.board);
  
  if (winner === 1) return 1;   // X wins
  if (winner === 2) return -1;  // O wins
  if (winner === 3) return 0;   // Draw
  
  // For non-terminal positions, return 0 (neutral)
  return 0;
}

export function getMoveDifference(oldState: GameState, newState: GameState): Position {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (oldState.board[i][j] !== newState.board[i][j]) {
        return { row: i, col: j };
      }
    }
  }
  throw new Error('No move difference found between states');
}