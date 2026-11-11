import { GameState, Enemy, Tower, Projectile, Point, GameModules } from '../types';

export class GameEngine {
  state: GameState;
  modules: GameModules;
  nextEnemyId = 0;
  nextTowerId = 0;
  nextProjectileId = 0;
  spawnQueue: { type: string; delay: number }[] = [];
  spawnTimer = 0;
  lastTime = 0;
  onStateChange: (() => void) | null = null;

  constructor(modules: GameModules) {
    this.modules = modules;
    this.state = {
      gold: modules.economy.startGold,
      lives: modules.economy.startLives,
      wave: 0,
      score: 0,
      enemies: [],
      towers: [],
      projectiles: [],
      isRunning: false,
      isPaused: false,
      waveInProgress: false,
      gameOver: false,
      gameWon: false,
    };
  }

  reset() {
    this.state = {
      gold: this.modules.economy.startGold,
      lives: this.modules.economy.startLives,
      wave: 0,
      score: 0,
      enemies: [],
      towers: [],
      projectiles: [],
      isRunning: false,
      isPaused: false,
      waveInProgress: false,
      gameOver: false,
      gameWon: false,
    };
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.nextEnemyId = 0;
    this.nextTowerId = 0;
    this.nextProjectileId = 0;
  }

  updateModules(modules: GameModules) {
    this.modules = modules;
  }

  startWave() {
    if (this.state.waveInProgress || this.state.gameOver || this.state.gameWon) return;
    this.state.wave++;
    this.state.waveInProgress = true;
    this.state.isRunning = true;

    const waveConfig = this.modules.wave.getWave(this.state.wave);
    this.spawnQueue = [];

    let totalDelay = 0;
    for (const group of waveConfig.enemies) {
      for (let i = 0; i < group.count; i++) {
        this.spawnQueue.push({ type: group.type, delay: totalDelay });
        totalDelay += group.interval;
      }
    }
    this.spawnTimer = 0;
  }

  canPlaceTower(gridX: number, gridY: number): boolean {
    const map = this.modules.map;
    const rows = Math.floor(map.height / map.gridSize);
    const cols = Math.floor(map.width / map.gridSize);
    
    if (gridX < 0 || gridX >= cols || gridY < 0 || gridY >= rows) return false;
    if (!map.buildableGrid[gridY][gridX]) return false;
    
    // Check if tower already exists here
    return !this.state.towers.some(t => t.gridX === gridX && t.gridY === gridY);
  }

  placeTower(gridX: number, gridY: number, towerTypeIndex: number): boolean {
    const towerType = this.modules.tower.types[towerTypeIndex];
    if (!towerType) return false;
    if (this.state.gold < towerType.cost) return false;
    if (!this.canPlaceTower(gridX, gridY)) return false;

    const map = this.modules.map;
    const tower: Tower = {
      id: this.nextTowerId++,
      type: towerType.name,
      x: gridX * map.gridSize + map.gridSize / 2,
      y: gridY * map.gridSize + map.gridSize / 2,
      gridX,
      gridY,
      range: towerType.range,
      damage: towerType.damage,
      fireRate: towerType.fireRate,
      lastFire: 0,
      color: towerType.color,
      level: 1,
      target: null,
      special: towerType.special,
    };

    this.state.towers.push(tower);
    this.state.gold -= towerType.cost;
    return true;
  }

  upgradeTower(towerId: number): boolean {
    const tower = this.state.towers.find(t => t.id === towerId);
    if (!tower) return false;
    
    const cost = this.modules.tower.getUpgradeCost(tower);
    if (this.state.gold < cost) return false;
    
    const bonus = this.modules.tower.getUpgradeBonus(tower);
    if (bonus.damage) tower.damage += bonus.damage;
    if (bonus.range) tower.range += bonus.range;
    tower.level++;
    this.state.gold -= cost;
    return true;
  }

  sellTower(towerId: number): boolean {
    const towerIdx = this.state.towers.findIndex(t => t.id === towerId);
    if (towerIdx === -1) return false;
    
    const tower = this.state.towers[towerIdx];
    const towerType = this.modules.tower.types.find(t => t.name === tower.type);
    if (towerType) {
      this.state.gold += Math.floor(towerType.cost * 0.6 * tower.level);
    }
    this.state.towers.splice(towerIdx, 1);
    return true;
  }

  update(timestamp: number) {
    if (!this.state.isRunning || this.state.isPaused || this.state.gameOver || this.state.gameWon) return;

    const dt = this.lastTime ? timestamp - this.lastTime : 16;
    this.lastTime = timestamp;

    this.spawnEnemies(dt);
    this.moveEnemies(dt);
    this.updateTowers(timestamp);
    this.moveProjectiles(dt);
    this.checkWaveComplete();

    if (this.state.lives <= 0) {
      this.state.gameOver = true;
      this.state.isRunning = false;
    }
  }

  private spawnEnemies(dt: number) {
    if (this.spawnQueue.length === 0) return;
    
    this.spawnTimer += dt;
    
    while (this.spawnQueue.length > 0 && this.spawnTimer >= this.spawnQueue[0].delay) {
      const spawn = this.spawnQueue.shift()!;
      const enemyType = this.modules.enemy.types[spawn.type];
      if (!enemyType) continue;

      const hpMult = this.modules.enemy.getSpawnMultiplier(this.state.wave);
      const path = this.modules.map.path;
      
      const enemy: Enemy = {
        id: this.nextEnemyId++,
        type: spawn.type,
        x: path[0].x,
        y: path[0].y,
        hp: Math.floor(enemyType.hp * hpMult),
        maxHp: Math.floor(enemyType.hp * hpMult),
        speed: enemyType.speed,
        pathIndex: 0,
        pathProgress: 0,
        reward: enemyType.reward,
        color: enemyType.color,
        size: enemyType.size,
        slow: 0,
        slowTimer: 0,
      };
      this.state.enemies.push(enemy);
    }
  }

  private moveEnemies(dt: number) {
    const path = this.modules.map.path;
    const toRemove: number[] = [];

    for (const enemy of this.state.enemies) {
      // Update slow
      if (enemy.slowTimer > 0) {
        enemy.slowTimer -= dt;
        if (enemy.slowTimer <= 0) {
          enemy.slow = 0;
        }
      }

      const effectiveSpeed = enemy.speed * (1 - enemy.slow);
      const moveAmount = effectiveSpeed * (dt / 16);

      if (enemy.pathIndex >= path.length - 1) {
        // Reached the end
        this.state.lives--;
        toRemove.push(enemy.id);
        continue;
      }

      const current = path[enemy.pathIndex];
      const next = path[enemy.pathIndex + 1];
      const dx = next.x - current.x;
      const dy = next.y - current.y;
      const segLength = Math.sqrt(dx * dx + dy * dy);

      enemy.pathProgress += moveAmount / segLength;

      if (enemy.pathProgress >= 1) {
        enemy.pathProgress = 0;
        enemy.pathIndex++;
        if (enemy.pathIndex >= path.length - 1) {
          this.state.lives--;
          toRemove.push(enemy.id);
          continue;
        }
      }

      const cp = path[enemy.pathIndex];
      const np = path[enemy.pathIndex + 1];
      if (cp && np) {
        enemy.x = cp.x + (np.x - cp.x) * enemy.pathProgress;
        enemy.y = cp.y + (np.y - cp.y) * enemy.pathProgress;
      }
    }

    this.state.enemies = this.state.enemies.filter(e => !toRemove.includes(e.id));
  }

  private updateTowers(timestamp: number) {
    for (const tower of this.state.towers) {
      // Find target
      let closestEnemy: Enemy | null = null;
      let closestDist = Infinity;

      for (const enemy of this.state.enemies) {
        const dx = enemy.x - tower.x;
        const dy = enemy.y - tower.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= tower.range && dist < closestDist) {
          closestDist = dist;
          closestEnemy = enemy;
        }
      }

      tower.target = closestEnemy;

      if (closestEnemy && timestamp - tower.lastFire >= tower.fireRate) {
        tower.lastFire = timestamp;
        
        const projectile: Projectile = {
          id: this.nextProjectileId++,
          x: tower.x,
          y: tower.y,
          targetId: closestEnemy.id,
          speed: 8,
          damage: tower.damage,
          color: tower.color,
          size: tower.special === 'slow' ? 4 : 5,
          type: tower.special || 'normal',
        };
        this.state.projectiles.push(projectile);
      }
    }
  }

  private moveProjectiles(dt: number) {
    const toRemove: number[] = [];

    for (const proj of this.state.projectiles) {
      const target = this.state.enemies.find(e => e.id === proj.targetId);
      if (!target) {
        toRemove.push(proj.id);
        continue;
      }

      const dx = target.x - proj.x;
      const dy = target.y - proj.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < target.size + proj.size) {
        // Hit!
        target.hp -= proj.damage;
        
        if (proj.type === 'slow') {
          target.slow = 0.5;
          target.slowTimer = 2000;
        }
        if (proj.type === 'poison') {
          target.hp -= proj.damage * 0.3; // DOT
        }

        if (target.hp <= 0) {
          this.state.gold += this.modules.economy.killBonus(target);
          this.state.score += target.reward;
          this.state.enemies = this.state.enemies.filter(e => e.id !== target.id);
        }
        toRemove.push(proj.id);
      } else {
        const moveSpeed = proj.speed * (dt / 16);
        proj.x += (dx / dist) * moveSpeed;
        proj.y += (dy / dist) * moveSpeed;
      }
    }

    this.state.projectiles = this.state.projectiles.filter(p => !toRemove.includes(p.id));
  }

  private checkWaveComplete() {
    if (this.state.waveInProgress && this.spawnQueue.length === 0 && this.state.enemies.length === 0) {
      this.state.waveInProgress = false;
      this.state.gold += this.modules.economy.waveBonus(this.state.wave);
      
      if (this.state.wave >= this.modules.wave.totalWaves) {
        this.state.gameWon = true;
        this.state.isRunning = false;
      }
    }
  }
}
