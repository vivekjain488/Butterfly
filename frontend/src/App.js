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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary">
      {/* Background attractor - subtle for light theme, pointer events disabled */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none" style={{pointerEvents: 'none', zIndex: 0}}>
        <AttractorVisualization 
          params={params} 
          mixing={mixing}
          isAnimating={isEncrypting}
        />
      </div>

      {/* Main content */}
      <div className="relative" style={{zIndex: 100, pointerEvents: 'auto'}}>
        <Header />
        
        <main className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
          {/* Top Row: Parameter Controls - Full Width */}
          <div className="w-full">
            <ParameterControls 
              params={params}
              setParams={setParams}
              mixing={mixing}
              setMixing={setMixing}
            />
          </div>

          {/* Middle Row: Left-Right Layout - Encryption Panel and Metrics Dashboard */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
            {/* Left Column: Encryption Panel */}
            <div className="xl:sticky xl:top-24 xl:self-start xl:h-fit">
              <EncryptionPanel 
                seed={seed}
                setSeed={setSeed}
                params={params}
                mixing={mixing}
                setIsEncrypting={setIsEncrypting}
              />
            </div>

            {/* Right Column: Metrics Dashboard */}
            <div className="w-full">
              <MetricsDashboard 
                seed={seed}
                params={params}
                mixing={mixing}
              />
            </div>
          </div>

          {/* Bottom Row: Full Width - Attractor Visualization */}
          <div className="w-full glass-card p-8 card-hover">
            <h2 className="section-title flex items-center gap-3 mb-6">
              <span className="text-4xl animate-bounce-slow">🌀</span>
              <span>Lorenz Attractor Visualization</span>
              <span className="text-2xl animate-sparkle">✨</span>
            </h2>
            <p className="text-text-secondary text-sm mb-6 flex items-center gap-2">
              <span>👆</span>
              <span>Watch the beautiful chaos unfold in real-time! Adjust parameters to see the magic happen! 🎨</span>
            </p>
            <div className="h-96 rounded-2xl overflow-hidden border-2 border-primary/20 bg-white shadow-soft pointer-events-auto relative z-10">
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
