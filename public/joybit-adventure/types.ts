export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Entity extends Rect {
  vx: number;
  vy: number;
  color: string;
  facing: number; // 1 for right, -1 for left
  isDead?: boolean;
  isBig?: boolean;
  invulnerableUntil?: number;
}

export interface Enemy extends Entity {
  id: number;
  type: 'goomba' | 'flying';
  patrolStart: number;
  patrolEnd: number;
}

export interface Item extends Entity {
  id: number;
  type: 'mushroom';
  consumed: boolean;
}

export interface Projectile extends Rect {
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface Platform extends Rect {
  type: 'solid' | 'hazard' | 'goal' | 'moving';
  range?: number; // For moving platforms
  originX?: number;
  speed?: number;
}

export interface GameState {
  player: Entity;
  platforms: Platform[];
  enemies: Enemy[];
  items: Item[];
  projectiles: Projectile[];
  particles: Particle[];
  camera: { x: number };
  score: number;
  status: 'menu' | 'playing' | 'won' | 'gameover';
  time: number;
  timeLeft: number;
  lastShotTime: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  action: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}