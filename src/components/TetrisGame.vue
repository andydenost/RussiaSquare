<template>
  <div class="tetris-game">
    <div class="game-header">
      <h2>Vue 俄罗斯方块</h2>
      <div class="difficulty-selector">
        <span class="difficulty-label">难度：</span>
        <div class="difficulty-buttons">
          <button 
            v-for="diff in difficulties" 
            :key="diff"
            @click="setDifficulty(diff)"
            :class="{ 
              'active': gameState.difficulty === diff,
              'disabled': !gameState.isGameOver && !isInitialState
            }"
            :disabled="!gameState.isGameOver && !isInitialState"
            class="difficulty-button"
          >
            {{ getDifficultyText(diff) }}
          </button>
        </div>
      </div>
    </div>
    <div class="game-container">
      <div class="game-board" :class="{ 'game-over': gameState.isGameOver, 'paused': gameState.isPaused }">
        <div class="board-grid">
          <div v-for="(row, rowIndex) in gameState.board" :key="rowIndex" class="row">
            <div 
              v-for="(_, colIndex) in row" 
              :key="colIndex" 
              class="cell"
              :class="{ 'filled': isCellFilled(rowIndex, colIndex) }"
            >
              <div class="cell-inner"></div>
            </div>
          </div>
        </div>
        <div v-if="gameState.isGameOver" class="game-over-overlay">
          <div class="overlay-content">
            <h3>游戏结束</h3>
            <p class="final-score">最终得分: {{ gameState.score }}</p>
          </div>
        </div>
        <div v-if="gameState.isPaused" class="pause-overlay">
          <div class="overlay-content">
            <h3>已暂停</h3>
            <p>按空格键继续</p>
          </div>
        </div>
      </div>
      <div class="game-info">
        <div class="info-panel next-piece">
          <h3>下一个方块</h3>
          <div class="next-piece-preview">
            <div v-for="(row, rowIndex) in gameState.nextPiece" :key="rowIndex" class="row">
              <div 
                v-for="(cell, colIndex) in row" 
                :key="colIndex" 
                class="cell"
                :class="{ 'filled': cell === 1 }"
              >
                <div class="cell-inner"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="info-panel score-info">
          <div class="score-item">
            <span class="label">分数</span>
            <span class="value">{{ gameState.score }}</span>
          </div>
          <div class="score-item">
            <span class="label">等级</span>
            <span class="value">{{ gameState.level }}</span>
          </div>
        </div>
        <div class="controls">
          <button 
            @click="startGame" 
            :disabled="!gameState.isGameOver && !isInitialState"
            class="primary-button"
          >
            {{ isInitialState ? '开始游戏' : gameState.isGameOver ? '重新开始' : '游戏中' }}
          </button>
          <button 
            @click="togglePause" 
            :disabled="gameState.isGameOver || isInitialState"
            class="secondary-button"
          >
            {{ gameState.isPaused ? '继续' : '暂停' }}
          </button>
        </div>
      </div>
    </div>
    <div class="instructions">
      <h3>操作说明</h3>
      <div class="key-controls">
        <div class="key-group">
          <div class="key">↑</div>
          <span>旋转</span>
        </div>
        <div class="key-row">
          <div class="key-group">
            <div class="key">←</div>
            <span>左移</span>
          </div>
          <div class="key-group">
            <div class="key">↓</div>
            <span>加速</span>
          </div>
          <div class="key-group">
            <div class="key">→</div>
            <span>右移</span>
          </div>
        </div>
        <div class="key-group">
          <div class="key wide">空格</div>
          <span>暂停/继续</span>
        </div>
        <div class="key-group">
          <div class="key">R</div>
          <span>重新开始</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTetris } from '../composables/useTetris';
import type { Difficulty } from '../types/tetris';

const { gameState, startGame, togglePause, setDifficulty } = useTetris();

const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

// 判断是否是初始状态（游戏未开始）
const isInitialState = computed(() => {
  return gameState.value.score === 0 && 
         gameState.value.level === 1 && 
         !gameState.value.currentPiece;
});

// 判断某个格子是否应该被填充（包括当前移动的方块和已固定的方块）
function isCellFilled(row: number, col: number): boolean {
  // 检查游戏板上的固定方块
  if (gameState.value.board[row][col]) {
    return true;
  }

  // 检查当前移动的方块
  if (gameState.value.currentPiece) {
    const { shape, x, y } = gameState.value.currentPiece;
    const pieceRow = row - y;
    const pieceCol = col - x;

    if (
      pieceRow >= 0 && 
      pieceRow < shape.length && 
      pieceCol >= 0 && 
      pieceCol < shape[0].length
    ) {
      return shape[pieceRow][pieceCol] === 1;
    }
  }

  return false;
}

// 获取难度的显示文本
function getDifficultyText(difficulty: Difficulty): string {
  const difficultyTexts: Record<Difficulty, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  };
  return difficultyTexts[difficulty];
}
</script>

<style scoped>
.tetris-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: 'Segoe UI', Arial, sans-serif;
  perspective: 1000px;
}

.game-header {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.game-header h2 {
  color: white;
  margin: 0 0 20px 0;
  font-size: 2.5em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3),
               0 0 20px rgba(33, 150, 243, 0.5);
}

.difficulty-selector {
  background: rgba(255, 255, 255, 0.95);
  padding: 12px 25px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.difficulty-label {
  color: #333;
  font-weight: 600;
  font-size: 1.1em;
}

.difficulty-buttons {
  display: flex;
  gap: 10px;
}

.difficulty-button {
  padding: 8px 16px;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background-color: #f0f0f0;
  color: #333;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.difficulty-button:hover:not(:disabled) {
  background-color: #e0e0e0;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.difficulty-button.active {
  background-color: #2196f3;
  color: white;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.difficulty-button.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.game-container {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
  transform-style: preserve-3d;
}

.game-board {
  background: white;
  border-radius: 12px;
  padding: 15px;
  position: relative;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  transform: rotateX(15deg) rotateY(-10deg);
  transform-style: preserve-3d;
}

.board-grid {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 2px;
  border: 2px solid #e9ecef;
  transform-style: preserve-3d;
}

.row {
  display: flex;
  transform-style: preserve-3d;
}

.cell {
  width: 28px;
  height: 28px;
  padding: 2px;
  transform-style: preserve-3d;
  transition: transform 0.3s ease;
}

.cell-inner {
  width: 100%;
  height: 100%;
  border-radius: 4px;
  background: white;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
  transform-style: preserve-3d;
  position: relative;
}

.cell.filled .cell-inner {
  background: #2196f3;
  border-color: #1976d2;
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.2),
              0 0 4px rgba(33, 150, 243, 0.4);
  animation: pop3d 0.3s ease;
  transform: translateZ(10px);
}

.cell.filled .cell-inner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%);
  border-radius: 4px;
}

.cell.filled .cell-inner::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 10px;
  bottom: -10px;
  left: 0;
  background: #1976d2;
  transform-origin: top;
  transform: rotateX(-90deg);
  opacity: 0.5;
}

@keyframes pop3d {
  0% { transform: translateZ(0px) scale(0.8); }
  50% { transform: translateZ(15px) scale(1.1); }
  100% { transform: translateZ(10px) scale(1); }
}

.game-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 220px;
  transform: translateX(20px) rotateY(10deg);
  transform-style: preserve-3d;
}

.info-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transform-style: preserve-3d;
  transition: transform 0.3s ease;
}

.info-panel:hover {
  transform: translateZ(10px);
}

.info-panel h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.2em;
  text-align: center;
}

.next-piece-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 10px;
  transform-style: preserve-3d;
}

.next-piece-preview .cell {
  width: 24px;
  height: 24px;
}

.score-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.score-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.score-item:last-child {
  border-bottom: none;
}

.score-item .label {
  color: #666;
  font-weight: 500;
}

.score-item .value {
  font-size: 1.2em;
  font-weight: 600;
  color: #2196f3;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  transform-style: preserve-3d;
}

.primary-button,
.secondary-button {
  padding: 12px 20px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transform-style: preserve-3d;
  position: relative;
}

.primary-button {
  background: #2196f3;
  color: white;
  box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
}

.primary-button:hover:not(:disabled) {
  background: #1976d2;
  transform: translateY(-2px) translateZ(10px);
  box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
}

.secondary-button {
  background: #f8f9fa;
  color: #333;
  border: 2px solid #e9ecef;
}

.secondary-button:hover:not(:disabled) {
  background: #e9ecef;
  transform: translateY(-2px) translateZ(10px);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.instructions {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  transform: translateY(20px) rotateX(-5deg);
  transform-style: preserve-3d;
}

.instructions h3 {
  margin: 0 0 20px 0;
  color: #333;
  text-align: center;
  font-size: 1.2em;
}

.key-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.key-row {
  display: flex;
  gap: 20px;
}

.key-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.key {
  width: 40px;
  height: 40px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.key.wide {
  width: 100px;
}

.key:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.key-group span {
  color: #666;
  font-size: 0.9em;
}

.game-over-overlay,
.pause-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
  border-radius: 12px;
  backdrop-filter: blur(4px);
}

.overlay-content {
  text-align: center;
  color: white;
  animation: fadeIn 0.3s ease;
}

.overlay-content h3 {
  font-size: 2em;
  margin: 0 0 15px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.final-score {
  font-size: 1.2em;
  margin: 0;
  opacity: 0.9;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.game-board.game-over,
.game-board.paused {
  opacity: 0.95;
}
</style> 