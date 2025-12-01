import React, { useRef, useEffect, useState } from 'react';
import { GameState, InputState, Platform, Particle, Entity, Enemy, Projectile, Item } from '../../../types';
import { INITIAL_LEVEL, INITIAL_ENEMIES, INITIAL_ITEMS, COLORS, GRAVITY, FRICTION, ACCELERATION, JUMP_FORCE, MAX_SPEED, TERMINAL_VELOCITY, PROJECTILE_SPEED, TIME_LIMIT } from '../constants';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  
  // Game State Ref
  const gameState = useRef<GameState>({
    player: { x: 100, y: 300, w: 30, h: 30, vx: 0, vy: 0, color: COLORS.primary, facing: 1, isBig: false, invulnerableUntil: 0 },
    platforms: INITIAL_LEVEL,
    enemies: JSON.parse(JSON.stringify(INITIAL_ENEMIES)),
    items: JSON.parse(JSON.stringify(INITIAL_ITEMS)),
    projectiles: [],
    particles: [],
    camera: { x: 0 },
    score: 0,
    status: 'menu',
    time: 0,
    timeLeft: TIME_LIMIT,
    lastShotTime: 0
  });

  const [uiStatus, setUiStatus] = useState<'menu' | 'playing' | 'won' | 'gameover'>('menu');

  // Input Handling
  const input = useRef<InputState>({
    left: false, right: false, up: false, down: false, jump: false, action: false
  });

  // Sound Synth
  const playSound = (type: 'jump' | 'shoot' | 'enemyHit' | 'win' | 'powerup' | 'shrink') => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'jump') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'shoot') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'enemyHit') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'powerup') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.1);
      osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'shrink') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'win') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  };

  const playGameOverTune = () => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const notes = [
      { f: 400, d: 0.15, t: 0 },
      { f: 300, d: 0.15, t: 0.2 },
      { f: 200, d: 0.35, t: 0.4 }, 
      { f: 100, d: 0.5, t: 0.8 } 
    ];

    notes.forEach(n => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(n.f, ctx.currentTime + n.t);
      gain.gain.setValueAtTime(0.1, ctx.currentTime + n.t);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + n.t + n.d);
      osc.start(ctx.currentTime + n.t);
      osc.stop(ctx.currentTime + n.t + n.d);
    });
  };

  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.code) {
        case 'ArrowLeft': case 'KeyA': input.current.left = true; break;
        case 'ArrowRight': case 'KeyD': input.current.right = true; break;
        case 'ArrowUp': case 'KeyW': case 'Space': 
            if (!input.current.jump) input.current.jump = true; 
            break;
        case 'KeyZ': case 'KeyX': case 'ShiftLeft': input.current.action = true; break;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      switch(e.code) {
        case 'ArrowLeft': case 'KeyA': input.current.left = false; break;
        case 'ArrowRight': case 'KeyD': input.current.right = false; break;
        case 'ArrowUp': case 'KeyW': case 'Space': input.current.jump = false; break;
        case 'KeyZ': case 'KeyX': case 'ShiftLeft': input.current.action = false; break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Gamepad Polling
  const pollGamepad = () => {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    let gp = null;
    for (const g of gamepads) {
      if (g && g.connected) {
        gp = g;
        break;
      }
    }
    
    if (gp) {
      const threshold = 0.5;
      input.current.left = gp.axes[0] < -threshold || (gp.buttons[14] && gp.buttons[14].pressed);
      input.current.right = gp.axes[0] > threshold || (gp.buttons[15] && gp.buttons[15].pressed);
      
      // Mando: A (Button 0) = Disparar (requested), B (Button 1) = Saltar
      input.current.action = gp.buttons[0].pressed || gp.buttons[2].pressed; 
      input.current.jump = gp.buttons[1].pressed || gp.buttons[3].pressed;
    }
  };

  const spawnParticles = (x: number, y: number, color: string, count: number) => {
    if (gameState.current.particles.length > 100) return; // Limit particles for performance
    for (let i = 0; i < count; i++) {
      gameState.current.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1.0,
        color: color,
        size: Math.random() * 4 + 2
      });
    }
  };

  const resetGame = () => {
    gameState.current.player = { x: 100, y: 300, w: 30, h: 30, vx: 0, vy: 0, color: COLORS.primary, facing: 1, isBig: false, invulnerableUntil: 0 };
    gameState.current.status = 'playing';
    gameState.current.camera.x = 0;
    gameState.current.particles = [];
    gameState.current.projectiles = [];
    gameState.current.enemies = JSON.parse(JSON.stringify(INITIAL_ENEMIES));
    gameState.current.items = JSON.parse(JSON.stringify(INITIAL_ITEMS));
    gameState.current.timeLeft = TIME_LIMIT;
    setUiStatus('playing');
  };

  const update = () => {
    if (gameState.current.status !== 'playing') return;

    pollGamepad();

    const state = gameState.current;
    const player = state.player;
    const now = Date.now();
    
    // Fixed dt is handled by the loop frequency now, but we keep calculations consistent
    const dt = 1/60; 

    // Timer
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
        die();
        return;
    }

    // --- Player Actions ---

    // Shooting
    if (input.current.action && now - state.lastShotTime > 250) {
        playSound('shoot');
        state.lastShotTime = now;
        const shootY = player.isBig ? player.y + 20 : player.y + 10;
        state.projectiles.push({
            x: player.facing === 1 ? player.x + player.w : player.x - 10,
            y: shootY,
            w: 12,
            h: 12,
            vx: player.facing * PROJECTILE_SPEED,
            vy: 0,
            life: 60,
            color: COLORS.projectile
        });
    }

    // Horizontal Movement
    if (input.current.left) {
      player.vx -= ACCELERATION;
      player.facing = -1;
    }
    if (input.current.right) {
      player.vx += ACCELERATION;
      player.facing = 1;
    }

    // Friction & Limits
    player.vx *= FRICTION;
    player.vx = Math.max(Math.min(player.vx, MAX_SPEED), -MAX_SPEED);
    if (Math.abs(player.vx) < 0.1) player.vx = 0;

    // Gravity
    player.vy += GRAVITY;
    player.vy = Math.min(player.vy, TERMINAL_VELOCITY);

    // Apply Velocity
    player.x += player.vx;
    player.y += player.vy;

    // --- Physics / Collisions ---
    
    // Bounds (Death by falling)
    if (player.y > CANVAS_HEIGHT + 200) {
      die();
      return;
    }

    let grounded = false;

    // Platform Collision
    for (const plat of state.platforms) {
      if (
        player.x < plat.x + plat.w &&
        player.x + player.w > plat.x &&
        player.y < plat.y + plat.h &&
        player.y + player.h > plat.y
      ) {
        
        if (plat.type === 'hazard') {
          takeDamage();
          return;
        }

        if (plat.type === 'goal') {
          win();
          return;
        }

        const prevY = player.y - player.vy;
        
        // Land on top
        if (prevY + player.h <= plat.y + (Math.abs(player.vy) + 5)) { // Tolerance
          player.y = plat.y - player.h;
          player.vy = 0;
          grounded = true;
        } 
        // Hit head
        else if (prevY >= plat.y + plat.h - (Math.abs(player.vy) + 5)) {
          player.y = plat.y + plat.h;
          player.vy = 0;
        }
        // Hit Side
        else {
           const prevX = player.x - player.vx;
           if (prevX + player.w <= plat.x) {
             player.x = plat.x - player.w;
             player.vx = 0;
           } else if (prevX >= plat.x + plat.w) {
             player.x = plat.x + plat.w;
             player.vx = 0;
           }
        }
      }
    }

    // Jumping
    if (grounded) {
        if (input.current.jump) {
            player.vy = JUMP_FORCE;
            playSound('jump');
            spawnParticles(player.x + player.w/2, player.y + player.h, COLORS.primary, 3);
        }
    }

    // --- Items (Mushrooms) ---
    for (const item of state.items) {
        if (item.consumed) continue;

        // Gravity
        item.vy += GRAVITY;
        item.x += item.vx;
        item.y += item.vy;

        // Platform collision for Item
        for (const plat of state.platforms) {
            if (
                item.x < plat.x + plat.w &&
                item.x + item.w > plat.x &&
                item.y < plat.y + plat.h &&
                item.y + item.h > plat.y
            ) {
                 const prevY = item.y - item.vy;
                 if (prevY + item.h <= plat.y + 10) {
                     item.y = plat.y - item.h;
                     item.vy = 0;
                 } else {
                     // Wall bounce
                     item.vx *= -1; 
                 }
            }
        }

        // Player Collision
        if (
            player.x < item.x + item.w &&
            player.x + player.w > item.x &&
            player.y < item.y + item.h &&
            player.y + player.h > item.y
        ) {
            item.consumed = true;
            playSound('powerup');
            player.isBig = true;
            player.y -= 15; // Pop up to avoid ground stuck
            player.h = 50; 
            spawnParticles(player.x, player.y, COLORS.mushroom, 20);
        }
    }

    // --- Enemies ---
    for (let i = state.enemies.length - 1; i >= 0; i--) {
        const enemy = state.enemies[i];
        
        // Simple Patrol Logic
        enemy.x += enemy.vx;
        if (enemy.x > enemy.patrolEnd) {
            enemy.vx = -Math.abs(enemy.vx);
            enemy.facing = -1;
        } else if (enemy.x < enemy.patrolStart) {
            enemy.vx = Math.abs(enemy.vx);
            enemy.facing = 1;
        }

        // Collision with Player
        if (
            player.x < enemy.x + enemy.w &&
            player.x + player.w > enemy.x &&
            player.y < enemy.y + enemy.h &&
            player.y + player.h > enemy.y
        ) {
            const playerBottom = player.y + player.h;
            // Generous hit box for stomping
            if (player.vy > 0 && playerBottom <= enemy.y + (enemy.h * 0.8)) {
                // Kill Enemy
                playSound('enemyHit');
                spawnParticles(enemy.x + enemy.w/2, enemy.y + enemy.h/2, COLORS.enemy, 15);
                state.enemies.splice(i, 1);
                
                // Bounce Player
                player.vy = JUMP_FORCE * 0.7;
                continue;
            } else {
                takeDamage();
                if (state.status === 'gameover') return;
            }
        }
    }

    // --- Projectiles ---
    for (let i = state.projectiles.length - 1; i >= 0; i--) {
        const proj = state.projectiles[i];
        proj.x += proj.vx;
        proj.life--;

        // Hit Enemy?
        let hit = false;
        for (let j = state.enemies.length - 1; j >= 0; j--) {
            const enemy = state.enemies[j];
            if (
                proj.x < enemy.x + enemy.w &&
                proj.x + proj.w > enemy.x &&
                proj.y < enemy.y + enemy.h &&
                proj.y + proj.h > enemy.y
            ) {
                // Kill Enemy
                playSound('enemyHit');
                spawnParticles(enemy.x + enemy.w/2, enemy.y + enemy.h/2, COLORS.enemy, 10);
                state.enemies.splice(j, 1);
                hit = true;
                break;
            }
        }

        // Cleanup
        if (hit || proj.life <= 0) {
            state.projectiles.splice(i, 1);
            if(hit) spawnParticles(proj.x, proj.y, COLORS.projectile, 5);
        }
    }

    // --- Camera ---
    const targetCamX = player.x - CANVAS_WIDTH / 3;
    const clampedTarget = Math.max(0, targetCamX);
    state.camera.x += (clampedTarget - state.camera.x) * 0.1;

    // --- Particles ---
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.05;
      if (p.life <= 0) state.particles.splice(i, 1);
    }
  };

  const takeDamage = () => {
    const state = gameState.current;
    if (state.player.invulnerableUntil && Date.now() < state.player.invulnerableUntil) return;

    if (state.player.isBig) {
        playSound('shrink');
        state.player.isBig = false;
        state.player.h = 30; // Shrink
        state.player.y += 20; // Correct pos
        state.player.invulnerableUntil = Date.now() + 2000; // 2 sec i-frames
        spawnParticles(state.player.x, state.player.y, COLORS.secondary, 20);
    } else {
        die();
    }
  };

  const die = () => {
    if (gameState.current.status === 'gameover') return;
    playGameOverTune();
    spawnParticles(gameState.current.player.x, gameState.current.player.y, COLORS.hazard, 30);
    gameState.current.status = 'gameover';
    setUiStatus('gameover');
  };

  const win = () => {
    if (gameState.current.status === 'won') return;
    playSound('win');
    spawnParticles(gameState.current.player.x, gameState.current.player.y, COLORS.goal, 50);
    gameState.current.status = 'won';
    setUiStatus('won');
  };

  // --- RENDERING HELPERS ---

  const drawPlayer = (ctx: CanvasRenderingContext2D, p: Entity) => {
    // Flicker if invulnerable
    if (p.invulnerableUntil && Date.now() < p.invulnerableUntil) {
        if (Math.floor(Date.now() / 50) % 2 === 0) return;
    }

    const isMoving = Math.abs(p.vx) > 0.5;
    
    // Base unit size
    const u = p.w / 12; 
    
    const x = p.x;
    const y = p.y;
    const w = p.w;

    const C_HAT = COLORS.secondary; 
    const C_OVERALL = COLORS.primary; 
    const C_SKIN = '#FFFFFF'; 
    
    ctx.save();
    
    if (p.facing < 0) {
        ctx.translate(x + w, y);
        ctx.scale(-1, 1);
        ctx.translate(-x, -y); 
    }

    // If Big, we draw a slightly different, taller sprite
    if (p.isBig) {
        // Taller Sprite Logic
        // Hat
        ctx.fillStyle = C_HAT;
        ctx.fillRect(x + 2*u, y, 10*u, 3*u);
        
        // Face
        ctx.fillStyle = C_SKIN;
        ctx.fillRect(x + 3*u, y + 3*u, 7*u, 5*u);
        
        // Body / Shirt
        ctx.fillStyle = C_HAT;
        ctx.fillRect(x + 2*u, y + 8*u, 8*u, 5*u);

        // Overalls
        ctx.fillStyle = C_OVERALL;
        ctx.fillRect(x + 2*u, y + 12*u, 8*u, 6*u);

        // Boots
        ctx.fillStyle = '#444';
        if (isMoving && Math.floor(Date.now() / 150) % 2 === 0) {
            ctx.fillRect(x + 1*u, y + 17*u, 4*u, 3*u); // Left foot forward
            ctx.fillRect(x + 8*u, y + 16*u, 3*u, 3*u);
        } else {
            ctx.fillRect(x + 1*u, y + 18*u, 4*u, 2*u);
            ctx.fillRect(x + 7*u, y + 18*u, 4*u, 2*u);
        }

        // Hands (Shooting?)
        ctx.fillStyle = C_SKIN;
        if (Date.now() - gameState.current.lastShotTime < 150) {
            ctx.fillRect(x + 10*u, y + 9*u, 3*u, 3*u);
        } else {
            ctx.fillRect(x - 1*u, y + 9*u, 3*u, 3*u);
            ctx.fillRect(x + 9*u, y + 9*u, 3*u, 3*u);
        }

    } else {
        // Small Sprite (Standard)
        // Hat
        ctx.fillStyle = C_HAT;
        ctx.fillRect(x + 3*u, y, 6*u, 2*u); 
        ctx.fillRect(x + 2*u, y + 2*u, 9*u, 2*u); 

        // Face
        ctx.fillStyle = C_SKIN;
        ctx.fillRect(x + 2*u, y + 4*u, 7*u, 4*u);

        // Body
        ctx.fillStyle = C_HAT;
        ctx.fillRect(x + 3*u, y + 8*u, 6*u, 3*u);
        ctx.fillRect(x + 1*u, y + 8*u, 3*u, 3*u); // Arms
        ctx.fillRect(x + 8*u, y + 8*u, 3*u, 3*u); 

        // Overalls
        ctx.fillStyle = C_OVERALL;
        ctx.fillRect(x + 3*u, y + 11*u, 6*u, 3*u);
        ctx.fillRect(x + 3*u, y + 10*u, 1*u, 2*u);
        ctx.fillRect(x + 8*u, y + 10*u, 1*u, 2*u);

        // Boots
        ctx.fillStyle = '#444';
        if (isMoving && Math.floor(Date.now() / 150) % 2 === 0) {
            ctx.fillRect(x + 1*u, y + 14*u, 4*u, 2*u);
            ctx.fillRect(x + 9*u, y + 12*u, 3*u, 2*u);
        } else {
            ctx.fillRect(x + 2*u, y + 14*u, 3*u, 2*u);
            ctx.fillRect(x + 7*u, y + 14*u, 3*u, 2*u);
        }
        
        // Hand up if shooting
        if (Date.now() - gameState.current.lastShotTime < 150) {
            ctx.fillStyle = C_SKIN;
            ctx.fillRect(x + 11*u, y + 6*u, 2*u, 2*u);
        }
    }

    ctx.restore();
  };

  const drawEnemy = (ctx: CanvasRenderingContext2D, e: Enemy) => {
    const x = e.x;
    const y = e.y;
    const w = e.w;
    const h = e.h;
    
    const bob = Math.sin(Date.now() / 100) * 2;
    
    ctx.save();
    ctx.translate(x + w/2, y + h/2 + bob);
    if (e.vx > 0) ctx.scale(-1, 1);
    ctx.translate(-(x + w/2), -(y + h/2));

    ctx.fillStyle = COLORS.enemy;
    ctx.beginPath();
    ctx.arc(x + w/2, y + h/2, w/2, Math.PI, 0);
    ctx.fill();
    
    ctx.fillStyle = '#FFE4C4'; 
    ctx.fillRect(x + w/3, y + h/2, w/3, h/2);

    ctx.fillStyle = '#000';
    ctx.fillRect(x + w/3 + 2, y + h/2 + 2, 4, 8); 
    ctx.fillRect(x + w/2 + 2, y + h/2 + 2, 4, 8);

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + w/3, y + h/2 + 2);
    ctx.lineTo(x + w/2, y + h/2 + 6);
    ctx.moveTo(x + w/2 + 2, y + h/2 + 6);
    ctx.lineTo(x + w*0.7, y + h/2 + 2);
    ctx.stroke();

    ctx.restore();
  };

  const drawItem = (ctx: CanvasRenderingContext2D, i: Item) => {
      if (i.consumed) return;
      const x = i.x;
      const y = i.y;
      const w = i.w;
      
      // Mushroom Head
      ctx.fillStyle = COLORS.mushroom;
      ctx.beginPath();
      ctx.arc(x + w/2, y + w/2, w/2, Math.PI, 0);
      ctx.fill();

      // Spots
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(x + w/2, y + w/4, w/8, 0, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + w/4, y + w/2, w/10, 0, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + w*0.75, y + w/2, w/10, 0, Math.PI*2);
      ctx.fill();

      // Stem
      ctx.fillStyle = '#FFE4C4';
      ctx.fillRect(x + w/3, y + w/2, w/3, w/2);
      
      // Eyes
      ctx.fillStyle = '#000';
      ctx.fillRect(x + w/3 + 2, y + w/2 + 4, 2, 6);
      ctx.fillRect(x + w/2 + 4, y + w/2 + 4, 2, 6);
  };

  const drawBackground = (ctx: CanvasRenderingContext2D, camX: number) => {
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#330033';
      
      // Far hills
      ctx.beginPath();
      for(let i=0; i<30; i++) {
         const cx = (i * 300) - (camX * 0.2);
         ctx.moveTo(cx, CANVAS_HEIGHT);
         ctx.quadraticCurveTo(cx + 150, CANVAS_HEIGHT - 200, cx + 300, CANVAS_HEIGHT);
      }
      ctx.stroke();

      // Near hills
      ctx.strokeStyle = COLORS.secondary;
      ctx.globalAlpha = 0.2;
      ctx.beginPath();
      for(let i=0; i<50; i++) {
         const cx = (i * 200) - (camX * 0.5);
         ctx.moveTo(cx, CANVAS_HEIGHT);
         ctx.quadraticCurveTo(cx + 100, CANVAS_HEIGHT - 100, cx + 200, CANVAS_HEIGHT);
      }
      ctx.stroke();
      ctx.globalAlpha = 1.0;
  };

  const drawHUD = (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = '#FFF';
      ctx.font = '16px "Press Start 2P"';
      ctx.textAlign = 'left';
      
      // Time
      const t = Math.max(0, Math.ceil(gameState.current.timeLeft));
      ctx.fillStyle = t < 20 ? '#FF3333' : '#FFFFFF';
      ctx.fillText(`TIEMPO: ${t}`, 20, 30);

      // Score placeholder or status
      ctx.fillStyle = '#00FFFF';
      ctx.fillText(`VIDA: ${gameState.current.player.isBig ? 'GRANDE' : 'PEQ'}`, 20, 55);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameState.current;

    // Clear
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    drawBackground(ctx, state.camera.x);

    // Save context for camera translate
    ctx.save();
    ctx.translate(-state.camera.x, 0);

    // Grid Floor Line
    ctx.strokeStyle = '#222';
    ctx.beginPath();
    ctx.moveTo(state.camera.x, 500);
    ctx.lineTo(state.camera.x + CANVAS_WIDTH, 500);
    ctx.stroke();

    // Platforms - Removed shadowBlur for performance
    for (const plat of state.platforms) {
      if (plat.type === 'hazard') {
        ctx.fillStyle = COLORS.hazard;
        const spikes = plat.w / 20;
        ctx.beginPath();
        for(let i=0; i<spikes; i++) {
           ctx.moveTo(plat.x + (i*20), plat.y + plat.h);
           ctx.lineTo(plat.x + (i*20) + 10, plat.y + (Math.sin(Date.now()/200 + i)*5)); 
           ctx.lineTo(plat.x + (i*20) + 20, plat.y + plat.h);
        }
        ctx.fill();

      } else if (plat.type === 'goal') {
        ctx.fillStyle = COLORS.goal;
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
        ctx.fillStyle = '#000';
        ctx.font = '10px "Press Start 2P"';
        ctx.fillText("FIN", plat.x - 5, plat.y + 20);
      } else {
        ctx.strokeStyle = COLORS.secondary;
        ctx.lineWidth = 2;
        ctx.fillStyle = '#111';
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
        ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);
        
        ctx.fillStyle = COLORS.secondary;
        ctx.globalAlpha = 0.3;
        const brickW = 20;
        const brickH = 10;
        for(let by = 0; by < plat.h; by+=brickH) {
             for(let bx = 0; bx < plat.w; bx+=brickW) {
                 ctx.fillRect(plat.x + bx + 2, plat.y + by + 2, brickW - 4, brickH - 4);
             }
        }
        ctx.globalAlpha = 1.0;
      }
    }

    // Items
    for (const i of state.items) {
        drawItem(ctx, i);
    }

    // Enemies
    for (const e of state.enemies) {
        drawEnemy(ctx, e);
    }

    // Projectiles
    ctx.fillStyle = COLORS.projectile;
    for (const p of state.projectiles) {
        ctx.beginPath();
        ctx.arc(p.x + p.w/2, p.y + p.h/2, p.w/2, 0, Math.PI*2);
        ctx.fill();
    }

    // Particles
    for (const p of state.particles) {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    // Player
    if (state.status !== 'gameover') {
      drawPlayer(ctx, state.player);
    }

    ctx.restore();

    // Draw HUD (Fixed on screen)
    if (state.status === 'playing') {
        drawHUD(ctx);
    }
  };

  const gameLoop = (timestamp: number) => {
    // Delta Time Cap: Ensure update runs ~60 FPS even on 120Hz screens to prevent speedup
    const deltaTime = timestamp - lastTimeRef.current;
    
    if (deltaTime >= 16) { 
        lastTimeRef.current = timestamp - (deltaTime % 16);
        update();
        draw();
    }
    
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="relative">
      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT}
        className="block bg-black"
        style={{
            maxWidth: '100%',
            height: 'auto',
            imageRendering: 'pixelated'
        }}
      />
      
      {uiStatus === 'menu' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white z-10">
          <h2 className="text-3xl mb-8 animate-bounce text-center" style={{color: COLORS.primary}}>
            PRESIONA START / ESPACIO
          </h2>
          <div className="mb-4 text-xs text-center text-gray-400">
             CONTROLES: FLECHAS (Mover), ESPACIO/B (Saltar), Z/X/A (Disparar)
          </div>
          <button 
            onClick={resetGame}
            className="px-8 py-4 bg-transparent border-4 hover:bg-white/10 transition-colors font-bold text-xl uppercase tracking-widest"
            style={{borderColor: COLORS.secondary, color: COLORS.secondary, textShadow: `0 0 10px ${COLORS.secondary}`}}
          >
            Iniciar Juego
          </button>
        </div>
      )}

      {uiStatus === 'gameover' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white z-10">
          <h2 className="text-4xl mb-4" style={{color: COLORS.hazard}}>GAME OVER</h2>
          <p className="text-sm mb-8 text-gray-400">
             {gameState.current.timeLeft <= 0 ? "¡TIEMPO AGOTADO!" : "¡Inténtalo de nuevo!"}
          </p>
          <button 
            onClick={resetGame}
            className="px-6 py-3 border-2 hover:bg-white/10 transition-colors font-bold uppercase"
            style={{borderColor: COLORS.primary, color: COLORS.primary}}
          >
            Reintentar
          </button>
        </div>
      )}

      {uiStatus === 'won' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white z-10">
          <h2 className="text-4xl mb-4" style={{color: COLORS.goal}}>¡VICTORIA!</h2>
          <p className="text-lg mb-8">¡Completaste el Nivel JoyBit!</p>
          <button 
            onClick={resetGame}
            className="px-6 py-3 border-2 hover:bg-white/10 transition-colors font-bold uppercase"
            style={{borderColor: COLORS.primary, color: COLORS.primary}}
          >
            Jugar de nuevo
          </button>
        </div>
      )}
    </div>
  );
};

export default GameCanvas;