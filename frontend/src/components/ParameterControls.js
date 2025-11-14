import React, { useState } from 'react';

function ParameterControls({ params, setParams, mixing, setMixing }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const resetToDefaults = () => {
    setParams({
      logistic_r: 3.99,
      henon_a: 1.4,
      henon_b: 0.3,
      lorenz_sigma: 10.0,
      lorenz_rho: 28.0,
      lorenz_beta: 8.0/3.0,
      sine_mu: 0.99
    });
    setMixing([0.25, 0.25, 0.25, 0.25]);
  };

  const SliderControl = ({ label, value, onChange, min, max, step, description }) => (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm text-text-primary font-semibold">{label}</label>
        <span className="text-sm text-primary font-mono font-bold bg-primary/10 px-3 py-1 rounded-lg">{value.toFixed(4)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-border-light rounded-lg appearance-none cursor-pointer slider"
      />
      {description && (
        <p className="text-xs text-text-muted mt-2">{description}</p>
      )}
    </div>
  );

  return (
    <div className="glass-card p-8 card-hover">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-heading text-text-primary flex items-center gap-3 section-title">
          <span className="text-3xl animate-wiggle">⚙️</span>
          <span>Parameter Controls</span>
          <span className="text-xl animate-sparkle">✨</span>
        </h2>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              resetToDefaults();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="btn-secondary text-sm flex items-center gap-2"
            title="Reset all parameters to safe defaults"
            style={{pointerEvents: 'auto', cursor: 'pointer', zIndex: 100}}
          >
            <span>🔄</span>
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="btn-secondary text-sm flex items-center gap-2"
            style={{pointerEvents: 'auto', cursor: 'pointer', zIndex: 100}}
          >
            {isExpanded ? (
              <>
                <span>📥</span>
                <span>Collapse</span>
              </>
            ) : (
              <>
                <span>📤</span>
                <span>Expand</span>
              </>
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Logistic Map */}
          <div className="p-5 border-2 border-primary/20 rounded-2xl bg-white glass-card">
            <h3 className="text-primary font-bold mb-4 text-lg flex items-center gap-2">
              <span>📈</span>
              <span>Logistic Map</span>
            </h3>
            <SliderControl
              label="r (control parameter)"
              value={params.logistic_r}
              onChange={(val) => setParams({...params, logistic_r: val})}
              min={3.57}
              max={4.0}
              step={0.001}
              description="Chaotic regime: [3.57, 4.0]"
            />
          </div>

          {/* Henon Map */}
          <div className="p-5 border-2 border-accent/20 rounded-2xl bg-white glass-card">
            <h3 className="text-accent font-bold mb-4 text-lg flex items-center gap-2">
              <span>🌀</span>
              <span>Henon Map</span>
            </h3>
            <SliderControl
              label="a (nonlinearity)"
              value={params.henon_a}
              onChange={(val) => setParams({...params, henon_a: val})}
              min={1.0}
              max={1.8}
              step={0.01}
            />
            <SliderControl
              label="b (dissipation)"
              value={params.henon_b}
              onChange={(val) => setParams({...params, henon_b: val})}
              min={0.1}
              max={0.5}
              step={0.01}
            />
          </div>

          {/* Lorenz System */}
          <div className="p-5 border-2 border-secondary/20 rounded-2xl bg-white glass-card md:col-span-2">
            <h3 className="text-secondary font-bold mb-4 text-lg flex items-center gap-2">
              <span>🌊</span>
              <span>Lorenz System</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SliderControl
                label="σ (sigma)"
                value={params.lorenz_sigma}
                onChange={(val) => setParams({...params, lorenz_sigma: val})}
                min={5}
                max={15}
                step={0.1}
              />
              <SliderControl
                label="ρ (rho)"
                value={params.lorenz_rho}
                onChange={(val) => setParams({...params, lorenz_rho: val})}
                min={20}
                max={35}
                step={0.5}
              />
              <SliderControl
                label="β (beta)"
                value={params.lorenz_beta}
                onChange={(val) => setParams({...params, lorenz_beta: val})}
                min={1}
                max={4}
                step={0.1}
              />
            </div>
          </div>

          {/* Sine Map */}
          <div className="p-5 border-2 border-yellow-pastel/30 rounded-2xl bg-white glass-card">
            <h3 className="text-yellow-pastel font-bold mb-4 text-lg flex items-center gap-2" style={{color: '#FFA07A'}}>
              <span>🌙</span>
              <span>Sine Map</span>
            </h3>
            <SliderControl
              label="μ (mu)"
              value={params.sine_mu}
              onChange={(val) => setParams({...params, sine_mu: val})}
              min={0.8}
              max={1.0}
              step={0.001}
              description="Chaotic near 1.0"
            />
          </div>

          {/* Mixing Coefficients */}
          <div className="p-5 border-2 border-purple-pastel/30 rounded-2xl bg-white glass-card">
            <h3 className="text-purple-pastel font-bold mb-4 text-lg flex items-center gap-2">
              <span>🎨</span>
              <span>Mixing Coefficients</span>
            </h3>
            <p className="text-xs text-text-muted mb-4 p-3 bg-purple-pastel/5 rounded-xl">
              α + β + γ + δ should = 1.0 (auto-normalized) ⚖️
            </p>
            <SliderControl
              label="α (Logistic weight)"
              value={mixing[0]}
              onChange={(val) => {
                const newMixing = [...mixing];
                newMixing[0] = val;
                setMixing(newMixing);
              }}
              min={0}
              max={1}
              step={0.01}
            />
            <SliderControl
              label="β (Henon weight)"
              value={mixing[1]}
              onChange={(val) => {
                const newMixing = [...mixing];
                newMixing[1] = val;
                setMixing(newMixing);
              }}
              min={0}
              max={1}
              step={0.01}
            />
            <SliderControl
              label="γ (Lorenz weight)"
              value={mixing[2]}
              onChange={(val) => {
                const newMixing = [...mixing];
                newMixing[2] = val;
                setMixing(newMixing);
              }}
              min={0}
              max={1}
              step={0.01}
            />
            <SliderControl
              label="δ (Sine weight)"
              value={mixing[3]}
              onChange={(val) => {
                const newMixing = [...mixing];
                newMixing[3] = val;
                setMixing(newMixing);
              }}
              min={0}
              max={1}
              step={0.01}
            />
          </div>
        </div>
      )}

      {!isExpanded && (
        <div className="text-center text-text-secondary text-sm mt-6 p-6 glass-card rounded-2xl bg-white border-2 border-primary/10">
          <p className="flex items-center justify-center gap-3">
            <span className="text-3xl animate-bounce-slow">🎛️</span>
            <span className="text-base font-medium">Click "Expand" to adjust chaotic map parameters and watch the magic! ✨</span>
          </p>
        </div>
      )}
    </div>
  );
}

export default ParameterControls;
