
export interface NavItem {
  label: string;
  href: string;
}

export enum GameState {
  IDLE = 'IDLE',
  STARTING = 'STARTING',
  PLAYING = 'PLAYING'
}

export enum AppView {
  HOME = 'HOME',
  GAME_SELECTION = 'GAME_SELECTION',
  SETTINGS = 'SETTINGS'
}

export interface KeyBinding {
  id: string;
  label: string;
  key: string;
}

// Gamepad Configuration Types
export type ControlType = 'button' | 'axis';

export interface GamepadControlConfig {
  type: ControlType;
  index: number;
  name: string;
}

export interface GamepadConfig {
  btnA: GamepadControlConfig;
  btnB: GamepadControlConfig;
  btnX: GamepadControlConfig;
  btnY: GamepadControlConfig;
  btnL: GamepadControlConfig;
  btnR: GamepadControlConfig;
  btnStart: GamepadControlConfig;
  btnSelect: GamepadControlConfig;
  stickX: GamepadControlConfig;
  stickY: GamepadControlConfig;
  [key: string]: GamepadControlConfig;
}

export interface AxisCalibration {
  [index: number]: number; // axis index -> offset value
}