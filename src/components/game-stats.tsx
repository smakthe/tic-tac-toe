import { component$ } from '@builder.io/qwik';
import type { QRL } from '@builder.io/qwik';

interface GameStatsProps {
  wins: { x: number; o: number; draws: number };
  onResetStats: QRL<() => void>;
}

export const GameStats = component$<GameStatsProps>(({ wins, onResetStats }) => {
  const totalGames = wins.x + wins.o + wins.draws;
  const winPercentageX = totalGames > 0 ? Math.round((wins.x / totalGames) * 100) : 0;
  const winPercentageO = totalGames > 0 ? Math.round((wins.o / totalGames) * 100) : 0;
  const drawPercentage = totalGames > 0 ? Math.round((wins.draws / totalGames) * 100) : 0;

  return (
    <div class="game-stats">
      <div class="stats-header">
        <h3>📊 Game Statistics</h3>
      </div>

      <div class="stats-grid">
        <div class="stat-card stat-x">
          <div class="stat-icon">❌</div>
          <div class="stat-content">
            <div class="stat-number">{wins.x}</div>
            <div class="stat-label">X Wins</div>
            <div class="stat-percentage">{winPercentageX}%</div>
          </div>
        </div>

        <div class="stat-card stat-o">
          <div class="stat-icon">⭕</div>
          <div class="stat-content">
            <div class="stat-number">{wins.o}</div>
            <div class="stat-label">O Wins</div>
            <div class="stat-percentage">{winPercentageO}%</div>
          </div>
        </div>

        <div class="stat-card stat-draw">
          <div class="stat-icon">🤝</div>
          <div class="stat-content">
            <div class="stat-number">{wins.draws}</div>
            <div class="stat-label">Draws</div>
            <div class="stat-percentage">{drawPercentage}%</div>
          </div>
        </div>
      </div>

      <div class="total-games">
        <span class="total-label">Total Games:</span>
        <span class="total-number">{totalGames}</span>
      </div>

      <button class="reset-stats-button" onClick$={onResetStats}>
        🔄 Reset Stats
      </button>
    </div>
  );
});