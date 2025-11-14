"""
Hybrid Chaotic Map (HCM)
Couples multiple chaotic maps for enhanced security.

X_{n+1} = (α·f(X_n) + β·g(Y_n) + γ·h(Z_n)) mod 1

Where f, g, h are different chaotic maps with α+β+γ=1
"""

import numpy as np
from numba import jit

from .logistic_map import LogisticMap
from .henon_map import HenonMap
from .lorenz_system import LorenzSystem
from .sine_map import SineMap


class HybridChaoticMap:
    """
    Hybrid Chaotic Map coupling multiple systems.
    
    Combines:
    - Logistic Map (1D, fast)
    - Henon Map (2D, permutation)
    - Lorenz System (3D, high-dimensional)
    - Sine Map (1D, nonlinear mixing)
    
    Parameters:
    -----------
    params : dict
        Control parameters for each map
    mixing : tuple
        (alpha, beta, gamma, delta) mixing coefficients
    initial_conditions : dict
        Initial states for each map
    """
    
    def __init__(self, params=None, mixing=None, initial_conditions=None):
        # Default safe parameters (chaotic regime)
        if params is None:
            params = {
                'logistic_r': 3.99,
                'henon_a': 1.4,
                'henon_b': 0.3,
                'lorenz_sigma': 10.0,
                'lorenz_rho': 28.0,
                'lorenz_beta': 8.0/3.0,
                'sine_mu': 0.99
            }
        
        # Default mixing (equal weights)
        if mixing is None:
            mixing = (0.25, 0.25, 0.25, 0.25)
        
        # Normalize mixing coefficients
        total = sum(mixing)
        self.alpha, self.beta, self.gamma, self.delta = [m/total for m in mixing]
        
        # Default initial conditions
        if initial_conditions is None:
            initial_conditions = {
                'logistic_x0': 0.5,
                'henon_x0': 0.1,
                'henon_y0': 0.1,
                'lorenz_x0': 1.0,
                'lorenz_y0': 1.0,
                'lorenz_z0': 1.0,
                'sine_x0': 0.5
            }
        
        # Initialize component maps
        self.logistic = LogisticMap(
            r=params['logistic_r'],
            x0=initial_conditions['logistic_x0']
        )
        
        self.henon = HenonMap(
            a=params['henon_a'],
            b=params['henon_b'],
            x0=initial_conditions['henon_x0'],
            y0=initial_conditions['henon_y0']
        )
        
        self.lorenz = LorenzSystem(
            sigma=params['lorenz_sigma'],
            rho=params['lorenz_rho'],
            beta=params['lorenz_beta'],
            x0=initial_conditions['lorenz_x0'],
            y0=initial_conditions['lorenz_y0'],
            z0=initial_conditions['lorenz_z0']
        )
        
        self.sine = SineMap(
            mu=params['sine_mu'],
            x0=initial_conditions['sine_x0']
        )
        
        self.params = params
        self.initial_conditions = initial_conditions
    
    def iterate(self, n=1):
        """
        Iterate hybrid system n times.
        Updates all component maps synchronously.
        """
        for _ in range(n):
            # Get values from each map
            log_val = self.logistic.iterate()
            hen_x, hen_y = self.henon.iterate()
            lor_state = self.lorenz.iterate_rk4()
            sine_val = self.sine.iterate()
            
            # Hybrid coupling (not used to update maps, just for output)
            # Maps evolve independently, coupling happens at byte generation
        
        return self.get_hybrid_state()
    
    def get_hybrid_state(self):
        """Get current hybrid state vector"""
        return {
            'logistic': self.logistic.x,
            'henon': (self.henon.x, self.henon.y),
            'lorenz': self.lorenz.state.copy(),
            'sine': self.sine.x
        }
    
    def generate_keystream(self, n_bytes, burn_in=4096):
        """
        Generate cryptographic keystream.
        
        Parameters:
        -----------
        n_bytes : int
            Number of bytes to generate
        burn_in : int
            Iterations to discard (decorrelate from initial conditions)
        
        Returns:
        --------
        keystream : ndarray
            Byte array of length n_bytes
        """
        # Burn-in phase
        self.iterate(burn_in)
        
        # Generation phase - get bytes from each map
        log_bytes = self.logistic.to_bytes(n_bytes)
        hen_bytes = self.henon.to_bytes(n_bytes)
        lor_bytes = self.lorenz.to_bytes(n_bytes)
        sine_bytes = self.sine.to_bytes(n_bytes)
        
        # Hybrid mixing: weighted XOR + modular addition
        keystream = self._mix_bytes(log_bytes, hen_bytes, lor_bytes, sine_bytes)
        
        return keystream
    
    def _mix_bytes(self, b1, b2, b3, b4):
        """
        Mix byte streams using chaotic coefficients.
        Uses weighted combination + multiple XOR layers + bit rotation for strong diffusion.
        """
        # Convert to float for weighted mixing
        w1 = (self.alpha * b1.astype(np.float64)) % 256
        w2 = (self.beta * b2.astype(np.float64)) % 256
        w3 = (self.gamma * b3.astype(np.float64)) % 256
        w4 = (self.delta * b4.astype(np.float64)) % 256
        
        # Layer 1: Modular addition
        mixed_add = (w1 + w2 + w3 + w4) % 256
        
        # Layer 2: Multi-stage XOR with rotations for better bit diffusion
        xor1 = b1 ^ b2
        xor2 = b3 ^ b4
        rot1 = np.roll(xor1, 3)  # Rotate bits for cross-contamination
        rot2 = np.roll(xor2, 5)
        mixed_xor = xor1 ^ xor2 ^ rot1 ^ rot2
        
        # Layer 3: Combine addition and XOR with bit rotation
        intermediate = ((mixed_add.astype(np.int16) + mixed_xor.astype(np.int16)) % 256).astype(np.uint8)
        
        # Layer 4: Final XOR with rotated original streams
        result = intermediate ^ np.roll(b1, 1) ^ np.roll(b2, 2)
        
        return result
    
    def generate_permutation(self, n):
        """Generate permutation indices using Henon map"""
        return self.henon.generate_permutation_indices(n)
    
    def reset(self):
        """Reset all maps to initial conditions"""
        self.logistic.reset()
        self.henon.reset()
        self.lorenz.reset()
        self.sine.reset()
    
    def get_attractor_data(self, n_points=1000):
        """
        Generate Lorenz attractor data for visualization.
        
        Returns:
        --------
        trajectory : ndarray, shape (n_points, 3)
            Lorenz (x, y, z) coordinates
        """
        # Save current state
        current_state = self.lorenz.state.copy()
        
        # Generate trajectory
        trajectory = self.lorenz.generate_trajectory(n_points)
        
        # Restore state
        self.lorenz.state = current_state
        
        return trajectory
