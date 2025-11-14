import React from 'react';

function Footer() {
  return (
    <footer className="border-t border-teal-dark/30 mt-12 playful-footer">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-teal-neon font-bold mb-3">About</h3>
            <p className="text-teal-dark text-sm">
              A playful research prototype exploring chaotic entropy as a fun cryptography toy.
            </p>
          </div>

          {/* Friendly Note */}
          <div>
            <h3 className="text-teal-neon font-bold mb-3">Friendly Note</h3>
            <p className="text-teal-dark text-sm">This project is a research prototype — have fun, but be careful with real secrets!</p>
            <p className="mt-2 text-sm">Share a smile 🥳 · Try toggling parameters to make the Butterfly dance.</p>
          </div>

          {/* Tech Stack */}
          <div>
            <h3 className="text-teal-neon font-bold mb-3">Tech Stack</h3>
            <ul className="text-teal-dark text-sm space-y-1">
              <li>• Python + Numba</li>
              <li>• React + Tailwind</li>
              <li>• Three.js</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-teal-dark/20 text-center text-teal-dark text-sm">
          <p className="flex items-center justify-center gap-2">
            <span>© 2025 Butterfly</span>
            <span className="text-teal-neon">·</span>
            <span>MIT License</span>
            <span className="text-teal-neon">·</span>
            <a href="https://github.com/vivekjain488/Butterfly" className="text-teal-neon hover:underline flex items-center gap-1 transition-all hover:scale-110" target="_blank" rel="noopener noreferrer">
              <span>GitHub</span>
              <span>🔗</span>
            </a>
          </p>
          <p className="mt-3 text-xs flex items-center justify-center gap-2">
            <span className="animate-sparkle">✨</span>
            <span>Made with curiosity and chaotic love</span>
            <span className="text-red-400 animate-pulse">❤️</span>
            <span className="animate-sparkle">✨</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
