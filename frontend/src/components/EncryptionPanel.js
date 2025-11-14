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
    <div className="glass-card p-8 card-hover">
      <h2 className="section-title flex items-center gap-3 mb-8">
        <span className="text-4xl animate-bounce-slow">🔐</span>
        <span>Encryption Console</span>
        <span className="text-2xl animate-sparkle">✨</span>
      </h2>

      {/* Seed Input */}
      <div className="mb-6">
        <label className="block text-text-primary mb-2 font-semibold text-lg flex items-center gap-2">
          <span className="animate-wiggle">🔑</span>
          Secret Seed / Password
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            onFocus={(e) => e.target.focus()}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="Enter your secret seed... 🎯"
            className="input-cyber flex-1"
            style={{pointerEvents: 'auto', cursor: 'text', zIndex: 100}}
            autoComplete="off"
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              generateRandomSeed();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="btn-secondary flex items-center gap-2"
            title="Generate a random seed!"
            style={{pointerEvents: 'auto', cursor: 'pointer', zIndex: 100}}
          >
            <span>🎲</span>
            <span>Random</span>
          </button>
        </div>
        <p className="text-xs text-text-muted mt-2 flex items-center gap-2">
          <span className="text-yellow-pastel text-base">⚠️</span>
          <span>Tiny seed changes produce completely different ciphertext (avalanche effect) 🌊</span>
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-3 mb-6">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMode('encrypt');
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className={`px-6 py-3 rounded-2xl font-semibold transition-all flex items-center gap-2 flex-1 ${
            mode === 'encrypt'
              ? 'bg-gradient-to-r from-primary to-primary-light text-white scale-105 animate-pulse-soft shadow-colored-hover'
              : 'bg-white border-2 border-border-light text-text-secondary hover:border-primary hover:scale-105'
          }`}
          style={{pointerEvents: 'auto', cursor: 'pointer', zIndex: 100}}
        >
          {mode === 'encrypt' && <span className="animate-sparkle">✨</span>}
          <span>🔐</span>
          <span>Encrypt</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMode('decrypt');
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className={`px-6 py-3 rounded-2xl font-semibold transition-all flex items-center gap-2 flex-1 ${
            mode === 'decrypt'
              ? 'bg-gradient-to-r from-primary to-primary-light text-white scale-105 animate-pulse-soft shadow-colored-hover'
              : 'bg-white border-2 border-border-light text-text-secondary hover:border-primary hover:scale-105'
          }`}
          style={{pointerEvents: 'auto', cursor: 'pointer', zIndex: 100}}
        >
          {mode === 'decrypt' && <span className="animate-sparkle">✨</span>}
          <span>🔓</span>
          <span>Decrypt</span>
        </button>
      </div>

      {/* Encrypt Mode */}
      {mode === 'encrypt' && (
        <div className="space-y-5">
          <div>
            <label className="block text-text-primary mb-2 font-semibold flex items-center gap-2">
              <span>📝</span>
              <span>Plaintext</span>
            </label>
            <textarea
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
              onFocus={(e) => e.target.focus()}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="Enter message to encrypt... ✨"
              rows="5"
              className="input-cyber w-full resize-none"
              style={{pointerEvents: 'auto', cursor: 'text', zIndex: 100}}
            />
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleEncrypt();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            disabled={loading || !plaintext || !seed}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{pointerEvents: 'auto', cursor: loading || !plaintext || !seed ? 'not-allowed' : 'pointer', zIndex: 100}}
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
            <div className="animate-pulse-soft p-4 bg-primary/5 rounded-2xl border-2 border-primary/20">
              <label className="block text-text-primary mb-2 font-semibold flex items-center gap-2">
                <span className="animate-sparkle">🔒</span>
                <span>Ciphertext (Base64)</span>
                <span className="text-green-pastel animate-bounce-slow">✓</span>
              </label>
              <textarea
                value={ciphertext}
                readOnly
                rows="5"
                className="input-cyber w-full resize-none font-mono text-xs bg-white"
              />
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-text-secondary flex items-center gap-2">
                  <span className="text-green-pastel">✅</span>
                  <span>Length: <span className="font-bold text-primary">{ciphertext.length}</span> characters</span>
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(ciphertext);
                    alert('Ciphertext copied! 📋');
                  }}
                  className="text-xs btn-secondary py-2 px-4 text-xs"
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
        <div className="space-y-5">
          <div>
            <label className="block text-text-primary mb-2 font-semibold flex items-center gap-2">
              <span>🔒</span>
              <span>Ciphertext (Base64)</span>
            </label>
              <textarea
                value={ciphertext}
                onChange={(e) => setCiphertext(e.target.value)}
                onFocus={(e) => e.target.focus()}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Paste ciphertext here... ✨"
                rows="5"
                className="input-cyber w-full resize-none font-mono text-xs"
                style={{pointerEvents: 'auto', cursor: 'text', zIndex: 100}}
              />
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDecrypt();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            disabled={loading || !ciphertext || !seed}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{pointerEvents: 'auto', cursor: loading || !ciphertext || !seed ? 'not-allowed' : 'pointer', zIndex: 100}}
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
            <div className="animate-pulse-soft p-4 bg-green-pastel/10 rounded-2xl border-2 border-green-pastel/30">
              <label className="block text-text-primary mb-2 font-semibold flex items-center gap-2">
                <span className="text-green-pastel animate-bounce-slow">✅</span>
                <span>Decrypted Message</span>
                <span className="text-green-pastel animate-sparkle">🎉</span>
              </label>
              <textarea
                value={decrypted}
                readOnly
                rows="5"
                className="input-cyber w-full resize-none bg-white border-green-pastel/30"
              />
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-5 p-4 border-2 border-red-400 rounded-2xl bg-red-50 animate-wiggle">
          <p className="text-red-600 text-sm flex items-center gap-2 font-semibold">
            <span className="text-2xl">❌</span>
            <span>{error}</span>
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-6 border-2 border-primary/20 rounded-2xl bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 glass-card">
        <h4 className="text-text-primary font-bold mb-3 text-lg flex items-center gap-2">
          <span className="animate-sparkle">🎓</span>
          <span>How it works:</span>
        </h4>
        <ul className="text-sm text-text-secondary space-y-3">
          <li className="flex items-start gap-3">
            <span className="text-xl">1️⃣</span>
            <span><strong className="text-primary">CKDF:</strong> Seed → Chaotic maps → HKDF-SHA256 → Key 🔑</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-xl">2️⃣</span>
            <span><strong className="text-primary">Permutation:</strong> Henon map generates block permutation 🔄</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-xl">3️⃣</span>
            <span><strong className="text-primary">Diffusion:</strong> XOR with hybrid chaotic keystream 🌊</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-xl">4️⃣</span>
            <span><strong className="text-primary">Security:</strong> Lyapunov λ₁ &gt; 0 ensures avalanche effect ⚡</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default EncryptionPanel;
