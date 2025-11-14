import React, { useState } from 'react';
import Header from './components/Header';
import EncryptionPanel from './components/EncryptionPanel';
import AttractorVisualization from './components/AttractorVisualization';
import MetricsDashboard from './components/MetricsDashboard';
import ParameterControls from './components/ParameterControls';
import Footer from './components/Footer';

function App() {
  const [seed, setSeed] = useState('');
  const [params, setParams] = useState({
    logistic_r: 3.99,
    henon_a: 1.4,
    henon_b: 0.3,
    lorenz_sigma: 10.0,
    lorenz_rho: 28.0,
    lorenz_beta: 8.0/3.0,
    sine_mu: 0.99
  });
  const [mixing, setMixing] = useState([0.25, 0.25, 0.25, 0.25]);
  const [isEncrypting, setIsEncrypting] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background attractor - always visible */}
      <div className="fixed inset-0 z-0 opacity-20">
        <AttractorVisualization 
          params={params} 
          mixing={mixing}
          isAnimating={isEncrypting}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Parameter Controls */}
          <ParameterControls 
            params={params}
            setParams={setParams}
            mixing={mixing}
            setMixing={setMixing}
          />

          {/* Encryption Panel */}
          <EncryptionPanel 
            seed={seed}
            setSeed={setSeed}
            params={params}
            mixing={mixing}
            setIsEncrypting={setIsEncrypting}
          />

          {/* Metrics Dashboard */}
          <MetricsDashboard 
            seed={seed}
            params={params}
            mixing={mixing}
          />

          {/* Large Attractor Visualization */}
          <div className="glass-card p-6">
            <h2 className="section-title flex items-center gap-3">
              <span className="text-4xl animate-bounce-slow">🌀</span>
              <span>Lorenz Attractor Visualization</span>
              <span className="text-2xl animate-sparkle">✨</span>
            </h2>
            <p className="text-teal-dark text-sm mb-4 flex items-center gap-2">
              <span>👆</span>
              <span>Watch the beautiful chaos unfold in real-time! Adjust parameters to see the magic happen! 🎨</span>
            </p>
            <div className="h-96 rounded-xl overflow-hidden border-2 border-teal-dark/30">
              <AttractorVisualization 
                params={params} 
                mixing={mixing}
                isAnimating={isEncrypting}
                showControls={true}
              />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
