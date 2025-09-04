import { component$, useStore, useSignal, useTask$, $ } from '@builder.io/qwik';
import type { GameState, Position, GameMode } from '../game/types';
import { createInitialState, makeGameMove, isGameOver } from '../game/game-logic';
import { getBestMove } from '../game/ai-engine';
import { GameBoard } from './game-board';
import { GameControls } from './game-controls';
import { GameStats } from './game-stats';

export const TicTacToe = component$(() => {
  const gameState = useStore<GameState>(createInitialState());
  const gameMode = useSignal<GameMode>('human');
  const difficulty = useSignal<'easy' | 'medium' | 'hard'>('hard');
  const isAiThinking = useSignal(false);
  const wins = useStore({ x: 0, o: 0, draws: 0 });
  const winningLine = useSignal<Position[]>([]);

  // AI move task
  useTask$(async ({ track }) => {
    track(() => gameState.currentPlayer);
    track(() => gameMode.value);
    track(() => gameState.gameStatus);

    if (gameMode.value === 'ai' && 
        gameState.currentPlayer === 2 && 
        !isGameOver(gameState) && 
        !isAiThinking.value) {
      
      isAiThinking.value = true;
      
      // Add a small delay to show AI thinking
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        const aiMove = getBestMove(gameState, difficulty.value);
        const newState = makeGameMove(gameState, aiMove);
        
        // Update game state
        gameState.board = newState.board;
        gameState.currentPlayer = newState.currentPlayer;
        gameState.gameStatus = newState.gameStatus;
        gameState.moveHistory = newState.moveHistory;
        gameState.depth = newState.depth;
        
        // Check for winning line
        if (newState.gameStatus !== 0) {
          updateWinningLine();
          updateWinStats(newState.gameStatus);
        }
      } catch (error) {
        console.error('AI move error:', error);
      } finally {
        isAiThinking.value = false;
      }
    }
  });

  const handleCellClick = $((position: Position) => {
    if (isGameOver(gameState) || isAiThinking.value) return;
    
    try {
      const newState = makeGameMove(gameState, position);
      gameState.board = newState.board;
      gameState.currentPlayer = newState.currentPlayer;
      gameState.gameStatus = newState.gameStatus;
      gameState.moveHistory = newState.moveHistory;
      gameState.depth = newState.depth;
      
      // Check for winning line
      if (newState.gameStatus !== 0) {
        updateWinningLine();
        updateWinStats(newState.gameStatus);
      }
    } catch (error) {
      console.error('Move error:', error);
    }
  });

  const updateWinningLine = $(() => {
    const board = gameState.board;
    
    // Check rows
    for (let i = 0; i < 3; i++) {
      if (board[i][0] !== 0 && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
        winningLine.value = [
          { row: i, col: 0 },
          { row: i, col: 1 },
          { row: i, col: 2 }
        ];
        return;
      }
    }
    
    // Check columns
    for (let j = 0; j < 3; j++) {
      if (board[0][j] !== 0 && board[0][j] === board[1][j] && board[1][j] === board[2][j]) {
        winningLine.value = [
          { row: 0, col: j },
          { row: 1, col: j },
          { row: 2, col: j }
        ];
        return;
      }
    }
    
    // Check diagonals
    if (board[0][0] !== 0 && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
      winningLine.value = [
        { row: 0, col: 0 },
        { row: 1, col: 1 },
        { row: 2, col: 2 }
      ];
      return;
    }
    
    if (board[0][2] !== 0 && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
      winningLine.value = [
        { row: 0, col: 2 },
        { row: 1, col: 1 },
        { row: 2, col: 0 }
      ];
      return;
    }
    
    winningLine.value = [];
  });

  const updateWinStats = $((gameStatus: number) => {
    if (gameStatus === 1) wins.x++;
    else if (gameStatus === 2) wins.o++;
    else if (gameStatus === 3) wins.draws++;
  });

  const handleNewGame = $(() => {
    const newState = createInitialState();
    gameState.board = newState.board;
    gameState.currentPlayer = newState.currentPlayer;
    gameState.gameStatus = newState.gameStatus;
    gameState.moveHistory = newState.moveHistory;
    gameState.depth = newState.depth;
    winningLine.value = [];
    isAiThinking.value = false;
  });

  const handleModeChange = $((mode: GameMode) => {
    gameMode.value = mode;
    handleNewGame();
  });

  const handleDifficultyChange = $((diff: 'easy' | 'medium' | 'hard') => {
    difficulty.value = diff;
    if (gameMode.value === 'ai') {
      handleNewGame();
    }
  });

  return (
    <div class="tic-tac-toe-game">
      <header class="game-header">
        <h1>Tic Tac Toe</h1>
        <p class="game-subtitle">Challenge yourself against AI or play with friends!</p>
      </header>

      <div class="game-container">
        <div class="game-main">
          <GameControls
            gameMode={gameMode.value}
            gameStatus={gameState.gameStatus}
            currentPlayer={gameState.currentPlayer}
            onNewGame={handleNewGame}
            onModeChange={handleModeChange}
            onDifficultyChange={handleDifficultyChange}
            difficulty={difficulty.value}
          />
          
          <GameBoard
            board={gameState.board}
            onCellClick={handleCellClick}
            disabled={isAiThinking.value || isGameOver(gameState)}
            winningLine={winningLine.value}
          />
        </div>

        <div class="game-sidebar">
          <GameStats
            wins={wins}
          />
        </div>
      </div>
    </div>
  );
});