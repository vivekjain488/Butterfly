import React from 'react';

function Header() {
  return (
    <header className="border-b border-teal-dark/30 backdrop-blur-sm playful-header sticky top-0 z-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src="/butterfly.png" 
                alt="butterfly" 
                className="w-16 h-16 animate-bounce-slow cursor-pointer transition-transform hover:scale-110" 
                onMouseEnter={(e) => e.target.classList.add('animate-wiggle')}
                onMouseLeave={(e) => e.target.classList.remove('animate-wiggle')}
              />
              <span className="absolute -top-1 -right-1 text-2xl animate-sparkle">✨</span>
            </div>
            <div>
              <h1 className="font-heading text-4xl md:text-6xl text-teal-neon neon-text inline-flex items-center gap-2">
                <span className="animate-pulse-glow">Butterfly</span>
                <span className="text-3xl md:text-5xl animate-rainbow">🦋</span>
              </h1>
              <p className="text-teal-dark text-sm md:text-base mt-1 font-body">
                Playful crypto for curious minds — chaotic, deterministic, delightful! 🎉
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <div className="text-right glass-card p-3 rounded-xl">
              <p className="text-xs text-teal-dark">Made with 💚 by</p>
              <p className="text-sm text-teal-neon font-bold">Aditi · Vivek ✨</p>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div className="mt-4 p-4 glass-card playful-tagline animate-pulse-glow">
          <p className="text-center text-teal-neon/90 text-sm md:text-base italic flex items-center justify-center gap-2">
            <span className="animate-sparkle">✨</span>
            "Tickle the Butterfly — watch chaos sing secrets!" 
            <span className="animate-sparkle">✨</span>
          </p>
        </div>
      </div>
    </header>
  );
}

export default Header;
