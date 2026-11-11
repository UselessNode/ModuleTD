import { TowerModule, Tower, TowerType } from '../types';

export const classicTowers: TowerModule = {
  name: 'Классические башни',
  types: [
    {
      name: 'Стрелок',
      cost: 50,
      range: 120,
      damage: 10,
      fireRate: 800,
      color: '#4ade80',
      description: 'Быстрая стрельба, средний урон',
    },
    {
      name: 'Пушка',
      cost: 100,
      range: 100,
      damage: 40,
      fireRate: 2000,
      color: '#f97316',
      description: 'Медленная, но мощная',
    },
    {
      name: 'Снайпер',
      cost: 150,
      range: 250,
      damage: 60,
      fireRate: 2500,
      color: '#8b5cf6',
      description: 'Огромная дальность',
    },
    {
      name: 'Заморозка',
      cost: 75,
      range: 100,
      damage: 5,
      fireRate: 500,
      color: '#38bdf8',
      special: 'slow',
      description: 'Замедляет врагов',
    },
  ],
  getUpgradeCost: (tower: Tower) => Math.floor(50 * tower.level * 1.5),
  getUpgradeBonus: (tower: Tower) => ({
    damage: tower.damage * 0.3,
    range: tower.range * 0.1,
  }),
};

export const magicTowers: TowerModule = {
  name: 'Магические башни',
  types: [
    {
      name: 'Огненный маг',
      cost: 80,
      range: 130,
      damage: 25,
      fireRate: 1200,
      color: '#ef4444',
      description: 'Огненные шары',
    },
    {
      name: 'Ледяной маг',
      cost: 90,
      range: 110,
      damage: 15,
      fireRate: 800,
      color: '#06b6d4',
      special: 'slow',
      description: 'Замораживает врагов',
    },
    {
      name: 'Молния',
      cost: 200,
      range: 180,
      damage: 80,
      fireRate: 3000,
      color: '#eab308',
      description: 'Мощнейший удар молнии',
    },
    {
      name: 'Некромант',
      cost: 120,
      range: 140,
      damage: 30,
      fireRate: 1500,
      color: '#a855f7',
      special: 'poison',
      description: 'Отравляет врагов',
    },
  ],
  getUpgradeCost: (tower: Tower) => Math.floor(60 * tower.level * 1.4),
  getUpgradeBonus: (tower: Tower) => ({
    damage: tower.damage * 0.4,
    range: tower.range * 0.15,
  }),
};

export const militaryTowers: TowerModule = {
  name: 'Военные башни',
  types: [
    {
      name: 'Пулемёт',
      cost: 60,
      range: 100,
      damage: 5,
      fireRate: 200,
      color: '#65a30d',
      description: 'Очень скорострельный',
    },
    {
      name: 'Ракетница',
      cost: 180,
      range: 200,
      damage: 100,
      fireRate: 4000,
      color: '#dc2626',
      description: 'Ракеты с огромным уроном',
    },
    {
      name: 'Лазер',
      cost: 250,
      range: 160,
      damage: 3,
      fireRate: 50,
      color: '#f43f5e',
      description: 'Постоянный луч',
    },
    {
      name: 'Мина',
      cost: 40,
      range: 60,
      damage: 200,
      fireRate: 10000,
      color: '#78716c',
      description: 'Взрывается при контакте',
    },
  ],
  getUpgradeCost: (tower: Tower) => Math.floor(40 * tower.level * 1.6),
  getUpgradeBonus: (tower: Tower) => ({
    damage: tower.damage * 0.5,
    range: tower.range * 0.05,
  }),
};

export const towerPresets: Record<string, TowerModule> = {
  classic: classicTowers,
  magic: magicTowers,
  military: militaryTowers,
};
