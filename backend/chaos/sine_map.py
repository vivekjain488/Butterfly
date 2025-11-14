"""
Sine Map Implementation
x_{n+1} = μ * sin(π * x_n)

Chaotic regime: μ close to 1.0
Provides nonlinear mixing component
"""

import numpy as np
from numba import jit


class SineMap:
    """
    Sine Map: x_{n+1} = μ * sin(π * x_n)
    
    Parameters:
    -----------
    mu : float
        Control parameter (μ ≈ 1.0 for Butterfly)
    x0 : float
        Initial condition in (0, 1)
    """
    
    def __init__(self, mu=0.99, x0=0.5):
        if not (0.8 <= mu <= 1.0):
            print(f"Warning: mu={mu} may not be optimal for Butterfly [0.8, 1.0]")
        if not (0 < x0 < 1):
            raise ValueError("Initial condition x0 must be in (0, 1)")
        
        self.mu = mu
        self.x = x0
        self.initial_x = x0
    
    def iterate(self, n=1):
        """Iterate the map n times"""
        for _ in range(n):
            self.x = self.mu * np.sin(np.pi * self.x)
            # Keep in valid range (avoid numerical issues)
            self.x = np.abs(self.x)
            if self.x > 1.0:
                self.x = self.x % 1.0
        return self.x
    
    def generate_sequence(self, length):
        """Generate a sequence of values"""
        return _sine_sequence_jit(self.x, self.mu, length)
    
    def to_bytes(self, n_bytes):
        """Generate bytes from sine map trajectory"""
        sequence = self.generate_sequence(n_bytes)
        self.x = sequence[-1]
        
        # Quantize to bytes
        return np.floor(255 * np.abs(sequence)).astype(np.uint8)
    
    def reset(self, x0=None):
        """Reset to initial or specified state"""
        self.x = x0 if x0 is not None else self.initial_x


@jit(nopython=True)
def _sine_sequence_jit(x0, mu, length):
    """Generate sine map sequence (JIT-compiled)"""
    sequence = np.empty(length, dtype=np.float64)
    x = x0
    
    for i in range(length):
        x = mu * np.sin(np.pi * x)
        x = np.abs(x)  # Keep positive
        if x > 1.0:
            x = x - np.floor(x)  # Modulo operation
        sequence[i] = x
    
    return sequence
