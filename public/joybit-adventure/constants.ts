import { Platform, Enemy, Item } from './types';

// Physics - Adjusted for Snappier/Fluid feel
export const GRAVITY = 0.7; 
export const FRICTION = 0.82; 
export const ACCELERATION = 1.5; 
export const JUMP_FORCE = -15; 
export const MAX_SPEED = 7;
export const TERMINAL_VELOCITY = 16;
export const PROJECTILE_SPEED = 12;
export const ENEMY_SPEED = 2.5;
export const ITEM_SPEED = 2;
export const TIME_LIMIT = 120; // Seconds

// Visuals
export const COLORS = {
  background: '#1a1a1a',
  primary: '#00FFFF', // Cyan
  secondary: '#FF00FF', // Pink
  text: '#FFFFFF',
  hazard: '#FF3333', // Red Neon
  ground: '#2a2a2a',
  goal: '#FFFF00',
  enemy: '#FF5500', // Orange Neon
  projectile: '#FFFFAA', // White/Yellow
  mushroom: '#FF0055', // Red/Pink Mushroom
};

// Level Design
const TILE_SIZE = 40;

// Helper to create a platform
const p = (x: number, y: number, w: number, h: number = TILE_SIZE, type: Platform['type'] = 'solid'): Platform => ({
  x: x * TILE_SIZE,
  y: y * TILE_SIZE,
  w: w * TILE_SIZE,
  h: h,
  type
});

// Helper to create an enemy
let enemyIdCounter = 0;
const e = (x: number, y: number, patrolDist: number = 3): Enemy => ({
  id: enemyIdCounter++,
  x: x * TILE_SIZE,
  y: y * TILE_SIZE,
  w: 30,
  h: 30,
  vx: ENEMY_SPEED,
  vy: 0,
  color: COLORS.enemy,
  facing: 1,
  type: 'goomba',
  patrolStart: x * TILE_SIZE,
  patrolEnd: (x + patrolDist) * TILE_SIZE
});

// Helper for items
let itemIdCounter = 0;
const i = (x: number, y: number): Item => ({
  id: itemIdCounter++,
  x: x * TILE_SIZE,
  y: y * TILE_SIZE,
  w: 30,
  h: 30,
  vx: ITEM_SPEED,
  vy: 0,
  color: COLORS.mushroom,
  facing: 1,
  type: 'mushroom',
  consumed: false
});

// REVISED LEVEL DESIGN - No impossible jumps
export const INITIAL_LEVEL: Platform[] = [
  // Start Area
  p(0, 12, 10),
  
  // 1. The Gap & First Challenge
  p(12, 10, 3), 
  p(16, 12, 3), 
  
  // 2. Lava Run - Adjusted for better reachability
  p(20, 13, 30, TILE_SIZE, 'hazard'), 
  p(21, 9, 3), // Widened
  p(25, 7, 3), // Widened
  p(29, 10, 3), // Widened
  p(33, 7, 3), // LOWERED from y=6 (Impossible) to y=7 (Hard but fair)
  p(37, 9, 3), 
  p(41, 11, 3),

  // 3. The Tower Climb
  p(48, 12, 6),
  p(55, 10, 3), // Widened
  p(59, 8, 3),
  p(54, 6, 3),
  p(59, 4, 3),
  p(50, 2, 8), 

  // 4. The Drop - Less punishing landing
  p(65, 8, 3),
  p(69, 12, 3),
  p(73, 10, 2), // Widened from 1
  p(76, 8, 2),  // Widened from 1
  p(79, 11, 20), // Landing zone 

  // 5. Stairs
  p(102, 10, 3),
  p(105, 8, 3),
  p(108, 6, 3),
  p(111, 4, 3),
  p(114, 2, 3), 

  // 6. The Final Gauntlet - Fixed impossible height
  p(120, 14, 40, TILE_SIZE, 'hazard'), 
  p(120, 6, 3), 
  p(125, 8, 3),
  p(130, 6, 3),
  p(135, 9, 3),
  p(140, 7, 3), // LOWERED from y=5 (Impossible) to y=7 (Fair)
  p(145, 8, 3),

  // Goal
  p(155, 11, 5, 80, 'goal'),
];

export const INITIAL_ENEMIES: Enemy[] = [
  e(12, 9, 2),
  e(21, 8, 2),
  e(33, 6, 2),
  e(50, 1, 6), 
  
  // Swarm zone
  e(80, 10, 3),
  e(84, 10, 3),
  e(88, 10, 3),
  e(92, 10, 3),
  e(96, 10, 3),

  // Gauntlet snipers
  e(125, 7, 2),
  e(135, 8, 2),
  e(145, 7, 2),
];

export const INITIAL_ITEMS: Item[] = [
  i(13, 8), 
  i(52, 0), 
  i(100, 9), 
];