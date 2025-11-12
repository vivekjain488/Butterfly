import React, { useState } from 'react';
import axios from 'axios';

function EncryptionPanel({ seed, setSeed, params, mixing, setIsEncrypting }) {
  const [plaintext, setPlaintext] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [decrypted, setDecrypted] = useState('');
  const [mode, setMode] = useState('encrypt');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEncrypt = async () => {
    if (!plaintext || !seed) {
      setError('Please provide both plaintext and seed');
      return;
    }

    setLoading(true);
    setError('');
    setIsEncrypting(true);

    try {
      const response = await axios.post('/api/encrypt', {
        plaintext,
        seed,
        params,
        mixing,
        mode: 'text'
      });

      setCiphertext(response.data.ciphertext);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Encryption failed');
    } finally {
      setLoading(false);
      setTimeout(() => setIsEncrypting(false), 2000);
    }
  };

  const handleDecrypt = async () => {
    if (!ciphertext || !seed) {
      setError('Please provide both ciphertext and seed');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/decrypt', {
        ciphertext,
        seed,
        params,
        mixing,
        mode: 'text'
      });

      setDecrypted(response.data.plaintext);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Decryption failed');
    } finally {
      setLoading(false);
    }
  };

  const generateRandomSeed = () => {
    const randomSeed = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
    setSeed(randomSeed);
  };

  return (
    <div className="glass-card p-6">
      <h2 className="section-title">Encryption Console</h2>

      {/* Seed Input */}
      <div className="mb-6">
        <label className="block text-teal-neon mb-2 font-semibold">
          🔑 Secret Seed / Password
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="Enter your secret seed..."
            className="input-cyber flex-1"
          />
          <button
            onClick={generateRandomSeed}
            className="btn-secondary"
          >
            Random
          </button>
        </div>
        <p className="text-xs text-teal-dark mt-1">
          ⚠️ Tiny seed changes produce completely different ciphertext (avalanche effect)
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('encrypt')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            mode === 'encrypt'
              ? 'bg-teal-neon text-cyber-bg'
              : 'bg-transparent border border-teal-dark text-teal-dark hover:border-teal-neon'
          }`}
        >
          Encrypt
        </button>
        <button
          onClick={() => setMode('decrypt')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            mode === 'decrypt'
              ? 'bg-teal-neon text-cyber-bg'
              : 'bg-transparent border border-teal-dark text-teal-dark hover:border-teal-neon'
          }`}
        >
          Decrypt
        </button>
      </div>

      {/* Encrypt Mode */}
      {mode === 'encrypt' && (
        <div className="space-y-4">
          <div>
            <label className="block text-teal-neon mb-2 font-semibold">
              📝 Plaintext
            </label>
            <textarea
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
              placeholder="Enter message to encrypt..."
              rows="4"
              className="input-cyber w-full resize-none"
            />
          </div>

          <button
            onClick={handleEncrypt}
            disabled={loading || !plaintext || !seed}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '🔄 Encrypting...' : '🔐 Encrypt'}
          </button>

          {ciphertext && (
            <div>
              <label className="block text-teal-neon mb-2 font-semibold">
                🔒 Ciphertext (Base64)
              </label>
              <textarea
                value={ciphertext}
                readOnly
                rows="4"
                className="input-cyber w-full resize-none font-mono text-xs"
              />
              <p className="text-xs text-teal-dark mt-1">
                ✅ Length: {ciphertext.length} characters
              </p>
            </div>
          )}
        </div>
      )}

      {/* Decrypt Mode */}
      {mode === 'decrypt' && (
        <div className="space-y-4">
          <div>
            <label className="block text-teal-neon mb-2 font-semibold">
              🔒 Ciphertext (Base64)
            </label>
            <textarea
              value={ciphertext}
              onChange={(e) => setCiphertext(e.target.value)}
              placeholder="Paste ciphertext here..."
              rows="4"
              className="input-cyber w-full resize-none font-mono text-xs"
            />
          </div>

          <button
            onClick={handleDecrypt}
            disabled={loading || !ciphertext || !seed}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '🔄 Decrypting...' : '🔓 Decrypt'}
          </button>

          {decrypted && (
            <div>
              <label className="block text-teal-neon mb-2 font-semibold">
                ✅ Decrypted Message
              </label>
              <textarea
                value={decrypted}
                readOnly
                rows="4"
                className="input-cyber w-full resize-none bg-teal-neon/10"
              />
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 border border-red-500 rounded-lg bg-red-500/10">
          <p className="text-red-400 text-sm">❌ {error}</p>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 border border-teal-dark/30 rounded-lg bg-teal-dark/5">
        <h4 className="text-teal-neon font-semibold mb-2">How it works:</h4>
        <ul className="text-sm text-teal-dark space-y-1">
          <li>1️⃣ <strong>CKDF:</strong> Seed → Chaotic maps → HKDF-SHA256 → Key</li>
          <li>2️⃣ <strong>Permutation:</strong> Henon map generates block permutation</li>
          <li>3️⃣ <strong>Diffusion:</strong> XOR with hybrid chaotic keystream</li>
          <li>4️⃣ <strong>Security:</strong> Lyapunov λ₁ &gt; 0 ensures avalanche effect</li>
        </ul>
      </div>
    </div>
  );
}

export default EncryptionPanel;
