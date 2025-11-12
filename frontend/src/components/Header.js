import React from 'react';

function Header() {
  return (
    <header className="border-b border-teal-dark/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-4xl md:text-6xl text-teal-neon neon-text animate-pulse-slow">
              🦋 CHAOS CRYPTO
            </h1>
            <p className="text-teal-dark text-sm md:text-base mt-2 font-body">
              Encrypt with chaos, decrypt with order.
            </p>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-right">
              <p className="text-xs text-teal-dark">Authors</p>
              <p className="text-sm text-teal-neon">Aditi Singh · Vivek Jain</p>
            </div>
          </div>
        </div>
        
        {/* Tagline */}
        <div className="mt-4 p-4 glass-card">
          <p className="text-center text-teal-neon/80 text-sm md:text-base italic">
            "Traditional cryptosystems rely on number theory. We rely on <span className="font-bold text-teal-neon">deterministic chaos</span>."
          </p>
        </div>
      </div>
    </header>
  );
}

export default Header;
