
import React from 'react';
import { ArrowLeft, Zap, Gamepad2 } from 'lucide-react';
import { useGamepadNav } from '../hooks/useGamepadNav';

interface GameSelectionProps {
  onBack: () => void;
}

export const GameSelection: React.FC<GameSelectionProps> = ({ onBack }) => {
  const focusIds = ['btn-back-select', 'card-game-1', 'card-game-2'];
  const focusedIndex = useGamepadNav(focusIds, true);

  return (
    <div className="relative z-20 flex flex-col items-center justify-center w-full max-w-5xl px-4 animate-in fade-in slide-in-from-bottom-10 duration-500">
      
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-12">
        <button 
          id="btn-back-select"
          onClick={onBack}
          className={`group flex items-center gap-2 font-epic text-xl uppercase tracking-widest transition-all px-4 py-2 rounded-lg
            ${focusedIndex === 0 ? 'text-white bg-joy-cyan/20 ring-2 ring-joy-cyan scale-105' : 'text-joy-cyan hover:text-white'}
          `}
        >
          <ArrowLeft className="w-6 h-6 group-hover:-translate-x-2 transition-transform" />
          Volver
        </button>
        <h2 className="font-logo text-4xl md:text-5xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          Elige tu Juego
        </h2>
        <div className="w-24"></div> {/* Spacer for balance */}
      </div>

      {/* Game Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        
        {/* Game Card 1 */}
        <div 
          id="card-game-1"
          className={`group relative aspect-square cursor-pointer transition-transform duration-300 ${focusedIndex === 1 ? 'scale-105 z-10' : 'hover:scale-105'}`}
          onClick={() => window.open('https://mario-bit.netlify.app/', '_blank')}
        >
          <div className={`absolute inset-0 bg-slate-900/80 backdrop-blur-sm border-4 rounded-3xl transition-all duration-300 
            ${focusedIndex === 1 ? 'border-joy-cyan shadow-[0_0_50px_rgba(34,211,238,0.5)]' : 'border-joy-cyan/30 group-hover:border-joy-cyan group-hover:shadow-[0_0_50px_rgba(34,211,238,0.3)]'}
          `}></div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
            <div className={`w-24 h-24 mb-6 rounded-full flex items-center justify-center border-2 transition-colors
              ${focusedIndex === 1 ? 'bg-joy-cyan/20 border-joy-cyan shadow-[0_0_20px_rgba(34,211,238,0.5)]' : 'bg-joy-cyan/10 border-joy-cyan/50 group-hover:bg-joy-cyan/20'}
            `}>
              <Zap className="w-12 h-12 text-joy-cyan" />
            </div>
            <h3 className={`font-epic text-4xl font-bold mb-2 transition-colors ${focusedIndex === 1 ? 'text-joy-cyan' : 'text-white group-hover:text-joy-cyan'}`}>
              Mario Bit
            </h3>
            <p className="font-pixel text-[10px] md:text-xs text-slate-400 leading-relaxed max-w-[80%]">
            Corre y salta a traves de un solo intento. ¡Mata a todos los enemigos y alcanza la meta!
            </p>
          </div>
          
          {/* Decorative Corner Accents */}
          <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-joy-cyan/50 rounded-tr-xl"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-joy-cyan/50 rounded-bl-xl"></div>
        </div>

        {/* Game Card 2 */}
        <div 
          id="card-game-2"
          className={`group relative aspect-square cursor-pointer transition-transform duration-300 ${focusedIndex === 2 ? 'scale-105 z-10' : 'hover:scale-105'}`}
          onClick={() => window.open('/juego_uno.html', '_blank')}
        >
          <div className={`absolute inset-0 bg-slate-900/80 backdrop-blur-sm border-4 rounded-3xl transition-all duration-300
             ${focusedIndex === 2 ? 'border-joy-pink shadow-[0_0_50px_rgba(244,114,182,0.5)]' : 'border-joy-pink/30 group-hover:border-joy-pink group-hover:shadow-[0_0_50px_rgba(244,114,182,0.3)]'}
          `}></div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
            <div className={`w-24 h-24 mb-6 rounded-full flex items-center justify-center border-2 transition-colors
               ${focusedIndex === 2 ? 'bg-joy-pink/20 border-joy-pink shadow-[0_0_20px_rgba(244,114,182,0.5)]' : 'bg-joy-pink/10 border-joy-pink/50 group-hover:bg-joy-pink/20'}
            `}>
              <Gamepad2 className="w-12 h-12 text-joy-pink" />
            </div>
            <h3 className={`font-epic text-4xl font-bold mb-2 transition-colors ${focusedIndex === 2 ? 'text-joy-pink' : 'text-white group-hover:text-joy-pink'}`}>
              SALTA O MUERE
            </h3>
            <p className="font-pixel text-[10px] md:text-xs text-slate-400 leading-relaxed max-w-[80%]">
              Trata de saltar sobre los obstáculos y sobrevivir el mayor tiempo posible. Obten el mejor puntaje!
            </p>
          </div>

          {/* Decorative Corner Accents */}
          <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-joy-pink/50 rounded-tr-xl"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-joy-pink/50 rounded-bl-xl"></div>
        </div>

      </div>
    </div>
  );
};
