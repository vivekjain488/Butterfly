import React from 'react';

function Footer() {
  return (
    <footer className="border-t border-teal-dark/30 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-teal-neon font-bold mb-3">About</h3>
            <p className="text-teal-dark text-sm">
              Research-grade cryptosystem based on deterministic chaos. 
              Uses hybrid chaotic maps for key derivation and encryption.
            </p>
          </div>

          {/* Security Notice */}
          <div>
            <h3 className="text-teal-neon font-bold mb-3">⚠️ Security Notice</h3>
            <p className="text-yellow-500 text-sm">
              <strong>Experimental Research Prototype.</strong><br/>
              NOT for production use without cryptographic peer review.
              Always combine with vetted primitives (AES-GCM) for real applications.
            </p>
          </div>

          {/* Tech Stack */}
          <div>
            <h3 className="text-teal-neon font-bold mb-3">Tech Stack</h3>
            <ul className="text-teal-dark text-sm space-y-1">
              <li>• Python + Numba (Backend)</li>
              <li>• React + TailwindCSS (Frontend)</li>
              <li>• Three.js (Attractor Viz)</li>
              <li>• NIST-inspired Statistical Tests</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-teal-dark/20 text-center text-teal-dark text-sm">
          <p>© 2025 Chaos Cryptography · MIT License · 
            <a href="https://github.com/vivekjain488/Butterfly" 
               className="text-teal-neon hover:underline ml-1"
               target="_blank" 
               rel="noopener noreferrer">
              GitHub
            </a>
          </p>
          <p className="mt-2 text-xs">⚡ Powered by deterministic chaos and mathematical beauty</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
