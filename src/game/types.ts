export type Player = 0 | 1 | 2; // 0 = empty, 1 = X, 2 = O
export type GameStatus = 0 | 1 | 2 | 3; // 0 = ongoing, 1 = X wins, 2 = O wins, 3 = draw
export type Board = Player[][];
export type Position = { row: number; col: number };
export type GameMode = 'human' | 'ai';

export interface GameState {
  board: Board;
  currentPlayer: Player;
  gameStatus: GameStatus;
  moveHistory: Position[];
  depth: number;
  canonicalHash?: string;
}

export interface GameTreeNode {
  state: GameState;
  children: GameTreeNode[];
  parent?: GameTreeNode;
  minimax_value: number;
  alpha: number;
  beta: number;
}

export interface TreeAnalysis {
  totalNodes: number;
  uniquePositions: number;
  pruningEfficiency: number;
  memoryUsage: number;
}