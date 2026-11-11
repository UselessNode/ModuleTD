import React, { useState } from 'react';
import { GameModules } from '../types';
import { mapPresets } from '../modules/MapModule';
import { towerPresets } from '../modules/TowerModule';
import { enemyPresets } from '../modules/EnemyModule';
import { wavePresets } from '../modules/WaveModule';
import { economyPresets } from '../modules/EconomyModule';

interface ModulePanelProps {
  modules: GameModules;
  onModulesChange: (modules: GameModules) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const ModulePanel: React.FC<ModulePanelProps> = ({
  modules,
  onModulesChange,
  isOpen,
  onToggle,
}) => {
  const [activeTab, setActiveTab] = useState<string>('map');

  const tabs = [
    { id: 'map', label: '🗺️ Карта', icon: '🗺️' },
    { id: 'tower', label: '🏰 Башни', icon: '🏰' },
    { id: 'enemy', label: '👾 Враги', icon: '👾' },
    { id: 'wave', label: '🌊 Волны', icon: '🌊' },
    { id: 'economy', label: '💰 Экономика', icon: '💰' },
  ];

  const renderModuleSelector = (
    title: string,
    currentName: string,
    presets: Record<string, any>,
    moduleKey: keyof GameModules
  ) => {
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">{title}</h4>
        <p className="text-xs text-gray-500">Текущий: <span className="text-green-400">{currentName}</span></p>
        <div className="grid grid-cols-1 gap-1">
          {Object.entries(presets).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => {
                const newModules = { ...modules, [moduleKey]: preset };
                onModulesChange(newModules);
              }}
              className={`text-left px-3 py-2 rounded text-sm transition-all ${
                currentName === preset.name
                  ? 'bg-green-600/30 border border-green-500 text-green-300'
                  : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{preset.name}</span>
                {currentName === preset.name && <span className="text-green-400">✓</span>}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'map':
        return renderModuleSelector('Модуль карты', modules.map.name, mapPresets, 'map');
      case 'tower':
        return (
          <div className="space-y-3">
            {renderModuleSelector('Модуль башен', modules.tower.name, towerPresets, 'tower')}
            <div className="mt-3 p-2 bg-gray-800/50 rounded border border-gray-700">
              <h5 className="text-xs font-bold text-gray-400 mb-2">Доступные башни:</h5>
              {modules.tower.types.map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-xs py-1">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: t.color }} />
                  <span className="text-gray-300">{t.name}</span>
                  <span className="text-yellow-400 ml-auto">{t.cost}g</span>
                  <span className="text-gray-500">DMG:{t.damage}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'enemy':
        return (
          <div className="space-y-3">
            {renderModuleSelector('Модуль врагов', modules.enemy.name, enemyPresets, 'enemy')}
            <div className="mt-3 p-2 bg-gray-800/50 rounded border border-gray-700">
              <h5 className="text-xs font-bold text-gray-400 mb-2">Типы врагов:</h5>
              {Object.entries(modules.enemy.types).map(([key, t]) => (
                <div key={key} className="flex items-center gap-2 text-xs py-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="text-gray-300">{t.name}</span>
                  <span className="text-red-400 ml-auto">HP:{t.hp}</span>
                  <span className="text-blue-400">SPD:{t.speed}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'wave':
        return (
          <div className="space-y-3">
            {renderModuleSelector('Модуль волн', modules.wave.name, wavePresets, 'wave')}
            <div className="mt-3 p-2 bg-gray-800/50 rounded border border-gray-700">
              <p className="text-xs text-gray-400">
                Всего волн: <span className="text-white font-bold">{modules.wave.totalWaves}</span>
              </p>
            </div>
          </div>
        );
      case 'economy':
        return (
          <div className="space-y-3">
            {renderModuleSelector('Модуль экономики', modules.economy.name, economyPresets, 'economy')}
            <div className="mt-3 p-2 bg-gray-800/50 rounded border border-gray-700">
              <div className="text-xs space-y-1">
                <p className="text-gray-400">Начальное золото: <span className="text-yellow-400">{modules.economy.startGold}</span></p>
                <p className="text-gray-400">Начальные жизни: <span className="text-red-400">{modules.economy.startLives}</span></p>
                <p className="text-gray-400">Бонус за волну: <span className="text-green-400">{modules.economy.waveBonus(1)}+</span></p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="fixed top-4 right-4 z-50 bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-all shadow-lg"
      >
        {isOpen ? '✕ Закрыть' : '⚙️ Модули'}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed top-0 right-0 h-full w-80 bg-gray-900/95 backdrop-blur-sm border-l border-gray-700 z-40 overflow-y-auto shadow-2xl">
          <div className="p-4 pt-14">
            <h3 className="text-lg font-bold text-white mb-1">⚙️ Панель модулей</h3>
            <p className="text-xs text-gray-400 mb-4">Меняйте модули прямо во время игры!</p>

            {/* Tabs */}
            <div className="flex flex-wrap gap-1 mb-4">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-2 py-1 rounded text-xs transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="space-y-4">
              {renderContent()}
            </div>

            {/* Warning */}
            <div className="mt-6 p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
              <p className="text-xs text-yellow-300">
                ⚠️ Смена модулей во время игры может повлиять на баланс. 
                Смена карты требует перезапуска игры.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
