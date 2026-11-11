import { EconomyModule, Enemy } from '../types';

export const standardEconomy: EconomyModule = {
  name: 'Стандартная экономика',
  startGold: 200,
  startLives: 20,
  waveBonus: (wave: number) => 50 + wave * 10,
  killBonus: (enemy: Enemy) => enemy.reward,
};

export const generousEconomy: EconomyModule = {
  name: 'Щедрая экономика',
  startGold: 500,
  startLives: 30,
  waveBonus: (wave: number) => 100 + wave * 20,
  killBonus: (enemy: Enemy) => Math.floor(enemy.reward * 1.5),
};

export const hardcoreEconomy: EconomyModule = {
  name: 'Хардкор экономика',
  startGold: 100,
  startLives: 5,
  waveBonus: (wave: number) => 20 + wave * 5,
  killBonus: (enemy: Enemy) => Math.floor(enemy.reward * 0.7),
};

export const economyPresets: Record<string, EconomyModule> = {
  standard: standardEconomy,
  generous: generousEconomy,
  hardcore: hardcoreEconomy,
};
