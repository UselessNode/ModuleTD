import React, { useRef, useEffect } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { GameModules } from '../types';

interface GameCanvasProps {
  engine: GameEngine;
  modules: GameModules;
  selectedTowerType: number | null;
  selectedTowerId: number | null;
  onCellClick: (gridX: number, gridY: number) => void;
  onTowerClick: (towerId: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  engine,
  modules,
  selectedTowerType,
  selectedTowerId,
  onCellClick,
  onTowerClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = (timestamp: number) => {
      engine.update(timestamp);
      draw(ctx, engine, modules, selectedTowerType, selectedTowerId, mouseRef.current);
      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [engine, modules, selectedTowerType, selectedTowerId]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Check if clicking on a tower
    const clickedTower = engine.state.towers.find(t => {
      const dx = t.x - x;
      const dy = t.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 20;
    });

    if (clickedTower && selectedTowerType === null) {
      onTowerClick(clickedTower.id);
    } else {
      const gridX = Math.floor(x / modules.map.gridSize);
      const gridY = Math.floor(y / modules.map.gridSize);
      onCellClick(gridX, gridY);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    mouseRef.current = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  return (
    <canvas
      ref={canvasRef}
      width={modules.map.width}
      height={modules.map.height}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      className="border-2 border-gray-700 rounded-lg cursor-crosshair w-full max-w-[800px]"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

function draw(
  ctx: CanvasRenderingContext2D,
  engine: GameEngine,
  modules: GameModules,
  selectedTowerType: number | null,
  selectedTowerId: number | null,
  mouse: { x: number; y: number }
) {
  const { map } = modules;
  const { state } = engine;

  // Clear
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, map.width, map.height);

  // Draw grid
  ctx.strokeStyle = '#2a2a4a';
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= map.width; x += map.gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, map.height);
    ctx.stroke();
  }
  for (let y = 0; y <= map.height; y += map.gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(map.width, y);
    ctx.stroke();
  }

  // Draw buildable cells
  const rows = Math.floor(map.height / map.gridSize);
  const cols = Math.floor(map.width / map.gridSize);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (map.buildableGrid[r] && map.buildableGrid[r][c]) {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.05)';
        ctx.fillRect(c * map.gridSize + 1, r * map.gridSize + 1, map.gridSize - 2, map.gridSize - 2);
      }
    }
  }

  // Draw path
  ctx.strokeStyle = '#4a4a6a';
  ctx.lineWidth = map.gridSize * 0.8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(map.path[0].x, map.path[0].y);
  for (let i = 1; i < map.path.length; i++) {
    ctx.lineTo(map.path[i].x, map.path[i].y);
  }
  ctx.stroke();

  // Path inner line
  ctx.strokeStyle = '#3a3a5a';
  ctx.lineWidth = map.gridSize * 0.5;
  ctx.beginPath();
  ctx.moveTo(map.path[0].x, map.path[0].y);
  for (let i = 1; i < map.path.length; i++) {
    ctx.lineTo(map.path[i].x, map.path[i].y);
  }
  ctx.stroke();

  // Draw start/end markers
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(map.path[0].x, map.path[0].y, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('▶', map.path[0].x, map.path[0].y);

  const end = map.path[map.path.length - 1];
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(end.x, end.y, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillText('⬛', end.x, end.y);

  // Draw hover preview
  if (selectedTowerType !== null) {
    const gridX = Math.floor(mouse.x / map.gridSize);
    const gridY = Math.floor(mouse.y / map.gridSize);
    const canPlace = engine.canPlaceTower(gridX, gridY);
    const towerType = modules.tower.types[selectedTowerType];

    if (towerType && gridX >= 0 && gridX < cols && gridY >= 0 && gridY < rows) {
      const cx = gridX * map.gridSize + map.gridSize / 2;
      const cy = gridY * map.gridSize + map.gridSize / 2;

      // Range circle
      ctx.strokeStyle = canPlace ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)';
      ctx.fillStyle = canPlace ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, towerType.range, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Tower preview
      ctx.fillStyle = canPlace ? towerType.color + '80' : '#ef444480';
      ctx.fillRect(gridX * map.gridSize + 4, gridY * map.gridSize + 4, map.gridSize - 8, map.gridSize - 8);
    }
  }

  // Draw towers
  for (const tower of state.towers) {
    const isSelected = tower.id === selectedTowerId;

    // Range circle for selected tower
    if (isSelected) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Tower body
    ctx.fillStyle = tower.color;
    const size = map.gridSize * 0.7;
    ctx.fillRect(tower.x - size / 2, tower.y - size / 2, size, size);

    // Tower border
    ctx.strokeStyle = isSelected ? '#fff' : '#000';
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.strokeRect(tower.x - size / 2, tower.y - size / 2, size, size);

    // Level indicator
    if (tower.level > 1) {
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`★${tower.level}`, tower.x, tower.y - size / 2 - 8);
    }

    // Targeting line
    if (tower.target) {
      ctx.strokeStyle = tower.color + '40';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tower.x, tower.y);
      ctx.lineTo(tower.target.x, tower.target.y);
      ctx.stroke();
    }
  }

  // Draw enemies
  for (const enemy of state.enemies) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(enemy.x + 2, enemy.y + 2, enemy.size, enemy.size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
    ctx.fill();

    // Slow effect
    if (enemy.slow > 0) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.size + 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    // HP bar
    const hpPercent = enemy.hp / enemy.maxHp;
    const barWidth = enemy.size * 2;
    const barHeight = 4;
    const barX = enemy.x - barWidth / 2;
    const barY = enemy.y - enemy.size - 8;

    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = hpPercent > 0.5 ? '#22c55e' : hpPercent > 0.25 ? '#f59e0b' : '#ef4444';
    ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);
  }

  // Draw projectiles
  for (const proj of state.projectiles) {
    ctx.fillStyle = proj.color;
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
    ctx.fill();

    // Glow
    ctx.fillStyle = proj.color + '40';
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, proj.size * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Game over / win overlay
  if (state.gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, map.width, map.height);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ПОРАЖЕНИЕ', map.width / 2, map.height / 2 - 20);
    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    ctx.fillText(`Счёт: ${state.score} | Волна: ${state.wave}`, map.width / 2, map.height / 2 + 30);
  }

  if (state.gameWon) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, map.width, map.height);
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ПОБЕДА!', map.width / 2, map.height / 2 - 20);
    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    ctx.fillText(`Счёт: ${state.score}`, map.width / 2, map.height / 2 + 30);
  }
}
