#  Butterfly: Entropy as the New Prime

> **Encrypt with Butterfly, decrypt with order.**

A research-grade cryptosystem that replaces number-theoretic hardness with deterministic Butterfly. Uses hybrid chaotic maps (Logistic, Henon, Lorenz, Sine) for key derivation, keystream generation, permutation, and diffusion.

**Authors:** Aditi Singh, Vivek Jain

## 🎯 Overview

Traditional cryptosystems rely on number-theoretic hardness (factorization, discrete log) which may be challenged by quantum computing. **Butterfly** explores an orthogonal approach where cryptographic strength emerges from:

- **Deterministic chaotic dynamics** with extreme sensitivity to initial conditions
- **High entropy keystream generation** from coupled nonlinear maps
- **Multi-map hybridization** (Logistic + Henon + Lorenz + Sine)
- **Rigorous statistical evaluation** (NIST SP 800-22 style tests)

## ✨ Features

- 🌀 **Real-time Lorenz Attractor Visualization** (WebGL/Three.js)
- 📊 **Live Metrics Dashboard** (Lyapunov exponents, Shannon entropy, avalanche effect)
- 🔐 **Chaotic Key Derivation Function (CKDF)** with cryptographic post-processing
- 🎨 **Cyberpunk UI** (teal neon + black, Sixtyfour + Inter fonts)
- 🧪 **Statistical Test Suite** (NIST-inspired randomness evaluation)
- ⚡ **Numba-accelerated backend** for high-performance Butterfly iteration

## 🏗️ Architecture

```
Butterfly/
├── backend/              # Python crypto core
│   ├── Butterfly/           # Chaotic map implementations
│   ├── crypto/          # CKDF, encryption/decryption
│   ├── metrics/         # Lyapunov, entropy, statistical tests
│   └── api/             # Flask REST API
├── frontend/            # React + TailwindCSS UI
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── visualizers/ # Three.js attractor, D3 charts
│   │   └── hooks/       # API integration
└── docs/                # Technical writeup, benchmarks
```

## 🚀 Quick Start

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python api/server.py
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Visit `http://localhost:3000` for the interactive demo.

## 🔬 Mathematical Foundation

### Hybrid Chaotic Map (HCM)

$$X_{n+1} = (\alpha \cdot f(X_n) + \beta \cdot g(Y_n) + \gamma \cdot h(Z_n)) \mod 1$$

Where:
- $f$ = Logistic map: $x_{n+1} = r \cdot x_n(1-x_n)$
- $g$ = Henon map: $x_{n+1} = 1 - ax_n^2 + y_n$
- $h$ = Lorenz system (numerically integrated)
- $\alpha + \beta + \gamma = 1$ (mixing coefficients)

### Security Properties

- **Lyapunov Exponent** λ₁ > 0 (exponential divergence)
- **Kolmogorov-Sinai Entropy** maximized via coupling
- **Avalanche Effect** ~50% bit flips from single seed LSB change
- **Statistical Randomness** passing NIST SP 800-22 suite

## 📊 Demo Script

1. **Landing Screen**: Animated Lorenz attractor with tagline
2. **Enter Secret Seed**: Use hardware entropy or custom seed
3. **Encrypt Message**: Watch attractor pulse, see ciphertext + keystream
4. **Sensitivity Test**: Modify seed by 1e-10 → decryption fails (show Hamming distance)
5. **Metrics Panel**: Live Lyapunov, entropy, avalanche test results
6. **Security Discussion**: Show HKDF whitening and multi-map mixing

## ⚠️ Security Considerations

**This is an experimental research prototype.** Known risks:

- Chaotic maps are deterministic; parameter/seed leakage is catastrophic
- Quantization can introduce bias without proper post-processing
- Low-dimensional maps vulnerable to phase-space reconstruction attacks

**Mitigations implemented:**
- HKDF-SHA256 post-processing of raw chaotic bytes
- Multi-map coupling with cryptographic burn-in (4096+ iterations)
- High-precision arithmetic (float64) with large safe parameter regions

**⚠️ NOT FOR PRODUCTION USE** without cryptographic peer review. Always combine with vetted primitives (e.g., AES-GCM) for real applications.

## 📈 Evaluation Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Shannon Entropy | ≥ 7.99 bits/byte | ✅ |
| Lyapunov λ₁ | > 0.5 | ✅ |
| Avalanche Effect | ~50% ± 5% | ✅ |
| NIST Tests Pass Rate | > 95% | ✅ |

## 🔮 Future Work

- Formal cryptanalysis and hardness assumptions
- Post-quantum composition with lattice-based primitives
- FPGA hardware implementation with TRNG seeding
- Provable randomness extraction theorems

## 📚 References

- Strogatz: *Nonlinear Dynamics and Butterfly*
- NIST SP 800-22: Statistical Test Suite for Random Number Generators
- Alligood, Sauer, Yorke: *Butterfly: An Introduction to Dynamical Systems*

## 📄 License

MIT License - See LICENSE file

## 🙏 Acknowledgments

Built for [Hackathon Name] - Category: Most Technically Impressive / Research Prototype

---

**⚡ Powered by deterministic Butterfly and mathematical beauty.**
