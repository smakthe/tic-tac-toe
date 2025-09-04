import { component$ } from '@builder.io/qwik';
import type { QRL } from '@builder.io/qwik';
import type { GameMode, GameStatus } from '../game/types';

interface GameControlsProps {
  gameMode: GameMode;
  gameStatus: GameStatus;
  currentPlayer: number;
  onNewGame: QRL<() => void>;
  onModeChange: QRL<(mode: GameMode) => void>;
  onDifficultyChange?: QRL<(difficulty: 'easy' | 'medium' | 'hard') => void>;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export const GameControls = component$<GameControlsProps>(({ 
  gameMode, 
  gameStatus, 
  currentPlayer, 
  onNewGame, 
  onModeChange,
  onDifficultyChange,
  difficulty = 'hard'
}) => {
  const getStatusMessage = () => {
    if (gameStatus === 1) {
      return gameMode === 'ai' ? '🎉 You Win!' : '🎉 Player X Wins!';
    }
    if (gameStatus === 2) {
      return gameMode === 'ai' ? '🎉 AI Wins!' : '🎉 Player O Wins!';
    }
    if (gameStatus === 3) return '🤝 It\'s a Draw!';
    
    if (gameMode === 'ai') {
      return currentPlayer === 1 ? '🎮 Your Turn (X)' : '🤖 AI Thinking...';
    } else {
      return currentPlayer === 1 ? '❌ Player X\'s Turn' : '⭕ Player O\'s Turn';
    }
  };

  return (
    <div class="game-controls">
      <div class="status-section">
        <h2 class="game-status">{getStatusMessage()}</h2>
      </div>

      <div class="controls-section">
        <div class="mode-selector">
          <h3>Game Mode</h3>
          <div class="button-group">
            <button
              class={`mode-button ${gameMode === 'human' ? 'active' : ''}`}
              onClick$={() => onModeChange('human')}
            >
              👥 vs Human
            </button>
            <button
              class={`mode-button ${gameMode === 'ai' ? 'active' : ''}`}
              onClick$={() => onModeChange('ai')}
            >
              🤖 vs AI
            </button>
          </div>
        </div>

        {gameMode === 'ai' && onDifficultyChange && (
          <div class="difficulty-selector">
            <h3>AI Difficulty</h3>
            <div class="button-group">
              <button
                class={`difficulty-button ${difficulty === 'easy' ? 'active difficulty-easy' : ''}`}
                onClick$={() => onDifficultyChange?.('easy')}
              >
                😊 Easy
              </button>
              <button
                class={`difficulty-button ${difficulty === 'medium' ? 'active difficulty-medium' : ''}`}
                onClick$={() => onDifficultyChange?.('medium')}
              >
                😐 Medium
              </button>
              <button
                class={`difficulty-button ${difficulty === 'hard' ? 'active difficulty-hard' : ''}`}
                onClick$={() => onDifficultyChange?.('hard')}
              >
                😤 Hard
              </button>
            </div>
          </div>
        )}

        <button class="new-game-button" onClick$={onNewGame}>
          🔄 New Game
        </button>
      </div>
    </div>
  );
});