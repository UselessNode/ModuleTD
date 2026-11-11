import { WaveModule, WaveConfig } from '../types';

export const easyWaves: WaveModule = {
  name: 'Лёгкие волны',
  totalWaves: 15,
  getWave: (waveNumber: number): WaveConfig => {
    const base = waveNumber;
    if (waveNumber <= 3) {
      return { enemies: [{ type: 'grunt', count: 5 + base * 2, interval: 1000 }] };
    } else if (waveNumber <= 6) {
      return {
        enemies: [
          { type: 'grunt', count: 5 + base, interval: 800 },
          { type: 'fast', count: base, interval: 600 },
        ],
      };
    } else if (waveNumber <= 10) {
      return {
        enemies: [
          { type: 'grunt', count: base * 2, interval: 700 },
          { type: 'fast', count: base, interval: 500 },
          { type: 'tank', count: Math.floor(base / 3), interval: 2000 },
        ],
      };
    } else {
      return {
        enemies: [
          { type: 'tank', count: base - 5, interval: 1500 },
          { type: 'fast', count: base * 2, interval: 400 },
          { type: 'boss', count: waveNumber === 15 ? 3 : 1, interval: 3000 },
        ],
      };
    }
  },
};

export const hardWaves: WaveModule = {
  name: 'Сложные волны',
  totalWaves: 20,
  getWave: (waveNumber: number): WaveConfig => {
    if (waveNumber <= 5) {
      return {
        enemies: [
          { type: 'grunt', count: 10 + waveNumber * 3, interval: 600 },
          { type: 'fast', count: waveNumber * 2, interval: 400 },
        ],
      };
    } else if (waveNumber <= 10) {
      return {
        enemies: [
          { type: 'fast', count: waveNumber * 3, interval: 300 },
          { type: 'tank', count: waveNumber, interval: 1000 },
          { type: 'grunt', count: waveNumber * 2, interval: 500 },
        ],
      };
    } else if (waveNumber <= 15) {
      return {
        enemies: [
          { type: 'tank', count: waveNumber * 2, interval: 800 },
          { type: 'fast', count: waveNumber * 4, interval: 250 },
          { type: 'boss', count: Math.floor(waveNumber / 5), interval: 2000 },
        ],
      };
    } else {
      return {
        enemies: [
          { type: 'boss', count: waveNumber - 10, interval: 1500 },
          { type: 'tank', count: waveNumber * 3, interval: 600 },
          { type: 'fast', count: waveNumber * 5, interval: 200 },
        ],
      };
    }
  },
};

export const endlessWaves: WaveModule = {
  name: 'Бесконечные волны',
  totalWaves: 999,
  getWave: (waveNumber: number): WaveConfig => {
    const scaling = Math.floor(waveNumber * 1.5);
    return {
      enemies: [
        { type: 'grunt', count: scaling * 3, interval: Math.max(200, 800 - waveNumber * 20) },
        { type: 'fast', count: scaling * 2, interval: Math.max(150, 600 - waveNumber * 15) },
        { type: 'tank', count: scaling, interval: Math.max(500, 1500 - waveNumber * 50) },
        ...(waveNumber % 5 === 0 ? [{ type: 'boss' as string, count: Math.floor(waveNumber / 5), interval: 2000 }] : []),
      ],
    };
  },
};

export const wavePresets: Record<string, WaveModule> = {
  easy: easyWaves,
  hard: hardWaves,
  endless: endlessWaves,
};
