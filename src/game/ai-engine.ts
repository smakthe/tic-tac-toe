import type { GameState, GameTreeNode, Position } from './types';
import { 
  createInitialState, 
  isGameOver, 
  getLegalMovesOrdered, 
  makeGameMove, 
  evaluateTerminalState,
  evaluatePosition 
} from './game-logic';
import { getCanonicalForm } from './board-utils';

// Global transposition table to avoid recomputing identical positions
const transpositionTable = new Map<string, number>();

export function buildOptimizedGameTree(): GameTreeNode {
  const root: GameTreeNode = {
    state: createInitialState(),
    children: [],
    minimax_value: 0,
    alpha: -Infinity,
    beta: Infinity
  };
  
  // Clear transposition table
  transpositionTable.clear();
  
  expandNodeOptimized(root, -Infinity, Infinity);
  return root;
}

export function expandNodeOptimized(node: GameTreeNode, alpha: number, beta: number): number {
  const state = node.state;
  
  // Check transposition table first
  const { hash } = getCanonicalForm(state.board);
  const tableKey = `${hash}_${state.currentPlayer}_${state.depth}`;
  
  if (transpositionTable.has(tableKey)) {
    node.minimax_value = transpositionTable.get(tableKey)!;
    return node.minimax_value;
  }
  
  // Base case: terminal position
  if (isGameOver(state)) {
    const value = evaluateTerminalState(state, state.currentPlayer);
    node.minimax_value = value;
    transpositionTable.set(tableKey, value);
    return value;
  }
  
  // Generate moves with move ordering heuristics
  const possibleMoves = getLegalMovesOrdered(state);
  node.children = [];
  
  if (state.currentPlayer === 1) { // X maximizing
    let maxEval = -Infinity;
    for (const move of possibleMoves) {
      const childState = makeGameMove(state, move);
      const childNode: GameTreeNode = {
        state: childState,
        children: [],
        parent: node,
        minimax_value: 0,
        alpha: alpha,
        beta: beta
      };
      
      const evaluation = expandNodeOptimized(childNode, alpha, beta);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      
      node.children.push(childNode);
      
      // Alpha-beta pruning
      if (beta <= alpha) {
        break; // Beta cutoff
      }
    }
    
    node.minimax_value = maxEval;
  } else { // O minimizing
    let minEval = Infinity;
    for (const move of possibleMoves) {
      const childState = makeGameMove(state, move);
      const childNode: GameTreeNode = {
        state: childState,
        children: [],
        parent: node,
        minimax_value: 0,
        alpha: alpha,
        beta: beta
      };
      
      const evaluation = expandNodeOptimized(childNode, alpha, beta);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      
      node.children.push(childNode);
      
      // Alpha-beta pruning
      if (beta <= alpha) {
        break; // Alpha cutoff
      }
    }
    
    node.minimax_value = minEval;
  }
  
  // Store in transposition table
  transpositionTable.set(tableKey, node.minimax_value);
  return node.minimax_value;
}

export function searchDepthLimited(state: GameState, maxDepth: number, alpha: number, beta: number): number {
  if (maxDepth === 0 || isGameOver(state)) {
    return evaluatePosition(state);
  }
  
  const { hash } = getCanonicalForm(state.board);
  const tableKey = `${hash}_${maxDepth}`;
  if (transpositionTable.has(tableKey)) {
    return transpositionTable.get(tableKey)!;
  }
  
  const moves = getLegalMovesOrdered(state);
  
  if (state.currentPlayer === 1) { // maximizing
    let maxEval = -Infinity;
    for (const move of moves) {
      const newState = makeGameMove(state, move);
      const evaluation = searchDepthLimited(newState, maxDepth - 1, alpha, beta);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) {
        break;
      }
    }
    
    transpositionTable.set(tableKey, maxEval);
    return maxEval;
  } else { // minimizing
    let minEval = Infinity;
    for (const move of moves) {
      const newState = makeGameMove(state, move);
      const evaluation = searchDepthLimited(newState, maxDepth - 1, alpha, beta);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) {
        break;
      }
    }
    
    transpositionTable.set(tableKey, minEval);
    return minEval;
  }
}

export function getBestMove(state: GameState, difficulty: 'easy' | 'medium' | 'hard' = 'hard'): Position {
  const moves = getLegalMovesOrdered(state);
  
  if (moves.length === 0) {
    throw new Error('No legal moves available');
  }
  
  // Easy mode: random move with some preference for center/corners
  if (difficulty === 'easy') {
    const weightedMoves = moves.flatMap(move => {
      const weight = move.row === 1 && move.col === 1 ? 3 : // center
                   (move.row % 2 === 0 && move.col % 2 === 0) ? 2 : // corners
                   1; // edges
      return Array(weight).fill(move);
    });
    return weightedMoves[Math.floor(Math.random() * weightedMoves.length)];
  }
  
  // Medium mode: limited depth search
  const searchDepth = difficulty === 'medium' ? 5 : 9;
  
  let bestMove = moves[0];
  let bestValue = state.currentPlayer === 1 ? -Infinity : Infinity;
  
  for (const move of moves) {
    const newState = makeGameMove(state, move);
    const value = searchDepthLimited(newState, searchDepth - 1, -Infinity, Infinity);
    
    if (state.currentPlayer === 1 && value > bestValue) {
      bestValue = value;
      bestMove = move;
    } else if (state.currentPlayer === 2 && value < bestValue) {
      bestValue = value;
      bestMove = move;
    }
  }
  
  return bestMove;
}

export function calculateOptimalStrategy(): Map<string, Position> {
  // Build strategy table for all positions
  const strategyTable = new Map<string, Position>();
  const root = buildOptimizedGameTree();
  
  extractOptimalMoves(root, strategyTable);
  return strategyTable;
}

function extractOptimalMoves(node: GameTreeNode, strategyTable: Map<string, Position>): void {
  if (isGameOver(node.state)) {
    return;
  }
  
  const { hash } = getCanonicalForm(node.state.board);
  const key = `${hash}_${node.state.currentPlayer}`;
  
  // Find child with best minimax value
  let bestChild: GameTreeNode | null = null;
  let bestValue = node.state.currentPlayer === 1 ? -Infinity : Infinity;
  
  for (const child of node.children) {
    if (node.state.currentPlayer === 1 && child.minimax_value > bestValue) {
      bestValue = child.minimax_value;
      bestChild = child;
    } else if (node.state.currentPlayer === 2 && child.minimax_value < bestValue) {
      bestValue = child.minimax_value;
      bestChild = child;
    }
  }
  
  // Store optimal move
  if (bestChild) {
    const optimalMove = getMoveDifference(node.state, bestChild.state);
    strategyTable.set(key, optimalMove);
  }
  
  // Recursively extract from children
  for (const child of node.children) {
    extractOptimalMoves(child, strategyTable);
  }
}

function getMoveDifference(oldState: GameState, newState: GameState): Position {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (oldState.board[i][j] !== newState.board[i][j]) {
        return { row: i, col: j };
      }
    }
  }
  throw new Error('No move difference found between states');
}