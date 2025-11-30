import React from 'react';
import { Gamepad2, Zap, Trophy, Heart } from 'lucide-react';

export const ControllerDecoration: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex gap-8 opacity-60 ${className}`}>
     <Gamepad2 className="w-12 h-12 text-joy-pink animate-bounce" style={{ animationDuration: '3s' }} />
     <Gamepad2 className="w-12 h-12 text-joy-cyan animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.2s' }} />
     <Gamepad2 className="w-12 h-12 text-joy-pink animate-bounce" style={{ animationDelay: '1s', animationDuration: '2.8s' }} />
     <Gamepad2 className="w-12 h-12 text-joy-cyan animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '3.5s' }} />
  </div>
);

export const SideDecorations: React.FC = () => {
  return (
    <>
      {/* Left Arrows */}
      <div className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2">
        <div className="w-12 h-12 border-4 border-joy-cyan/30 rotate-45 animate-pulse"></div>
        <div className="w-8 h-8 border-4 border-joy-pink/30 rotate-45 ml-4"></div>
      </div>

      {/* Right Arrows */}
      <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2 items-end">
        <div className="w-12 h-12 border-4 border-joy-pink/30 rotate-45 animate-pulse"></div>
        <div className="w-8 h-8 border-4 border-joy-cyan/30 rotate-45 mr-4"></div>
      </div>
    </>
  );
};

export const FloatingIcons: React.FC = () => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden w-full h-full">
            <Zap className="absolute top-[15%] left-[10%] text-yellow-400 w-8 h-8 opacity-40 animate-spin-slow" />
            <Trophy className="absolute bottom-[20%] left-[15%] text-joy-cyan w-10 h-10 opacity-30 animate-bounce" />
            <Heart className="absolute top-[20%] right-[15%] text-joy-pink w-6 h-6 opacity-40 animate-pulse" />
        </div>
    )
}