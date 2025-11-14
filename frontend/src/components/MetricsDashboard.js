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
    <div className="glass-card p-6">
      <h2 className="section-title">📊 Metrics Dashboard</h2>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['entropy', 'lyapunov', 'avalanche', 'statistical'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-semibold capitalize transition-all ${
              activeTab === tab
                ? 'bg-teal-neon text-cyber-bg'
                : 'bg-transparent border border-teal-dark text-teal-dark hover:border-teal-neon'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Entropy Tab */}
      {activeTab === 'entropy' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl text-teal-neon font-bold">Shannon Entropy Analysis</h3>
            <button
              onClick={computeEntropy}
              disabled={loading.entropy || !seed}
              className="btn-secondary disabled:opacity-50"
            >
              {loading.entropy ? '🔄 Computing...' : '▶️ Compute Entropy'}
            </button>
          </div>

          {metrics.entropy && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-teal-dark/30 rounded-lg text-center">
                  <p className="text-teal-dark text-sm mb-1">Entropy</p>
                  <p className="text-3xl font-bold text-teal-neon">
                    {metrics.entropy.entropy.toFixed(4)}
                  </p>
                  <p className="text-xs text-teal-dark mt-1">bits/byte</p>
                </div>
                
                <div className="p-4 border border-teal-dark/30 rounded-lg text-center">
                  <p className="text-teal-dark text-sm mb-1">Target</p>
                  <p className="text-3xl font-bold text-teal-dark">
                    {metrics.entropy.target.toFixed(2)}
                  </p>
                  <p className="text-xs text-teal-dark mt-1">Perfect randomness</p>
                </div>

                <div className="p-4 border border-teal-dark/30 rounded-lg text-center">
                  <p className="text-teal-dark text-sm mb-1">Quality</p>
                  <p className={`text-3xl font-bold ${
                    metrics.entropy.quality === 'Excellent' ? 'text-green-400' :
                    metrics.entropy.quality === 'Good' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {metrics.entropy.quality}
                  </p>
                  <p className="text-xs text-teal-dark mt-1">Assessment</p>
                </div>
              </div>

              {metrics.entropy.block_entropies && (
                <div className="mt-6">
                  <h4 className="text-teal-neon font-semibold mb-3">Block-wise Entropy (first 20 blocks)</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={metrics.entropy.block_entropies.map((e, i) => ({ block: i + 1, entropy: e }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#00ADB5" opacity={0.2} />
                      <XAxis dataKey="block" stroke="#00FFE1" />
                      <YAxis domain={[7.5, 8.0]} stroke="#00FFE1" />
                      <Tooltip contentStyle={{ backgroundColor: '#000814', border: '1px solid #00ADB5' }} />
                      <Line type="monotone" dataKey="entropy" stroke="#00FFE1" strokeWidth={2} dot={{ fill: '#00FFE1' }} />
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl text-teal-neon font-bold">Lyapunov Exponent</h3>
            <button
              onClick={computeLyapunov}
              disabled={loading.lyapunov}
              className="btn-secondary disabled:opacity-50"
            >
              {loading.lyapunov ? '🔄 Computing...' : '▶️ Compute Lyapunov'}
            </button>
          </div>

          {metrics.lyapunov && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(metrics.lyapunov).map(([mapName, data]) => (
                <div key={mapName} className="p-4 border border-teal-dark/30 rounded-lg">
                  <h4 className="text-teal-neon font-semibold mb-3 capitalize">{mapName} Map</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-teal-dark">λ₁:</span>
                      <span className={`font-bold ${data.chaotic ? 'text-green-400' : 'text-red-400'}`}>
                        {data.lambda.toFixed(6)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-teal-dark">Chaotic:</span>
                      <span className={`font-bold ${data.chaotic ? 'text-green-400' : 'text-red-400'}`}>
                        {data.chaotic ? '✅ Yes' : '❌ No'}
                      </span>
                    </div>
                    <p className="text-xs text-teal-dark mt-3">
                      λ₁ &gt; 0 indicates exponential divergence (Butterfly)
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl text-teal-neon font-bold">Avalanche Effect</h3>
            <button
              onClick={computeAvalanche}
              disabled={loading.avalanche || !seed}
              className="btn-secondary disabled:opacity-50"
            >
              {loading.avalanche ? '🔄 Testing...' : '▶️ Run Avalanche Test'}
            </button>
          </div>

          {metrics.avalanche && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-teal-dark/30 rounded-lg text-center">
                  <p className="text-teal-dark text-sm mb-1">Mean Flip %</p>
                  <p className="text-3xl font-bold text-teal-neon">
                    {metrics.avalanche.mean_flip_percentage.toFixed(2)}%
                  </p>
                  <p className="text-xs text-teal-dark mt-1">
                    ± {metrics.avalanche.std_flip_percentage.toFixed(2)}%
                  </p>
                </div>

                <div className="p-4 border border-teal-dark/30 rounded-lg text-center">
                  <p className="text-teal-dark text-sm mb-1">Quality</p>
                  <p className={`text-3xl font-bold ${
                    metrics.avalanche.quality === 'Excellent' ? 'text-green-400' :
                    metrics.avalanche.quality === 'Good' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {metrics.avalanche.quality}
                  </p>
                  <p className="text-xs text-teal-dark mt-1">Target: ~50%</p>
                </div>
              </div>

              <div className="p-4 border border-teal-dark/30 rounded-lg">
                <h4 className="text-teal-neon font-semibold mb-2">Test Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-teal-dark">Min flips:</span>
                    <span className="text-teal-neon">{metrics.avalanche.min_flip}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-teal-dark">Max flips:</span>
                    <span className="text-teal-neon">{metrics.avalanche.max_flip}</span>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span className="text-teal-dark">Total bits:</span>
                    <span className="text-teal-neon">{metrics.avalanche.total_bits}</span>
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl text-teal-neon font-bold">Statistical Test Suite</h3>
            <button
              onClick={computeStatistical}
              disabled={loading.statistical || !seed}
              className="btn-secondary disabled:opacity-50"
            >
              {loading.statistical ? '🔄 Testing...' : '▶️ Run Tests'}
            </button>
          </div>

          {metrics.statistical && (
            <div className="space-y-4">
              {metrics.statistical.summary && (
                <div className="p-4 border border-teal-dark/30 rounded-lg bg-teal-dark/5">
                  <h4 className="text-teal-neon font-semibold mb-3">Summary</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-teal-neon">{metrics.statistical.summary.passed}</p>
                      <p className="text-sm text-teal-dark">Passed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-400">{metrics.statistical.summary.failed}</p>
                      <p className="text-sm text-teal-dark">Failed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-teal-neon">{metrics.statistical.summary.pass_rate.toFixed(1)}%</p>
                      <p className="text-sm text-teal-dark">Pass Rate</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {Object.entries(metrics.statistical)
                  .filter(([key]) => key !== 'summary')
                  .map(([testName, result]) => (
                    <div key={testName} className="p-3 border border-teal-dark/30 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-teal-neon">{result.test_name}</span>
                        <span className={`font-bold ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                          {result.passed ? '✅ PASS' : '❌ FAIL'}
                        </span>
                      </div>
                      <p className="text-xs text-teal-dark mt-1">{result.description}</p>
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
