import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function MetricsDashboard({ seed, params, mixing }) {
  const [metrics, setMetrics] = useState({
    entropy: null,
    lyapunov: null,
    avalanche: null,
    statistical: null
  });
  const [loading, setLoading] = useState({});
  const [activeTab, setActiveTab] = useState('entropy');

  const computeEntropy = async () => {
    if (!seed) return;
    
    setLoading({ ...loading, entropy: true });
    try {
      const response = await axios.post('/api/metrics/entropy', {
        seed,
        length: 5000
      });
      setMetrics({ ...metrics, entropy: response.data });
    } catch (error) {
      console.error('Entropy calculation failed:', error);
      setMetrics({ ...metrics, entropy: { error: error.response?.data?.error || 'Failed to compute entropy' } });
    } finally {
      setLoading({ ...loading, entropy: false });
    }
  };

  const computeLyapunov = async () => {
    setLoading({ ...loading, lyapunov: true });
    try {
      const response = await axios.post('/api/metrics/lyapunov', {
        maps: ['logistic', 'henon'],
        params
      });
      setMetrics({ ...metrics, lyapunov: response.data });
    } catch (error) {
      console.error('Lyapunov calculation failed:', error);
      setMetrics({ ...metrics, lyapunov: { error: error.response?.data?.error || 'Failed to compute Lyapunov exponent' } });
    } finally {
      setLoading({ ...loading, lyapunov: false });
    }
  };

  const computeAvalanche = async () => {
    if (!seed) return;

    setLoading({ ...loading, avalanche: true });
    try {
      const response = await axios.post('/api/metrics/avalanche', {
        seed,
        plaintext: 'Test message for avalanche analysis',
        n_trials: 30
      });
      setMetrics({ ...metrics, avalanche: response.data });
    } catch (error) {
      console.error('Avalanche test failed:', error);
      setMetrics({ ...metrics, avalanche: { error: error.response?.data?.error || 'Failed to run avalanche test' } });
    } finally {
      setLoading({ ...loading, avalanche: false });
    }
  };

  const computeStatistical = async () => {
    if (!seed) return;

    setLoading({ ...loading, statistical: true });
    try {
      const response = await axios.post('/api/metrics/statistical', {
        seed,
        length: 10000
      });
      setMetrics({ ...metrics, statistical: response.data });
    } catch (error) {
      console.error('Statistical tests failed:', error);
      setMetrics({ ...metrics, statistical: { error: error.response?.data?.error || 'Failed to run statistical tests' } });
    } finally {
      setLoading({ ...loading, statistical: false });
    }
  };

  // Auto-fetch entropy when seed changes for quicker feedback
  useEffect(() => {
    if (seed) {
      computeEntropy();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  // Auto-fetch lyapunov when params change
  useEffect(() => {
    computeLyapunov();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return (
    <div className="glass-card p-8 card-hover">
      <h2 className="section-title flex items-center gap-3 mb-8">
        <span className="text-4xl animate-bounce-slow">📊</span>
        <span>Metrics Dashboard</span>
        <span className="text-2xl animate-sparkle">✨</span>
      </h2>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        {['entropy', 'lyapunov', 'avalanche', 'statistical'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTab(tab);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className={`px-5 py-3 rounded-2xl font-semibold capitalize transition-all flex items-center gap-2 ${
              activeTab === tab
                ? 'bg-gradient-to-r from-primary to-primary-light text-white scale-105 animate-pulse-soft shadow-colored-hover'
                : 'bg-white border-2 border-border-light text-text-secondary hover:border-primary hover:scale-105'
            }`}
            style={{pointerEvents: 'auto', cursor: 'pointer', zIndex: 100}}
          >
            {activeTab === tab && <span className="animate-sparkle">✨</span>}
            {tab}
          </button>
        ))}
      </div>

      {/* Entropy Tab */}
      {activeTab === 'entropy' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl text-text-primary font-bold flex items-center gap-2">
              <span className="animate-wiggle">🎲</span>
              Shannon Entropy Analysis
            </h3>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                computeEntropy();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              disabled={loading.entropy || !seed}
              className="btn-secondary disabled:opacity-50 flex items-center gap-2"
              style={{pointerEvents: 'auto', cursor: loading.entropy || !seed ? 'not-allowed' : 'pointer', zIndex: 100}}
            >
              {loading.entropy ? (
                <>
                  <span className="animate-spin">🔄</span>
                  <span>Computing...</span>
                </>
              ) : (
                <>
                  <span>▶️</span>
                  <span>Compute Entropy</span>
                </>
              )}
            </button>
          </div>

          {metrics.entropy?.error && (
            <div className="p-4 border-2 border-red-400 rounded-2xl bg-red-50 animate-wiggle">
              <p className="text-red-600 text-sm flex items-center gap-2 font-semibold">
                <span className="text-2xl">❌</span>
                <span>{metrics.entropy.error}</span>
              </p>
            </div>
          )}
          {metrics.entropy && !metrics.entropy.error && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 border-2 border-primary/20 rounded-2xl text-center glass-card hover:scale-105 transition-transform bg-white">
                  <p className="text-text-secondary text-sm mb-2 flex items-center justify-center gap-2">
                    <span>📈</span>
                    <span>Entropy</span>
                  </p>
                  <p className="text-5xl font-bold text-primary animate-pulse-soft">
                    {metrics.entropy.entropy.toFixed(4)}
                  </p>
                  <p className="text-xs text-text-muted mt-2">bits/byte</p>
                </div>
                
                <div className="p-6 border-2 border-accent/20 rounded-2xl text-center glass-card hover:scale-105 transition-transform bg-white">
                  <p className="text-text-secondary text-sm mb-2 flex items-center justify-center gap-2">
                    <span>🎯</span>
                    <span>Target</span>
                  </p>
                  <p className="text-5xl font-bold text-accent">
                    {metrics.entropy.target.toFixed(2)}
                  </p>
                  <p className="text-xs text-text-muted mt-2">Perfect randomness ✨</p>
                </div>

                <div className="p-6 border-2 border-secondary/20 rounded-2xl text-center glass-card hover:scale-105 transition-transform bg-white">
                  <p className="text-text-secondary text-sm mb-2 flex items-center justify-center gap-2">
                    <span>⭐</span>
                    <span>Quality</span>
                  </p>
                  <p className={`text-5xl font-bold animate-bounce-slow ${
                    metrics.entropy.quality === 'Excellent' ? 'text-green-pastel' :
                    metrics.entropy.quality === 'Good' ? 'text-yellow-pastel' : 'text-secondary'
                  }`}>
                    {metrics.entropy.quality === 'Excellent' && '🌟'}
                    {metrics.entropy.quality === 'Good' && '👍'}
                    {metrics.entropy.quality === 'Poor' && '⚠️'}
                  </p>
                  <p className="text-xs text-text-muted mt-2">{metrics.entropy.quality}</p>
                </div>
              </div>

              {metrics.entropy.block_entropies && (
                <div className="mt-8 p-6 bg-white rounded-2xl border-2 border-primary/10">
                  <h4 className="text-text-primary font-semibold mb-4 flex items-center gap-2">
                    <span>📉</span>
                    <span>Block-wise Entropy (first 20 blocks)</span>
                  </h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={metrics.entropy.block_entropies.map((e, i) => ({ block: i + 1, entropy: e }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="block" stroke="#718096" />
                      <YAxis domain={[7.5, 8.0]} stroke="#718096" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#FFFFFF', 
                          border: '2px solid #7DD3C0',
                          borderRadius: '12px',
                          color: '#2D3748'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="entropy" 
                        stroke="#7DD3C0" 
                        strokeWidth={3} 
                        dot={{ fill: '#A8E6CF', r: 5 }} 
                        activeDot={{ r: 7, fill: '#7DD3C0' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Lyapunov Tab */}
      {activeTab === 'lyapunov' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl text-text-primary font-bold flex items-center gap-2">
              <span>📐</span>
              Lyapunov Exponent
            </h3>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                computeLyapunov();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              disabled={loading.lyapunov}
              className="btn-secondary disabled:opacity-50 flex items-center gap-2"
              style={{pointerEvents: 'auto', cursor: loading.lyapunov ? 'not-allowed' : 'pointer', zIndex: 100}}
            >
              {loading.lyapunov ? (
                <>
                  <span className="animate-spin">🔄</span>
                  <span>Computing...</span>
                </>
              ) : (
                <>
                  <span>▶️</span>
                  <span>Compute Lyapunov</span>
                </>
              )}
            </button>
          </div>

          {metrics.lyapunov?.error && (
            <div className="p-4 border-2 border-red-400 rounded-2xl bg-red-50 animate-wiggle">
              <p className="text-red-600 text-sm flex items-center gap-2 font-semibold">
                <span className="text-2xl">❌</span>
                <span>{metrics.lyapunov.error}</span>
              </p>
            </div>
          )}
          {metrics.lyapunov && !metrics.lyapunov.error && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(metrics.lyapunov).map(([mapName, data]) => (
                <div key={mapName} className="p-6 border-2 border-primary/20 rounded-2xl glass-card bg-white">
                  <h4 className="text-primary font-semibold mb-4 capitalize text-lg flex items-center gap-2">
                    <span>🌀</span>
                    {mapName} Map
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl">
                      <span className="text-text-secondary">λ₁:</span>
                      <span className={`font-bold text-lg ${data.chaotic ? 'text-green-pastel' : 'text-secondary'}`}>
                        {data.lambda.toFixed(6)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl">
                      <span className="text-text-secondary">Chaotic:</span>
                      <span className={`font-bold ${data.chaotic ? 'text-green-pastel' : 'text-secondary'}`}>
                        {data.chaotic ? '✅ Yes' : '❌ No'}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-4 p-3 bg-accent/5 rounded-xl">
                      λ₁ &gt; 0 indicates exponential divergence (Butterfly) 🦋
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Avalanche Tab */}
      {activeTab === 'avalanche' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl text-text-primary font-bold flex items-center gap-2">
              <span>🌊</span>
              Avalanche Effect
            </h3>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                computeAvalanche();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              disabled={loading.avalanche || !seed}
              className="btn-secondary disabled:opacity-50 flex items-center gap-2"
              style={{pointerEvents: 'auto', cursor: loading.avalanche || !seed ? 'not-allowed' : 'pointer', zIndex: 100}}
            >
              {loading.avalanche ? (
                <>
                  <span className="animate-spin">🔄</span>
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <span>▶️</span>
                  <span>Run Avalanche Test</span>
                </>
              )}
            </button>
          </div>

          {metrics.avalanche?.error && (
            <div className="p-4 border-2 border-red-400 rounded-2xl bg-red-50 animate-wiggle">
              <p className="text-red-600 text-sm flex items-center gap-2 font-semibold">
                <span className="text-2xl">❌</span>
                <span>{metrics.avalanche.error}</span>
              </p>
            </div>
          )}
          {metrics.avalanche && !metrics.avalanche.error && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border-2 border-primary/20 rounded-2xl text-center glass-card bg-white hover:scale-105 transition-transform">
                  <p className="text-text-secondary text-sm mb-2 flex items-center justify-center gap-2">
                    <span>📊</span>
                    <span>Mean Flip %</span>
                  </p>
                  <p className="text-5xl font-bold text-primary animate-pulse-soft">
                    {metrics.avalanche.mean_flip_percentage.toFixed(2)}%
                  </p>
                  <p className="text-xs text-text-muted mt-2">
                    ± {metrics.avalanche.std_flip_percentage.toFixed(2)}%
                  </p>
                </div>

                <div className="p-6 border-2 border-accent/20 rounded-2xl text-center glass-card bg-white hover:scale-105 transition-transform">
                  <p className="text-text-secondary text-sm mb-2 flex items-center justify-center gap-2">
                    <span>⭐</span>
                    <span>Quality</span>
                  </p>
                  <p className={`text-5xl font-bold animate-bounce-slow ${
                    metrics.avalanche.quality === 'Excellent' ? 'text-green-pastel' :
                    metrics.avalanche.quality === 'Good' ? 'text-yellow-pastel' : 'text-secondary'
                  }`}>
                    {metrics.avalanche.quality === 'Excellent' && '🌟'}
                    {metrics.avalanche.quality === 'Good' && '👍'}
                    {metrics.avalanche.quality === 'Poor' && '⚠️'}
                  </p>
                  <p className="text-xs text-text-muted mt-2">Target: ~50%</p>
                </div>
              </div>

              <div className="p-6 border-2 border-border-light rounded-2xl bg-white glass-card">
                <h4 className="text-text-primary font-semibold mb-4 flex items-center gap-2">
                  <span>📋</span>
                  <span>Test Details</span>
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl">
                    <span className="text-text-secondary">Min flips:</span>
                    <span className="text-primary font-bold">{metrics.avalanche.min_flip}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-accent/5 rounded-xl">
                    <span className="text-text-secondary">Max flips:</span>
                    <span className="text-accent font-bold">{metrics.avalanche.max_flip}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-secondary/5 rounded-xl col-span-2">
                    <span className="text-text-secondary">Total bits:</span>
                    <span className="text-secondary font-bold">{metrics.avalanche.total_bits}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Statistical Tests Tab */}
      {activeTab === 'statistical' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl text-text-primary font-bold flex items-center gap-2">
              <span>🧪</span>
              Statistical Test Suite
            </h3>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                computeStatistical();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              disabled={loading.statistical || !seed}
              className="btn-secondary disabled:opacity-50 flex items-center gap-2"
              style={{pointerEvents: 'auto', cursor: loading.statistical || !seed ? 'not-allowed' : 'pointer', zIndex: 100}}
            >
              {loading.statistical ? (
                <>
                  <span className="animate-spin">🔄</span>
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <span>▶️</span>
                  <span>Run Tests</span>
                </>
              )}
            </button>
          </div>

          {metrics.statistical?.error && (
            <div className="p-4 border-2 border-red-400 rounded-2xl bg-red-50 animate-wiggle">
              <p className="text-red-600 text-sm flex items-center gap-2 font-semibold">
                <span className="text-2xl">❌</span>
                <span>{metrics.statistical.error}</span>
              </p>
            </div>
          )}
          {metrics.statistical && !metrics.statistical.error && (
            <div className="space-y-6">
              {metrics.statistical.summary && (
                <div className="p-6 border-2 border-primary/20 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 glass-card">
                  <h4 className="text-text-primary font-semibold mb-4 flex items-center gap-2">
                    <span>📊</span>
                    <span>Summary</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div className="p-4 bg-white rounded-xl">
                      <p className="text-4xl font-bold text-green-pastel">{metrics.statistical.summary.passed}</p>
                      <p className="text-sm text-text-secondary mt-2">Passed ✅</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl">
                      <p className="text-4xl font-bold text-secondary">{metrics.statistical.summary.failed}</p>
                      <p className="text-sm text-text-secondary mt-2">Failed ❌</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl">
                      <p className="text-4xl font-bold text-primary">{metrics.statistical.summary.pass_rate.toFixed(1)}%</p>
                      <p className="text-sm text-text-secondary mt-2">Pass Rate 📈</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {Object.entries(metrics.statistical)
                  .filter(([key]) => key !== 'summary')
                  .map(([testName, result]) => (
                    <div key={testName} className="p-4 border-2 border-border-light rounded-xl glass-card bg-white hover:scale-102 transition-transform">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-text-primary flex items-center gap-2">
                          <span>{result.passed ? '✅' : '❌'}</span>
                          <span>{result.test_name}</span>
                        </span>
                        <span className={`font-bold px-3 py-1 rounded-lg ${
                          result.passed 
                            ? 'bg-green-pastel/20 text-green-pastel' 
                            : 'bg-secondary/20 text-secondary'
                        }`}>
                          {result.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-2">{result.description}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MetricsDashboard;
