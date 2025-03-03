import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { GameState, Shape, MoveResult, Difficulty } from '../types/tetris';
import { SHAPES, DIFFICULTY_CONFIGS } from '../types/tetris';

export function useTetris(initialDifficulty: Difficulty = 'medium') {
  const difficulty = ref<Difficulty>(initialDifficulty);
  const config = computed(() => DIFFICULTY_CONFIGS[difficulty.value]);

  const gameState = ref<GameState>({
    score: 0,
    level: 1,
    isGameOver: false,
    isPaused: false,
    board: Array(config.value.boardHeight).fill(null).map(() => 
      Array(config.value.boardWidth).fill(0)
    ),
    currentPiece: null,
    nextPiece: getRandomShape(),
    difficulty: initialDifficulty,
  });

  let gameInterval: number | null = null;
  const currentSpeed = computed(() => 
    config.value.initialSpeed * Math.pow(config.value.speedIncreaseFactor, gameState.value.level - 1)
  );

  // 获取随机形状
  function getRandomShape(): Shape {
    return SHAPES[Math.floor(Math.random() * SHAPES.length)];
  }

  // 检查碰撞
  function checkCollision(shape: Shape, x: number, y: number): boolean {
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const newX = x + col;
          const newY = y + row;
          
          if (
            newX < 0 || 
            newX >= config.value.boardWidth ||
            newY >= config.value.boardHeight ||
            (newY >= 0 && gameState.value.board[newY][newX])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // 旋转方块
  function rotatePiece(): void {
    if (!gameState.value.currentPiece || gameState.value.isPaused) return;

    const { shape, x, y } = gameState.value.currentPiece;
    const newShape: Shape = shape[0].map((_, i) => 
      shape.map(row => row[i]).reverse()
    );

    if (!checkCollision(newShape, x, y)) {
      gameState.value.currentPiece.shape = newShape;
    }
  }

  // 移动方块
  function movePiece(dx: number, dy: number): MoveResult {
    if (!gameState.value.currentPiece || gameState.value.isPaused) {
      return { success: false };
    }

    const { shape, x, y } = gameState.value.currentPiece;
    if (!checkCollision(shape, x + dx, y + dy)) {
      gameState.value.currentPiece.x += dx;
      gameState.value.currentPiece.y += dy;
      return { success: true };
    }

    // 如果是向下移动失败，说明方块已经到底
    if (dy > 0) {
      mergePiece();
      clearLines();
      return spawnNewPiece();
    }

    return { success: false };
  }

  // 合并方块到游戏板
  function mergePiece(): void {
    if (!gameState.value.currentPiece) return;

    const { shape, x, y } = gameState.value.currentPiece;
    shape.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell && y + rowIndex >= 0) {
          gameState.value.board[y + rowIndex][x + colIndex] = cell;
        }
      });
    });
  }

  // 清除已完成的行
  function clearLines(): void {
    let linesCleared = 0;
    
    for (let row = config.value.boardHeight - 1; row >= 0; row--) {
      if (gameState.value.board[row].every(cell => cell === 1)) {
        gameState.value.board.splice(row, 1);
        gameState.value.board.unshift(Array(config.value.boardWidth).fill(0));
        linesCleared++;
        row++; // 重新检查当前行，因为上面的行已经下移
      }
    }

    if (linesCleared > 0) {
      const baseScore = linesCleared * 100;
      const difficultyMultiplier = difficulty.value === 'easy' ? 1 : 
                                  difficulty.value === 'medium' ? 1.5 : 2;
      gameState.value.score += Math.floor(baseScore * gameState.value.level * difficultyMultiplier);
      gameState.value.level = Math.floor(gameState.value.score / 1000) + 1;
    }
  }

  // 生成新方块
  function spawnNewPiece(): MoveResult {
    const shape = gameState.value.nextPiece;
    const x = Math.floor((config.value.boardWidth - shape[0].length) / 2);
    const y = -shape.length;

    gameState.value.currentPiece = { shape, x, y };
    gameState.value.nextPiece = getRandomShape();

    if (checkCollision(shape, x, y)) {
      gameState.value.isGameOver = true;
      stopGame();
      return { success: false, isGameOver: true };
    }

    return { success: true };
  }

  // 设置难度
  function setDifficulty(newDifficulty: Difficulty): void {
    if (gameInterval) {
      stopGame();
    }
    difficulty.value = newDifficulty;
    gameState.value.difficulty = newDifficulty;
    resetGame();
  }

  // 开始游戏
  function startGame(): void {
    if (gameInterval) return;

    resetGame();
    spawnNewPiece();
    gameInterval = setInterval(() => {
      if (!gameState.value.isPaused) {
        movePiece(0, 1);
      }
    }, currentSpeed.value);
  }

  // 暂停游戏
  function togglePause(): void {
    gameState.value.isPaused = !gameState.value.isPaused;
  }

  // 停止游戏
  function stopGame(): void {
    if (gameInterval) {
      clearInterval(gameInterval);
      gameInterval = null;
    }
  }

  // 重置游戏
  function resetGame(): void {
    stopGame();
    gameState.value = {
      score: 0,
      level: 1,
      isGameOver: false,
      isPaused: false,
      board: Array(config.value.boardHeight).fill(null).map(() => 
        Array(config.value.boardWidth).fill(0)
      ),
      currentPiece: null,
      nextPiece: getRandomShape(),
      difficulty: difficulty.value,
    };
  }

  // 键盘控制
  function handleKeydown(event: KeyboardEvent): void {
    if (gameState.value.isGameOver) return;

    // 阻止方向键的默认滚动行为
    if (
      event.key === 'ArrowUp' || 
      event.key === 'ArrowDown' || 
      event.key === 'ArrowLeft' || 
      event.key === 'ArrowRight' ||
      event.key === ' '  // 阻止空格键的默认滚动行为
    ) {
      event.preventDefault();
    }

    switch (event.key) {
      case 'ArrowLeft':
        movePiece(-1, 0);
        break;
      case 'ArrowRight':
        movePiece(1, 0);
        break;
      case 'ArrowDown':
        movePiece(0, 1);
        break;
      case 'ArrowUp':
        rotatePiece();
        break;
      case ' ':
        togglePause();
        break;
      case 'r':
      case 'R':
        startGame();
        break;
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onUnmounted(() => {
    stopGame();
    window.removeEventListener('keydown', handleKeydown);
  });

  return {
    gameState,
    startGame,
    stopGame,
    resetGame,
    togglePause,
    setDifficulty,
  };
} 