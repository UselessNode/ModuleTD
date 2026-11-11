import { EnemyModule } from '../types';

export const classicEnemies: EnemyModule = {
  name: 'Классические враги',
  types: {
    grunt: { name: 'Рядовой', hp: 50, speed: 1.5, reward: 10, color: '#ef4444', size: 12 },
    fast: { name: 'Бегун', hp: 30, speed: 3, reward: 15, color: '#f59e0b', size: 8 },
    tank: { name: 'Танк', hp: 200, speed: 0.8, reward: 30, color: '#7c3aed', size: 18 },
    boss: { name: 'Босс', hp: 500, speed: 0.5, reward: 100, color: '#dc2626', size: 24 },
  },
  getSpawnMultiplier: (wave: number) => 1 + wave * 0.15,
};

export const fantasyEnemies: EnemyModule = {
  name: 'Фэнтези враги',
  types: {
    goblin: { name: 'Гоблин', hp: 40, speed: 2.5, reward: 8, color: '#22c55e', size: 10 },
    orc: { name: 'Орк', hp: 150, speed: 1.0, reward: 25, color: '#84cc16', size: 16 },
    dragon: { name: 'Дракон', hp: 400, speed: 1.8, reward: 80, color: '#f97316', size: 22 },
    lich: { name: 'Лич', hp: 800, speed: 0.6, reward: 200, color: '#6366f1', size: 20 },
  },
  getSpawnMultiplier: (wave: number) => 1 + wave * 0.2,
};

export const sciFiEnemies: EnemyModule = {
  name: 'Sci-Fi враги',
  types: {
    drone: { name: 'Дрон', hp: 35, speed: 3.5, reward: 12, color: '#06b6d4', size: 8 },
    mech: { name: 'Мех', hp: 250, speed: 0.7, reward: 40, color: '#64748b', size: 20 },
    alien: { name: 'Пришелец', hp: 100, speed: 2.0, reward: 20, color: '#a3e635', size: 14 },
    mothership: { name: 'Материнский корабль', hp: 1500, speed: 0.3, reward: 500, color: '#e11d48', size: 30 },
  },
  getSpawnMultiplier: (wave: number) => 1 + wave * 0.25,
};

export const enemyPresets: Record<string, EnemyModule> = {
  classic: classicEnemies,
  fantasy: fantasyEnemies,
  sciFi: sciFiEnemies,
};
