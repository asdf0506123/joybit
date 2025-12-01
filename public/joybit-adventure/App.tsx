import React, { useState, useEffect, useRef } from 'react';
import GameCanvas from './components/GameCanvas';
import { COLORS } from './constants';

const App: React.FC = () => {
  const [hasGamepad, setHasGamepad] = useState(false);

  useEffect(() => {
    const handleGamepadConnected = () => {
      console.log("Gamepad connected");
      setHasGamepad(true);
    };

    const handleGamepadDisconnected = () => {
      console.log("Gamepad disconnected");
      setHasGamepad(false);
    };

    window.addEventListener("gamepadconnected", handleGamepadConnected);
    window.addEventListener("gamepaddisconnected", handleGamepadDisconnected);

    return () => {
      window.removeEventListener("gamepadconnected", handleGamepadConnected);
      window.removeEventListener("gamepaddisconnected", handleGamepadDisconnected);
    };
  }, []);

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden"
         style={{ backgroundColor: '#111' }}>
      
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
           style={{
             backgroundImage: `linear-gradient(${COLORS.secondary} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.secondary} 1px, transparent 1px)`,
             backgroundSize: '40px 40px'
           }}>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none" />

      {/* Header / Logo */}
      <div className="absolute top-8 z-10 text-center animate-pulse">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter"
            style={{ 
              color: COLORS.primary,
              textShadow: `4px 4px 0px ${COLORS.secondary}, 0 0 20px ${COLORS.primary}`
            }}>
          JoyBit
        </h1>
        <div className="flex items-center justify-center gap-2 mt-2">
           {hasGamepad ? (
             <span className="text-green-400 text-xs uppercase tracking-widest flex items-center gap-2">
               <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
               Mando Conectado
             </span>
           ) : (
             <span className="text-gray-500 text-xs uppercase tracking-widest">Esperando Mando...</span>
           )}
        </div>
      </div>

      {/* Game Container */}
      <div className="relative z-20 shadow-2xl rounded-lg overflow-hidden border-4"
           style={{ borderColor: COLORS.secondary, boxShadow: `0 0 30px ${COLORS.secondary}40` }}>
        <GameCanvas />
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center text-xs md:text-sm text-gray-400 font-sans z-20 max-w-lg">
        <p className="mb-2 uppercase tracking-widest text-white font-bold">Controles</p>
        <div className="grid grid-cols-2 gap-8">
           <div className="text-right">
             <span style={{color: COLORS.primary}}>TECLADO</span><br/>
             Flechas / WASD: Mover<br/>
             Espacio: Saltar
           </div>
           <div className="text-left">
             <span style={{color: COLORS.secondary}}>GAMEPAD (BLE/USB)</span><br/>
             D-Pad / Stick: Mover<br/>
             Botón A / Cruz: Saltar
           </div>
        </div>
      </div>
    </div>
  );
};

export default App;