
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Gamepad2, Save, RotateCcw, Download, Zap, Activity, AlertTriangle, Joystick } from 'lucide-react';
import { GamepadConfig, AxisCalibration } from '../types';
import { useGamepadNav } from '../hooks/useGamepadNav';

interface SettingsMenuProps {
  onBack: () => void;
}

// --- CONSTANTS & DEFAULTS ---
const DEADZONE = 0.25;
const DETECTION_THRESHOLD = 0.35;
const CALIBRATION_SAMPLES = 30;
const STORAGE_KEY = 'joybit_config_v2'; 

const DEFAULT_CONFIG: GamepadConfig = {
  btnA: { type: 'button', index: 0, name: 'Botón 0 (A)' },
  btnB: { type: 'button', index: 1, name: 'Botón 1 (B)' },
  btnX: { type: 'button', index: 2, name: 'Botón 2 (X)' },
  btnY: { type: 'button', index: 3, name: 'Botón 3 (Y)' },
  btnL: { type: 'button', index: 4, name: 'Bumper L' },
  btnR: { type: 'button', index: 5, name: 'Bumper R' },
  btnStart: { type: 'button', index: 9, name: 'Start' },
  btnSelect: { type: 'button', index: 8, name: 'Select' },
  stickX: { type: 'axis', index: 0, name: 'Stick X' },
  stickY: { type: 'axis', index: 1, name: 'Stick Y' }
};

const DEFAULT_CALIBRATION: AxisCalibration = { 0: 0, 1: 0, 2: 0, 3: 0 };

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ onBack }) => {
  // --- STATE ---
  const [config, setConfig] = useState<GamepadConfig>(DEFAULT_CONFIG);
  const [gamepadIndex, setGamepadIndex] = useState<number>(-1);
  const [isConnected, setIsConnected] = useState(false);
  const [gamepadId, setGamepadId] = useState<string>('');
  
  const [mappingKey, setMappingKey] = useState<string | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ text: string, type: 'success' | 'warning' } | null>(null);

  // --- REFS ---
  const axisCalibrationRef = useRef<AxisCalibration>(DEFAULT_CALIBRATION);
  const calibrationSamplesRef = useRef<number[][]>([]);
  const requestRef = useRef<number>(0);
  const testDisplayRef = useRef<HTMLDivElement>(null);
  const mappingTimeoutRef = useRef<number | undefined>(undefined);

  // --- NAVIGATION HOOK INTEGRATION ---
  // List of all interactive IDs in linear order
  const focusableIds = [
    'btn-back-settings',
    'btn-manual-connect',
    // Left Col
    'btn-map-btnA', 'btn-map-btnB', 'btn-map-btnX', 'btn-map-btnY',
    // Mid Col
    'btn-map-btnL', 'btn-map-btnR', 'btn-map-btnSelect', 'btn-map-btnStart',
    // Right Col
    'btn-map-stickX', 'btn-map-stickY',
    // Tools
    'btn-tool-calibrate', 'btn-tool-reset', 'btn-tool-export', 'btn-tool-save'
  ];

  // DISABLE navigation when mapping or calibrating to prevent conflict
  const isNavEnabled = !mappingKey && !isCalibrating;
  const focusedIndex = useGamepadNav(focusableIds, isNavEnabled);
  const focusedId = focusableIds[focusedIndex];

  // --- HELPER FUNCTIONS ---
  
  const showAlert = (text: string, type: 'success' | 'warning') => {
    setAlertMsg({ text, type });
    setTimeout(() => setAlertMsg(null), 3000);
  };

  const getCalibratedAxis = (axisIndex: number, rawValue: number) => {
    const offset = axisCalibrationRef.current[axisIndex] || 0;
    let calibrated = rawValue - offset;
    if (Math.abs(calibrated) < DEADZONE) calibrated = 0;
    return calibrated;
  };

  // --- LIFECYCLE: LOAD & SAVE ---

  useEffect(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) { console.error("Error loading config", e); }
    }
    const savedCalibration = localStorage.getItem('axisCalibration');
    if (savedCalibration) {
      try {
        axisCalibrationRef.current = JSON.parse(savedCalibration);
      } catch (e) { console.error("Error loading calibration", e); }
    }

    const handleConnect = (e: GamepadEvent) => {
      setGamepadIndex(e.gamepad.index);
      setGamepadId(e.gamepad.id);
      setIsConnected(true);
      showAlert('Gamepad Conectado', 'success');
      setTimeout(() => startCalibration(e.gamepad.index), 500);
    };

    const handleDisconnect = () => {
      setGamepadIndex(-1);
      setIsConnected(false);
      setGamepadId('');
      showAlert('Gamepad Desconectado', 'warning');
    };

    window.addEventListener('gamepadconnected', handleConnect);
    window.addEventListener('gamepaddisconnected', handleDisconnect);

    const gps = navigator.getGamepads();
    for (const gp of gps) {
      if (gp) {
        handleConnect({ gamepad: gp } as GamepadEvent);
        break;
      }
    }

    return () => {
      window.removeEventListener('gamepadconnected', handleConnect);
      window.removeEventListener('gamepaddisconnected', handleDisconnect);
      cancelAnimationFrame(requestRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- GAME LOOP ---

  const loop = useCallback(() => {
    const gps = navigator.getGamepads();
    const gp = gamepadIndex >= 0 ? gps[gamepadIndex] : null;

    if (gp) {
      if (isCalibrating) {
        calibrationSamplesRef.current.push([...gp.axes]);
        if (calibrationSamplesRef.current.length >= CALIBRATION_SAMPLES) {
          finishCalibration();
        }
      }

      if (mappingKey && !isCalibrating) {
        for (let i = 0; i < gp.buttons.length; i++) {
          if (gp.buttons[i].pressed) {
            assignControl(mappingKey, 'button', i, `Botón ${i}`);
            break;
          }
        }
        for (let i = 0; i < gp.axes.length; i++) {
          const val = getCalibratedAxis(i, gp.axes[i]);
          if (Math.abs(val) > DETECTION_THRESHOLD) {
            const axisName = i === 0 ? 'Stick Izq X' :
                             i === 1 ? 'Stick Izq Y' :
                             i === 2 ? 'Stick Der X' :
                             i === 3 ? 'Stick Der Y' : `Eje ${i}`;
            assignControl(mappingKey, 'axis', i, axisName);
            break;
          }
        }
      }

      if (testDisplayRef.current) {
        updateTestDisplayDOM(gp);
      }
    }

    requestRef.current = requestAnimationFrame(loop);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamepadIndex, isCalibrating, mappingKey]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [loop]);

  // --- ACTIONS ---

  const startCalibration = (index: number) => {
    if (isCalibrating) return;
    setIsCalibrating(true);
    calibrationSamplesRef.current = [];
    showAlert('Calibrando... No toques los joysticks', 'warning');
  };

  const finishCalibration = () => {
    const samples = calibrationSamplesRef.current;
    if (samples.length === 0) return;
    const newCalibration: AxisCalibration = { ...axisCalibrationRef.current };
    for (let axis = 0; axis < 4; axis++) {
      let sum = 0;
      for (const sample of samples) sum += sample[axis] || 0;
      newCalibration[axis] = sum / samples.length;
    }
    axisCalibrationRef.current = newCalibration;
    localStorage.setItem('axisCalibration', JSON.stringify(newCalibration));
    setIsCalibrating(false);
    showAlert('¡Calibración Completada!', 'success');
  };

  const startMapping = (key: string) => {
    if (!isConnected) {
      showAlert('Conecta un gamepad primero', 'warning');
      return;
    }
    setMappingKey(key);
    showAlert('Presiona un botón o mueve un joystick...', 'warning');
    if (mappingTimeoutRef.current) clearTimeout(mappingTimeoutRef.current);
    mappingTimeoutRef.current = setTimeout(() => {
      setMappingKey(null);
      showAlert('Tiempo de espera agotado', 'warning');
    }, 10000);
  };

  const assignControl = (key: string, type: 'button'|'axis', index: number, name: string) => {
    setConfig(prev => ({
      ...prev,
      [key]: { type, index, name }
    }));
    setMappingKey(null);
    if (mappingTimeoutRef.current) clearTimeout(mappingTimeoutRef.current);
    showAlert(`Asignado: ${name}`, 'success');
  };

  const updateTestDisplayDOM = (gp: Gamepad) => {
    if (!testDisplayRef.current) return;
    let html = `<div class="grid grid-cols-2 gap-4 text-xs md:text-sm font-mono">`;
    html += `<div><strong class="text-joy-cyan block mb-2">EJES (Calibrados)</strong>`;
    for (let i = 0; i < Math.min(gp.axes.length, 4); i++) {
      const val = getCalibratedAxis(i, gp.axes[i]);
      const color = Math.abs(val) < DEADZONE ? '#64748b' : '#f472b6';
      html += `<div class="flex justify-between mb-1"><span class="text-slate-400">Eje ${i}:</span> <span style="color:${color}">${val.toFixed(2)}</span></div>`;
    }
    html += `</div>`;
    html += `<div><strong class="text-joy-pink block mb-2">BOTONES ACTIVOS</strong>`;
    const pressed = [];
    for (let i = 0; i < gp.buttons.length; i++) {
      if (gp.buttons[i].pressed) pressed.push(i);
    }
    if (pressed.length > 0) {
      pressed.forEach(p => {
        html += `<span class="inline-block bg-joy-pink/20 text-joy-pink px-2 py-0.5 rounded mr-1 mb-1">BTN ${p}</span>`;
      });
    } else {
      html += `<span class="text-slate-600 italic">Ninguno</span>`;
    }
    html += `</div></div>`;
    testDisplayRef.current.innerHTML = html;
  };

  const saveConfig = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    showAlert('Configuración guardada', 'success');
  };

  const resetConfig = () => {
    if (window.confirm('¿Restablecer configuración por defecto?')) {
      setConfig(DEFAULT_CONFIG);
      axisCalibrationRef.current = DEFAULT_CALIBRATION;
      localStorage.removeItem('axisCalibration');
      saveConfig();
      showAlert('Restablecido', 'success');
    }
  };

  const exportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'joybit_config.json';
    link.click();
    showAlert('Archivo exportado', 'success');
  };

  const manualConnect = () => {
    const gps = navigator.getGamepads();
    for (const gp of gps) {
       if (gp) {
         setGamepadIndex(gp.index);
         setGamepadId(gp.id);
         setIsConnected(true);
         showAlert('Conectado manualmente', 'success');
         return;
       }
    }
    showAlert('No se detectó gamepad', 'warning');
  };

  // --- RENDER ---
  return (
    <div className="relative z-20 flex flex-col items-center w-full max-w-6xl px-4 h-full md:h-[90vh] animate-in fade-in slide-in-from-bottom-10 duration-500">
      
      {alertMsg && (
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full font-epic font-bold text-black shadow-[0_0_20px_rgba(0,0,0,0.5)] z-50 animate-bounce ${alertMsg.type === 'success' ? 'bg-joy-cyan shadow-joy-cyan/50' : 'bg-yellow-400 shadow-yellow-400/50'}`}>
          {alertMsg.text}
        </div>
      )}

      {/* HEADER */}
      <div className="w-full flex items-center justify-between mt-4 mb-4 shrink-0">
        <button 
          id="btn-back-settings"
          onClick={onBack}
          className={`group flex items-center gap-2 font-epic text-xl uppercase tracking-widest px-3 py-1 rounded transition-all
             ${focusedId === 'btn-back-settings' ? 'text-white bg-joy-cyan/20 ring-2 ring-joy-cyan' : 'text-joy-cyan hover:text-white'}
          `}
        >
          <ArrowLeft className="w-6 h-6 group-hover:-translate-x-2 transition-transform" />
          Volver
        </button>
        <div className="text-center hidden md:block">
           <h2 className="font-logo text-3xl text-white drop-shadow-[0_0_10px_rgba(244,114,182,0.8)]">
             Mapeo de Mando
           </h2>
        </div>
        <div className="w-24"></div> 
      </div>

      <div className="w-full overflow-y-auto custom-scrollbar pb-10 pr-2 space-y-6">
        
        {/* CONNECTION CARD */}
        <div className="bg-slate-900/80 border-2 border-joy-cyan/30 rounded-xl p-6 backdrop-blur-md shadow-lg relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-joy-cyan/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
           
           <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                 <div className={`w-4 h-4 rounded-full shadow-[0_0_10px_currentColor] transition-colors duration-500 ${isConnected ? 'bg-joy-cyan text-joy-cyan animate-pulse' : 'bg-red-500 text-red-500'}`}></div>
                 <div>
                    <h3 className="font-epic text-xl text-white font-bold tracking-wider">ESTADO DEL DISPOSITIVO</h3>
                    <p className="font-pixel text-[10px] text-slate-400 mt-1 truncate max-w-[200px] md:max-w-md">
                      {isConnected ? gamepadId : 'ESPERANDO CONEXIÓN...'}
                    </p>
                 </div>
              </div>
              <button 
                id="btn-manual-connect"
                onClick={manualConnect}
                className={`px-6 py-2 rounded-full font-epic font-bold uppercase tracking-wider border-2 transition-all 
                  ${focusedId === 'btn-manual-connect' ? 'ring-2 ring-white scale-105' : ''}
                  ${isConnected ? 'border-red-500 text-red-400 hover:bg-red-500/10' : 'border-joy-cyan text-joy-cyan hover:bg-joy-cyan/10 shadow-[0_0_15px_rgba(34,211,238,0.3)]'}
                `}
              >
                {isConnected ? 'Re-escanear' : 'Conectar Gamepad'}
              </button>
           </div>
        </div>

        {/* CONFIG GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           
           {/* LEFT COLUMN: MAIN BUTTONS */}
           <div className="lg:col-span-4 space-y-4">
              <div className="bg-slate-900/80 border-2 border-joy-pink/30 rounded-xl p-5 backdrop-blur-md h-full">
                 <h3 className="flex items-center gap-2 font-epic text-lg text-joy-pink mb-4 border-b border-joy-pink/20 pb-2">
                    <Gamepad2 className="w-5 h-5" /> Botones Principales
                 </h3>
                 <div className="space-y-3">
                    <ConfigItem id="btn-map-btnA" isFocused={focusedId === 'btn-map-btnA'} label="BOTÓN A" config={config.btnA} isMapping={mappingKey === 'btnA'} onMap={() => startMapping('btnA')} color="pink" />
                    <ConfigItem id="btn-map-btnB" isFocused={focusedId === 'btn-map-btnB'} label="BOTÓN B" config={config.btnB} isMapping={mappingKey === 'btnB'} onMap={() => startMapping('btnB')} color="pink" />
                    <ConfigItem id="btn-map-btnX" isFocused={focusedId === 'btn-map-btnX'} label="BOTÓN X" config={config.btnX} isMapping={mappingKey === 'btnX'} onMap={() => startMapping('btnX')} color="pink" />
                    <ConfigItem id="btn-map-btnY" isFocused={focusedId === 'btn-map-btnY'} label="BOTÓN Y" config={config.btnY} isMapping={mappingKey === 'btnY'} onMap={() => startMapping('btnY')} color="pink" />
                 </div>
              </div>
           </div>

            {/* MIDDLE COLUMN: TRIGGERS & SYSTEM */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-slate-900/80 border-2 border-joy-cyan/30 rounded-xl p-5 backdrop-blur-md h-full">
                 <h3 className="flex items-center gap-2 font-epic text-lg text-joy-cyan mb-4 border-b border-joy-cyan/20 pb-2">
                    <Zap className="w-5 h-5" /> Gatillos y Funciones
                 </h3>
                 <div className="space-y-3">
                    <ConfigItem id="btn-map-btnL" isFocused={focusedId === 'btn-map-btnL'} label="GATILLO L" config={config.btnL} isMapping={mappingKey === 'btnL'} onMap={() => startMapping('btnL')} />
                    <ConfigItem id="btn-map-btnR" isFocused={focusedId === 'btn-map-btnR'} label="GATILLO R" config={config.btnR} isMapping={mappingKey === 'btnR'} onMap={() => startMapping('btnR')} />
                    <div className="h-2"></div>
                    <ConfigItem id="btn-map-btnSelect" isFocused={focusedId === 'btn-map-btnSelect'} label="SELECT" config={config.btnSelect} isMapping={mappingKey === 'btnSelect'} onMap={() => startMapping('btnSelect')} />
                    <ConfigItem id="btn-map-btnStart" isFocused={focusedId === 'btn-map-btnStart'} label="START" config={config.btnStart} isMapping={mappingKey === 'btnStart'} onMap={() => startMapping('btnStart')} />
                 </div>
              </div>
           </div>

           {/* RIGHT COLUMN: STICKS & TOOLS */}
           <div className="lg:col-span-4 space-y-4 flex flex-col">
              
              <div className="bg-slate-900/80 border-2 border-slate-600/50 rounded-xl p-5 backdrop-blur-md">
                 <h3 className="flex items-center gap-2 font-epic text-lg text-white mb-4 border-b border-slate-700 pb-2">
                    <Joystick className="w-5 h-5" /> Joysticks
                 </h3>
                 <div className="space-y-3">
                    <ConfigItem id="btn-map-stickX" isFocused={focusedId === 'btn-map-stickX'} label="STICK HORIZ." config={config.stickX} isMapping={mappingKey === 'stickX'} onMap={() => startMapping('stickX')} color="cyan" />
                    <ConfigItem id="btn-map-stickY" isFocused={focusedId === 'btn-map-stickY'} label="STICK VERT." config={config.stickY} isMapping={mappingKey === 'stickY'} onMap={() => startMapping('stickY')} color="cyan" />
                 </div>
              </div>

              <div className="bg-black/40 border border-slate-700 rounded-xl p-4 flex-1 flex flex-col">
                  <div ref={testDisplayRef} className="bg-black/60 rounded p-2 mb-4 text-xs font-mono h-24 overflow-hidden border border-slate-800 shadow-inner">
                      Esperando...
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-auto">
                     <ToolButton id="btn-tool-calibrate" isFocused={focusedId === 'btn-tool-calibrate'} icon={<AlertTriangle className="w-3 h-3" />} label="Calibrar" onClick={() => startCalibration(gamepadIndex)} />
                     <ToolButton id="btn-tool-reset" isFocused={focusedId === 'btn-tool-reset'} icon={<RotateCcw className="w-3 h-3" />} label="Reset" onClick={resetConfig} />
                     <ToolButton id="btn-tool-export" isFocused={focusedId === 'btn-tool-export'} icon={<Download className="w-3 h-3" />} label="Export" onClick={exportConfig} />
                     <ToolButton id="btn-tool-save" isFocused={focusedId === 'btn-tool-save'} icon={<Save className="w-3 h-3" />} label="Guardar" onClick={saveConfig} primary />
                  </div>
              </div>

           </div>

        </div>

        <div className="mt-4 text-center">
            <p className="font-pixel text-[8px] text-slate-500">
                JOYBIT CONFIGURATOR v2.0 • Mapeo universal para controladores ESP32
            </p>
        </div>

      </div>
    </div>
  );
};

// --- SUBCOMPONENTS ---

interface ConfigItemProps {
  id: string;
  label: string;
  config: { name: string; type: string; index: number };
  isMapping: boolean;
  onMap: () => void;
  color?: 'cyan' | 'pink';
  isFocused: boolean;
}

const ConfigItem: React.FC<ConfigItemProps> = ({ id, label, config, isMapping, onMap, color = 'cyan', isFocused }) => {
  const borderColor = isMapping 
    ? 'border-yellow-400 shadow-[0_0_10px_#facc15]'
    : (color === 'cyan' ? 'border-joy-cyan/20 group-hover:border-joy-cyan' : 'border-joy-pink/20 group-hover:border-joy-pink');
    
  const textColor = color === 'cyan' ? 'text-joy-cyan' : 'text-joy-pink';
  const bgColor = isMapping ? 'bg-slate-800' : 'bg-slate-900';

  // Apply visual focus style
  const focusStyle = isFocused ? 'ring-2 ring-white scale-[1.02] bg-slate-800 shadow-lg' : '';

  return (
    <div className={`group ${bgColor} p-3 rounded border transition-all duration-200 ${borderColor} ${focusStyle} flex items-center justify-between`}>
       <div className="flex flex-col">
          <span className={`font-bold font-epic text-sm uppercase tracking-wider ${textColor}`}>{label}</span>
          <span className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
            {isMapping ? <span className="text-yellow-400 animate-pulse">DETECTANDO...</span> : `${config.name} (${config.type === 'button' ? 'B' : 'A'}${config.index})`}
          </span>
       </div>
       <button 
          id={id}
          onClick={onMap}
          className={`px-3 py-1.5 rounded font-bold font-pixel text-[8px] uppercase transition-all hover:scale-105 active:scale-95
            ${isMapping 
              ? 'bg-yellow-400 text-black' 
              : (color === 'cyan' ? 'bg-joy-cyan/10 text-joy-cyan hover:bg-joy-cyan hover:text-black border border-joy-cyan/50' : 'bg-joy-pink/10 text-joy-pink hover:bg-joy-pink hover:text-white border border-joy-pink/50')
            }
          `}
       >
          {isMapping ? '...' : 'SET'}
       </button>
    </div>
  );
};

const ToolButton: React.FC<{ id: string, icon: React.ReactNode, label: string, onClick: () => void, primary?: boolean, isFocused: boolean }> = ({ id, icon, label, onClick, primary, isFocused }) => (
   <button 
      id={id}
      onClick={onClick}
      className={`flex items-center justify-center gap-1 py-2 px-2 rounded font-epic text-xs font-bold uppercase tracking-wider transition-all hover:-translate-y-0.5
         ${isFocused ? 'ring-2 ring-white scale-105 z-10' : ''}
         ${primary 
            ? 'bg-gradient-to-r from-joy-cyan to-blue-500 text-black shadow-lg shadow-joy-cyan/20' 
            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600'
         }
      `}
   >
      {icon} {label}
   </button>
);
