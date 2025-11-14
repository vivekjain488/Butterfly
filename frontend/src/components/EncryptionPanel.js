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
      <h2 className="section-title flex items-center gap-3">
        <span className="text-4xl animate-bounce-slow">🔐</span>
        <span>Encryption Console</span>
        <span className="text-2xl animate-sparkle">✨</span>
      </h2>

      {/* Seed Input */}
      <div className="mb-6">
        <label className="block text-teal-neon mb-2 font-semibold text-lg flex items-center gap-2">
          <span className="animate-wiggle">🔑</span>
          Secret Seed / Password
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="Enter your secret seed... 🎯"
            className="input-cyber flex-1"
          />
          <button
            onClick={generateRandomSeed}
            className="btn-secondary flex items-center gap-2"
            title="Generate a random seed!"
          >
            <span>🎲</span>
            Random
          </button>
        </div>
        <p className="text-xs text-teal-dark mt-2 flex items-center gap-1">
          <span className="text-yellow-400">⚠️</span>
          Tiny seed changes produce completely different ciphertext (avalanche effect) 🌊
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
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">🔄</span>
                <span>Encrypting...</span>
              </>
            ) : (
              <>
                <span>🔐</span>
                <span>Encrypt</span>
                <span className="animate-sparkle">✨</span>
              </>
            )}
          </button>

          {ciphertext && (
            <div className="animate-pulse-glow">
              <label className="block text-teal-neon mb-2 font-semibold flex items-center gap-2">
                <span className="animate-sparkle">🔒</span>
                Ciphertext (Base64)
                <span className="text-green-400 animate-bounce-slow">✓</span>
              </label>
              <textarea
                value={ciphertext}
                readOnly
                rows="4"
                className="input-cyber w-full resize-none font-mono text-xs bg-teal-neon/5"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-teal-dark flex items-center gap-1">
                  <span className="text-green-400">✅</span>
                  Length: <span className="font-bold text-teal-neon">{ciphertext.length}</span> characters
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(ciphertext);
                    alert('Ciphertext copied! 📋');
                  }}
                  className="text-xs btn-secondary py-1 px-2 text-xs"
                >
                  📋 Copy
                </button>
              </div>
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
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">🔄</span>
                <span>Decrypting...</span>
              </>
            ) : (
              <>
                <span>🔓</span>
                <span>Decrypt</span>
                <span className="animate-sparkle">✨</span>
              </>
            )}
          </button>

          {decrypted && (
            <div className="animate-pulse-glow">
              <label className="block text-teal-neon mb-2 font-semibold flex items-center gap-2">
                <span className="text-green-400 animate-bounce-slow">✅</span>
                Decrypted Message
                <span className="text-green-400 animate-sparkle">🎉</span>
              </label>
              <textarea
                value={decrypted}
                readOnly
                rows="4"
                className="input-cyber w-full resize-none bg-green-400/10 border-green-400/30"
              />
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 border-2 border-red-500 rounded-xl bg-red-500/20 animate-wiggle">
          <p className="text-red-400 text-sm flex items-center gap-2 font-semibold">
            <span className="text-2xl">❌</span>
            <span>{error}</span>
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-5 border-2 border-teal-dark/30 rounded-xl bg-gradient-to-br from-teal-dark/10 to-accent/10 glass-card">
        <h4 className="text-teal-neon font-bold mb-3 text-lg flex items-center gap-2">
          <span className="animate-sparkle">🎓</span>
          How it works:
        </h4>
        <ul className="text-sm text-teal-dark space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-xl">1️⃣</span>
            <span><strong className="text-teal-neon">CKDF:</strong> Seed → Chaotic maps → HKDF-SHA256 → Key 🔑</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-xl">2️⃣</span>
            <span><strong className="text-teal-neon">Permutation:</strong> Henon map generates block permutation 🔄</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-xl">3️⃣</span>
            <span><strong className="text-teal-neon">Diffusion:</strong> XOR with hybrid chaotic keystream 🌊</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-xl">4️⃣</span>
            <span><strong className="text-teal-neon">Security:</strong> Lyapunov λ₁ &gt; 0 ensures avalanche effect ⚡</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default EncryptionPanel;
