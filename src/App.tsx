import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { ModulePanel } from './components/ModulePanel';
import { GameEngine } from './engine/GameEngine';
import { GameModules, GameModules as ModulesType } from './types';
import { classicMap } from './modules/MapModule';
import { classicTowers } from './modules/TowerModule';
import { classicEnemies } from './modules/EnemyModule';
import { easyWaves } from './modules/WaveModule';
import { standardEconomy } from './modules/EconomyModule';

function App() {
  const [modules, setModules] = useState<GameModules>({
    map: classicMap,
    tower: classicTowers,
    enemy: classicEnemies,
    wave: easyWaves,
    economy: standardEconomy,
  });

  const engineRef = useRef<GameEngine>(new GameEngine(modules));
  const [selectedTowerType, setSelectedTowerType] = useState<number | null>(null);
  const [selectedTowerId, setSelectedTowerId] = useState<number | null>(null);
  const [modulePanelOpen, setModulePanelOpen] = useState(false);
  const [, forceUpdate] = useState(0);

  // Force re-render periodically to update UI with game state
  useEffect(() => {
    const interval = setInterval(() => forceUpdate(n => n + 1), 100);
    return () => clearInterval(interval);
  }, []);

  const engine = engineRef.current;

  // Update engine modules when they change
  useEffect(() => {
    engine.updateModules(modules);
  }, [modules, engine]);

  const handleCellClick = useCallback((gridX: number, gridY: number) => {
    if (selectedTowerType !== null) {
      const success = engine.placeTower(gridX, gridY, selectedTowerType);
      if (success) {
        forceUpdate(n => n + 1);
      }
    } else {
      setSelectedTowerId(null);
    }
  }, [engine, selectedTowerType]);

  const handleTowerClick = useCallback((towerId: number) => {
    setSelectedTowerId(prev => prev === towerId ? null : towerId);
    setSelectedTowerType(null);
  }, []);

  const handleStartWave = () => {
    engine.startWave();
    forceUpdate(n => n + 1);
  };

  const handleReset = () => {
    engine.reset();
    setSelectedTowerType(null);
    setSelectedTowerId(null);
    forceUpdate(n => n + 1);
  };

  const handleUpgrade = () => {
    if (selectedTowerId !== null) {
      engine.upgradeTower(selectedTowerId);
      forceUpdate(n => n + 1);
    }
  };

  const handleSell = () => {
    if (selectedTowerId !== null) {
      engine.sellTower(selectedTowerId);
      setSelectedTowerId(null);
      forceUpdate(n => n + 1);
    }
  };

  const handlePause = () => {
    engine.state.isPaused = !engine.state.isPaused;
    forceUpdate(n => n + 1);
  };

  const selectedTower = selectedTowerId !== null
    ? engine.state.towers.find(t => t.id === selectedTowerId)
    : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-2">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              🏰 Tower Defence
            </h1>
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">Modular Edition</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">💰</span>
              <span className="font-mono text-yellow-300">{engine.state.gold}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-red-400">❤️</span>
              <span className="font-mono text-red-300">{engine.state.lives}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-blue-400">🌊</span>
              <span className="font-mono text-blue-300">{engine.state.wave}/{modules.wave.totalWaves}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-purple-400">⭐</span>
              <span className="font-mono text-purple-300">{engine.state.score}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 max-w-7xl mx-auto w-full">
        {/* Game area */}
        <div className="flex-1 flex flex-col items-center gap-4">
          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
              onClick={handleStartWave}
              disabled={engine.state.waveInProgress || engine.state.gameOver || engine.state.gameWon}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-bold text-sm transition-all"
            >
              {engine.state.waveInProgress ? '⚔️ Волна идёт...' : '▶️ Начать волну'}
            </button>
            <button
              onClick={handlePause}
              disabled={!engine.state.isRunning || engine.state.gameOver || engine.state.gameWon}
              className="px-3 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-sm transition-all"
            >
              {engine.state.isPaused ? '▶️ Продолжить' : '⏸️ Пауза'}
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm transition-all"
            >
              🔄 Заново
            </button>
          </div>

          {/* Canvas */}
          <GameCanvas
            engine={engine}
            modules={modules}
            selectedTowerType={selectedTowerType}
            selectedTowerId={selectedTowerId}
            onCellClick={handleCellClick}
            onTowerClick={handleTowerClick}
          />

          {/* Status messages */}
          {engine.state.gameOver && (
            <div className="text-center p-3 bg-red-900/30 border border-red-700 rounded-lg">
              <p className="text-red-300 font-bold">💀 Поражение! Нажмите "Заново" для перезапуска</p>
            </div>
          )}
          {engine.state.gameWon && (
            <div className="text-center p-3 bg-green-900/30 border border-green-700 rounded-lg">
              <p className="text-green-300 font-bold">🎉 Победа! Отличная игра!</p>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="w-full lg:w-72 space-y-4">
          {/* Tower selection */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
            <h3 className="text-sm font-bold text-gray-300 mb-2">🏰 Башни</h3>
            <p className="text-xs text-gray-500 mb-2">Выберите и кликните на карту</p>
            <div className="grid grid-cols-2 gap-2">
              {modules.tower.types.map((towerType, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedTowerType(prev => prev === index ? null : index);
                    setSelectedTowerId(null);
                  }}
                  disabled={engine.state.gold < towerType.cost}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    selectedTowerType === index
                      ? 'border-green-500 bg-green-900/30'
                      : engine.state.gold >= towerType.cost
                      ? 'border-gray-700 bg-gray-800 hover:border-gray-500'
                      : 'border-gray-800 bg-gray-900 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: towerType.color }} />
                    <span className="text-xs font-bold text-gray-200 truncate">{towerType.name}</span>
                  </div>
                  <div className="text-xs text-yellow-400 font-mono">{towerType.cost}g</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{towerType.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected tower info */}
          {selectedTower && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
              <h3 className="text-sm font-bold text-gray-300 mb-2">📋 Информация о башне</h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Тип:</span>
                  <span className="text-white">{selectedTower.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Уровень:</span>
                  <span className="text-yellow-400">{'★'.repeat(selectedTower.level)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Урон:</span>
                  <span className="text-red-400">{Math.floor(selectedTower.damage)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Дальность:</span>
                  <span className="text-blue-400">{Math.floor(selectedTower.range)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Скорость:</span>
                  <span className="text-green-400">{selectedTower.fireRate}мс</span>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleUpgrade}
                  disabled={engine.state.gold < modules.tower.getUpgradeCost(selectedTower)}
                  className="flex-1 px-2 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded text-xs font-bold transition-all"
                >
                  ⬆️ Улучшить ({modules.tower.getUpgradeCost(selectedTower)}g)
                </button>
                <button
                  onClick={handleSell}
                  className="px-2 py-1.5 bg-red-600 hover:bg-red-500 rounded text-xs font-bold transition-all"
                >
                  💰 Продать
                </button>
              </div>
            </div>
          )}

          {/* Active modules */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
            <h3 className="text-sm font-bold text-gray-300 mb-2">📦 Активные модули</h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Карта:</span>
                <span className="text-green-400">{modules.map.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Башни:</span>
                <span className="text-green-400">{modules.tower.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Враги:</span>
                <span className="text-green-400">{modules.enemy.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Волны:</span>
                <span className="text-green-400">{modules.wave.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Экономика:</span>
                <span className="text-green-400">{modules.economy.name}</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
            <h3 className="text-sm font-bold text-gray-300 mb-2">📖 Как играть</h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Выберите башню и кликните на зелёную клетку</li>
              <li>• Нажмите "Начать волну" для запуска врагов</li>
              <li>• Кликните на башню для улучшения/продажи</li>
              <li>• Используйте ⚙️ Модули для смены геймплея</li>
              <li>• Не дайте врагам добраться до конца!</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Module Panel */}
      <ModulePanel
        modules={modules}
        onModulesChange={setModules}
        isOpen={modulePanelOpen}
        onToggle={() => setModulePanelOpen(!modulePanelOpen)}
      />
    </div>
  );
}

export default App;
