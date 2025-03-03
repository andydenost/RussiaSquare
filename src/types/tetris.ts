// 方块的类型定义
export type Block = 0 | 1; // 0 表示空，1 表示已占用

// 方块的形状定义
export type Shape = Block[][];

// 方块的方向
export type Direction = 'up' | 'right' | 'down' | 'left';

// 难度等级
export type Difficulty = 'easy' | 'medium' | 'hard';

// 游戏状态
export interface GameState {
  score: number;
  level: number;
  isGameOver: boolean;
  isPaused: boolean;
  board: Block[][];
  currentPiece: {
    shape: Shape;
    x: number;
    y: number;
  } | null;
  nextPiece: Shape;
  difficulty: Difficulty;
}

// 方块移动的结果
export interface MoveResult {
  success: boolean;
  isGameOver?: boolean;
}

// 游戏配置
export interface GameConfig {
  boardWidth: number;
  boardHeight: number;
  initialSpeed: number;
  speedIncreaseFactor: number;
}

// 难度配置
export const DIFFICULTY_CONFIGS: Record<Difficulty, GameConfig> = {
  easy: {
    boardWidth: 15,
    boardHeight: 25,
    initialSpeed: 1000,
    speedIncreaseFactor: 0.9,
  },
  medium: {
    boardWidth: 15,
    boardHeight: 25,
    initialSpeed: 800,
    speedIncreaseFactor: 0.85,
  },
  hard: {
    boardWidth: 15,
    boardHeight: 25,
    initialSpeed: 600,
    speedIncreaseFactor: 0.8,
  },
};

// 定义所有可能的方块形状
export const SHAPES: Shape[] = [
  // I 形
  [
    [1, 1, 1, 1]
  ],
  // L 形
  [
    [1, 0],
    [1, 0],
    [1, 1]
  ],
  // J 形
  [
    [0, 1],
    [0, 1],
    [1, 1]
  ],
  // O 形
  [
    [1, 1],
    [1, 1]
  ],
  // S 形
  [
    [0, 1, 1],
    [1, 1, 0]
  ],
  // Z 形
  [
    [1, 1, 0],
    [0, 1, 1]
  ],
  // T 形
  [
    [1, 1, 1],
    [0, 1, 0]
  ]
]; 