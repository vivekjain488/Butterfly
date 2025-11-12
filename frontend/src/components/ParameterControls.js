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
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <label className="text-sm text-teal-neon">{label}</label>
        <span className="text-sm text-teal-dark font-mono">{value.toFixed(4)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-cyber-dark rounded-lg appearance-none cursor-pointer slider"
      />
      {description && (
        <p className="text-xs text-teal-dark/60 mt-1">{description}</p>
      )}
    </div>
  );

  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-heading text-teal-neon neon-text">
          ⚙️ Parameter Controls
        </h2>
        <div className="flex gap-2">
          <button
            onClick={resetToDefaults}
            className="btn-secondary text-sm"
          >
            Reset to Safe Defaults
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn-secondary text-sm"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Logistic Map */}
          <div className="p-4 border border-teal-dark/30 rounded-lg">
            <h3 className="text-teal-neon font-bold mb-3">Logistic Map</h3>
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
          <div className="p-4 border border-teal-dark/30 rounded-lg">
            <h3 className="text-teal-neon font-bold mb-3">Henon Map</h3>
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
          <div className="p-4 border border-teal-dark/30 rounded-lg md:col-span-2">
            <h3 className="text-teal-neon font-bold mb-3">Lorenz System</h3>
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
          <div className="p-4 border border-teal-dark/30 rounded-lg">
            <h3 className="text-teal-neon font-bold mb-3">Sine Map</h3>
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
          <div className="p-4 border border-teal-dark/30 rounded-lg">
            <h3 className="text-teal-neon font-bold mb-3">Mixing Coefficients</h3>
            <p className="text-xs text-teal-dark mb-3">
              α + β + γ + δ should = 1.0 (auto-normalized)
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
        <div className="text-center text-teal-dark text-sm mt-2">
          Click "Expand" to adjust chaotic map parameters
        </div>
      )}
    </div>
  );
}

export default ParameterControls;
