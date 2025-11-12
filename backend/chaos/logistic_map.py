"""
Logistic Map Implementation
x_{n+1} = r * x_n * (1 - x_n)

Chaotic regime: r ∈ (3.57, 4.0)
Optimal for cryptography: r ∈ [3.9, 4.0]
"""

import numpy as np
from numba import jit, prange


class LogisticMap:
    """
    Logistic Map: x_{n+1} = r * x_n * (1 - x_n)
    
    Parameters:
    -----------
    r : float
        Control parameter, typically in [3.57, 4.0] for chaos
    x0 : float
        Initial condition, must be in (0, 1)
    """
    
    def __init__(self, r=3.99, x0=0.5):
        if not (3.57 <= r <= 4.0):
            print(f"Warning: r={r} may not be in chaotic regime [3.57, 4.0]")
        if not (0 < x0 < 1):
            raise ValueError("Initial condition x0 must be in (0, 1)")
        
        self.r = r
        self.x = x0
        self.initial_x = x0
    
    def iterate(self, n=1):
        """Iterate the map n times"""
        for _ in range(n):
            self.x = self.r * self.x * (1 - self.x)
        return self.x
    
    def generate_sequence(self, length):
        """Generate a sequence of values"""
        return _logistic_sequence_jit(self.x, self.r, length)
    
    def reset(self, x0=None):
        """Reset to initial or specified state"""
        self.x = x0 if x0 is not None else self.initial_x
    
    def to_bytes(self, n_bytes):
        """Generate n_bytes by quantizing chaotic trajectory"""
        sequence = self.generate_sequence(n_bytes)
        # Update internal state
        self.x = sequence[-1]
        # Quantize to bytes: floor(255 * x_i)
        return np.floor(255 * sequence).astype(np.uint8)


@jit(nopython=True)
def _logistic_iteration(x, r):
    """Single iteration (JIT-compiled)"""
    return r * x * (1 - x)


@jit(nopython=True)
def _logistic_sequence_jit(x0, r, length):
    """Generate sequence (JIT-compiled for speed)"""
    sequence = np.empty(length, dtype=np.float64)
    x = x0
    for i in range(length):
        x = r * x * (1 - x)
        sequence[i] = x
    return sequence


@jit(nopython=True, parallel=True)
def logistic_keystream_parallel(seed, r, n, burn_in=1000):
    """
    Generate cryptographic keystream from logistic map
    
    Parameters:
    -----------
    seed : float
        Initial seed in (0, 1)
    r : float
        Control parameter
    n : int
        Number of bytes to generate
    burn_in : int
        Iterations to discard (decorrelate from seed)
    
    Returns:
    --------
    bytes : ndarray
        Keystream bytes
    """
    # Burn-in phase
    x = seed
    for _ in range(burn_in):
        x = r * x * (1 - x)
    
    # Generation phase
    keystream = np.empty(n, dtype=np.uint8)
    for i in prange(n):
        x = r * x * (1 - x)
        keystream[i] = np.uint8(np.floor(255 * x))
    
    return keystream
