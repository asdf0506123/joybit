
import React, { useState, useEffect } from 'react';
import { Play, Settings } from 'lucide-react';
import { GridBackground, FloatingParticles } from './components/BackgroundElements';
import { Logo } from './components/Logo';
import { ControllerDecoration, SideDecorations, FloatingIcons } from './components/Decorations';
import { GameSelection } from './components/GameSelection';
import { SettingsMenu } from './components/SettingsMenu';
import { AppView } from './types';
import { useGamepadNav } from './hooks/useGamepadNav';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [showContent, setShowContent] = useState(false);

  // Define focusable IDs for Home Screen
  const homeFocusIds = ['btn-start', 'btn-config'];
  // Enable navigation only when in HOME view
  const focusedIndex = useGamepadNav(homeFocusIds, currentView === AppView.HOME);

  // Initial animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleStartClick = () => {
    setCurrentView(AppView.GAME_SELECTION);
  };

  const handleConfigClick = () => {
    setCurrentView(AppView.SETTINGS);
  };

  const handleBack = () => {
    setCurrentView(AppView.HOME);
  };

  return (
    <main className="relative w-screen h-screen bg-joy-black overflow-hidden flex flex-col items-center justify-center selection:bg-joy-pink selection:text-white">
      {/* Background Layers - Persistent across views */}
      <GridBackground />
      <FloatingParticles />
      <FloatingIcons />
      <SideDecorations />

      {/* View Content */}
      {currentView === AppView.HOME && (
        <div 
          className={`relative z-10 flex flex-col items-center justify-center text-center transition-all duration-1000 transform ${
            showContent ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'
          }`}
        >
          {/* Top Tagline */}
          <div className="mb-2 md:mb-6 overflow-hidden">
            <h2 className="font-epic font-bold text-xl md:text-3xl lg:text-4xl tracking-[0.2em] text-white uppercase drop-shadow-md animate-float">
              <span className="text-joy-cyan">Sumérgete</span> en la <span className="text-joy-pink">Aventura</span>
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mt-2 opacity-50"></div>
          </div>

          {/* The Big Brand Logo */}
          <div className="py-8 md:py-12 transform hover:scale-105 transition-transform duration-300">
            <Logo />
          </div>

          {/* Pixel Art Icons Strip (Controllers) */}
          <div className="mb-12">
             <ControllerDecoration />
          </div>

          {/* Slogan */}
          <p className="font-epic text-slate-300 text-lg md:text-2xl tracking-wider mb-12 max-w-lg mx-auto px-4 drop-shadow-sm">
            Explora, descubre y deja que el mundo te sorprenda
          </p>

          {/* CTA Buttons Container */}
          <div className="flex flex-col md:flex-row gap-6 items-center justify-center w-full px-4">
            {/* Start Button */}
            <button
              id="btn-start"
              onClick={handleStartClick}
              className={`
                group relative px-10 py-4 border-2 rounded-full
                font-epic text-xl md:text-2xl font-bold uppercase tracking-widest
                overflow-hidden transition-all duration-300
                w-full md:w-auto
                ${focusedIndex === 0 ? 'border-joy-pink shadow-[0_0_30px_rgba(244,114,182,0.8)] scale-110 bg-joy-pink/10' : 'border-joy-cyan/50 text-white hover:border-joy-pink hover:shadow-[0_0_30px_rgba(244,114,182,0.6)] bg-transparent'}
              `}
            >
              {/* Button Background Gradient on Hover */}
              <div className={`absolute inset-0 w-full h-full bg-gradient-to-r from-joy-cyan/20 to-joy-pink/20 transition-opacity duration-300 ${focusedIndex === 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>
              
              <span className={`relative z-10 flex items-center justify-center gap-3 transition-colors ${focusedIndex === 0 ? 'text-joy-cyan' : 'group-hover:text-joy-cyan'}`}>
                 <Play className="w-6 h-6 fill-current" />
                 Click para empezar
              </span>
            </button>

            {/* Config Button */}
            <button
              id="btn-config"
              onClick={handleConfigClick}
              className={`
                group relative px-8 py-4 border-2 rounded-full
                font-epic text-lg md:text-xl font-bold uppercase tracking-widest
                overflow-hidden transition-all duration-300
                w-full md:w-auto
                ${focusedIndex === 1 ? 'border-joy-cyan text-white shadow-[0_0_20px_rgba(34,211,238,0.8)] scale-110 bg-white/10' : 'border-slate-600/50 text-slate-300 hover:border-joy-cyan hover:text-white hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] bg-transparent'}
              `}
            >
               <div className={`absolute inset-0 w-full h-full bg-white/5 transition-opacity duration-300 ${focusedIndex === 1 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>
               <span className="relative z-10 flex items-center justify-center gap-2">
                 <Settings className="w-5 h-5" />
                 Configura tu mando
               </span>
            </button>
          </div>

          {/* Footer/Version */}
          <div className="absolute bottom-[-15vh] md:bottom-[-20vh] opacity-30 font-pixel text-xs text-white">
            v1.0.4 - JOYBIT SYSTEMS
          </div>

        </div>
      )}

      {currentView === AppView.GAME_SELECTION && (
        <GameSelection onBack={handleBack} />
      )}

      {currentView === AppView.SETTINGS && (
        <SettingsMenu onBack={handleBack} />
      )}
      
      {/* Decorative Border Overlay */}
      <div className="absolute inset-0 border-[16px] border-slate-900/50 pointer-events-none z-20"></div>
      <div className="absolute inset-0 border-t-2 border-b-2 border-joy-cyan/10 pointer-events-none z-20"></div>
    </main>
  );
};

export default App;
