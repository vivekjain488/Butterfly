import React from 'react';

function Footer() {
  return (
    <footer className="border-t border-border-light mt-12 playful-footer bg-white/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-primary font-bold mb-3 text-lg">About</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              A playful research prototype exploring chaotic entropy as a fun cryptography toy. 🌈
            </p>
          </div>

          {/* Friendly Note */}
          <div>
            <h3 className="text-primary font-bold mb-3 text-lg">Friendly Note</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              This project is a research prototype — have fun, but be careful with real secrets! 🎈
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              Share a smile 🥳 · Try toggling parameters to make the Butterfly dance.
            </p>
          </div>

          {/* Tech Stack */}
          <div>
            <h3 className="text-primary font-bold mb-3 text-lg">Tech Stack</h3>
            <ul className="text-text-secondary text-sm space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                <span>Python + Numba</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                <span>React + Tailwind</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                <span>Three.js</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border-light text-center text-text-secondary text-sm">
          <p className="flex items-center justify-center gap-2">
            <span>© 2025 Butterfly</span>
            <span className="text-primary">·</span>
            <span>MIT License</span>
            <span className="text-primary">·</span>
            <a 
              href="https://github.com/vivekjain488/Butterfly" 
              className="text-primary hover:text-primary-dark underline transition-colors flex items-center gap-1" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <span>GitHub</span>
              <span>🔗</span>
            </a>
          </p>
          <p className="mt-3 text-xs flex items-center justify-center gap-2">
            <span className="animate-sparkle text-primary">✨</span>
            <span>Made with curiosity and chaotic love</span>
            <span className="text-pink-pastel animate-pulse">❤️</span>
            <span className="animate-sparkle text-primary">✨</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
