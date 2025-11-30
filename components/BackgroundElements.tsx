import React from 'react';

export const GridBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Radial Gradient Center */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/50 via-slate-950 to-black"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      
      {/* Simulated Floor Grid */}
      <div 
        className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-joy-pink/10 to-transparent"
        style={{
          backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(34, 211, 238, .1) 25%, rgba(34, 211, 238, .1) 26%, transparent 27%, transparent 74%, rgba(34, 211, 238, .1) 75%, rgba(34, 211, 238, .1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(34, 211, 238, .1) 25%, rgba(34, 211, 238, .1) 26%, transparent 27%, transparent 74%, rgba(34, 211, 238, .1) 75%, rgba(34, 211, 238, .1) 76%, transparent 77%, transparent)',
          backgroundSize: '60px 60px',
          transform: 'perspective(500px) rotateX(60deg) translateY(100px) scale(1.5)',
          transformOrigin: 'bottom center'
        }}
      ></div>
    </div>
  );
};

export const FloatingParticles: React.FC = () => {
  // Simple purely decorative elements
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-joy-cyan rounded-full animate-float opacity-60 shadow-[0_0_10px_#22d3ee]"></div>
      <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-joy-pink rounded-full animate-float opacity-50 shadow-[0_0_10px_#f472b6]" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-10 w-1 h-1 bg-white rounded-full animate-pulse opacity-80" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 right-20 w-1.5 h-1.5 bg-joy-cyan rounded-full animate-pulse opacity-70" style={{ animationDelay: '0.5s' }}></div>
    </div>
  );
};