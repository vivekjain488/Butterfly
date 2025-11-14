import React from 'react';

function Header() {
  return (
    <header className="border-b border-border-light backdrop-blur-sm playful-header sticky top-0 z-50 bg-white/80 pointer-events-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src="/butterfly.png" 
                alt="butterfly" 
                className="w-16 h-16 animate-bounce-slow cursor-pointer transition-transform hover:scale-110 filter drop-shadow-lg" 
                onMouseEnter={(e) => e.target.classList.add('animate-wiggle')}
                onMouseLeave={(e) => e.target.classList.remove('animate-wiggle')}
              />
              <span className="absolute -top-1 -right-1 text-2xl animate-sparkle">✨</span>
            </div>
            <div>
              <h1 className="font-heading text-4xl md:text-6xl text-text-primary inline-flex items-center gap-3">
                <span className="font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  Butterfly
                </span>
                <span className="text-3xl md:text-5xl animate-float-gentle">🦋</span>
              </h1>
              <p className="text-text-secondary text-sm md:text-base mt-1 font-body">
                Playful crypto for curious minds — chaotic, deterministic, delightful! 🎉
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <div className="text-right glass-card p-4 rounded-2xl border-2 border-primary/20">
              <p className="text-xs text-text-muted">Made with 💚 by</p>
              <p className="text-sm text-primary font-bold">Aditi · Vivek ✨</p>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div className="mt-4 p-5 glass-card playful-tagline animate-pulse-soft">
          <p className="text-center text-text-primary text-sm md:text-base italic flex items-center justify-center gap-3 font-decorative">
            <span className="animate-sparkle text-2xl">✨</span>
            <span className="font-medium">"Tickle the Butterfly — watch chaos sing secrets!"</span>
            <span className="animate-sparkle text-2xl">✨</span>
          </p>
        </div>
      </div>
    </header>
  );
}

export default Header;
