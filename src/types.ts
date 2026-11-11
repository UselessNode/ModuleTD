export interface Point {
  x: number;
  y: number;
}

export interface Enemy {
  id: number;
  type: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  pathIndex: number;
  pathProgress: number;
  reward: number;
  color: string;
  size: number;
  slow: number;
  slowTimer: number;
}

export interface Tower {
  id: number;
  type: string;
  x: number;
  y: number;
  gridX: number;
  gridY: number;
  range: number;
  damage: number;
  fireRate: number;
  lastFire: number;
  color: string;
  level: number;
  target: Enemy | null;
  special?: string;
}

export interface Projectile {
  id: number;
  x: number;
  y: number;
  targetId: number;
  speed: number;
  damage: number;
  color: string;
  size: number;
  type: string;
}

export interface TowerType {
  name: string;
  cost: number;
  range: number;
  damage: number;
  fireRate: number;
  color: string;
  special?: string;
  description: string;
}

export interface EnemyType {
  name: string;
  hp: number;
  speed: number;
  reward: number;
  color: string;
  size: number;
}

export interface WaveConfig {
  enemies: { type: string; count: number; interval: number }[];
}

export interface GameState {
  gold: number;
  lives: number;
  wave: number;
  score: number;
  enemies: Enemy[];
  towers: Tower[];
  projectiles: Projectile[];
  isRunning: boolean;
  isPaused: boolean;
  waveInProgress: boolean;
  gameOver: boolean;
  gameWon: boolean;
}

export interface MapModule {
  name: string;
  width: number;
  height: number;
  gridSize: number;
  path: Point[];
  buildableGrid: boolean[][];
}

export interface TowerModule {
  name: string;
  types: TowerType[];
  getUpgradeCost: (tower: Tower) => number;
  getUpgradeBonus: (tower: Tower) => Partial<TowerType>;
}

export interface EnemyModule {
  name: string;
  types: Record<string, EnemyType>;
  getSpawnMultiplier: (wave: number) => number;
}

export interface WaveModule {
  name: string;
  totalWaves: number;
  getWave: (waveNumber: number) => WaveConfig;
}

export interface EconomyModule {
  name: string;
  startGold: number;
  startLives: number;
  waveBonus: (wave: number) => number;
  killBonus: (enemy: Enemy) => number;
}

export interface GameModules {
  map: MapModule;
  tower: TowerModule;
  enemy: EnemyModule;
  wave: WaveModule;
  economy: EconomyModule;
}
