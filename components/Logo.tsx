import React from 'react';

export const Logo: React.FC = () => {
  return (
    <div className="relative group cursor-default select-none transition-transform hover:scale-105 duration-500 ease-out">
      {/* Shadow Layer (Pink) */}
      <h1 className="font-logo text-[8rem] md:text-[10rem] lg:text-[12rem] leading-none text-joy-pink absolute top-2 left-2 blur-sm opacity-80 select-none">
        JoyBit
      </h1>
      
      {/* Outline/Stroke Layer (Dark Stroke simulation) */}
      <h1 
        className="font-logo text-[8rem] md:text-[10rem] lg:text-[12rem] leading-none text-joy-black absolute top-1 left-1 select-none"
        style={{ 
          textShadow: '-2px -2px 0 #f472b6, 2px -2px 0 #f472b6, -2px 2px 0 #f472b6, 2px 2px 0 #f472b6' 
        }}
      >
        JoyBit
      </h1>

      {/* Main Text Layer (Cyan) */}
      <h1 className="font-logo text-[8rem] md:text-[10rem] lg:text-[12rem] leading-none text-joy-cyan relative z-10 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] bg-clip-text text-transparent bg-gradient-to-b from-cyan-200 to-joy-cyan">
        JoyBit
      </h1>
      
      {/* Shine effect */}
      <div className="absolute top-4 right-12 w-8 h-8 bg-white rounded-full blur-xl opacity-60 animate-pulse z-20"></div>
    </div>
  );
};