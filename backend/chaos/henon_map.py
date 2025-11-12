"""
Henon Map Implementation
x_{n+1} = 1 - a*x_n^2 + y_n
y_{n+1} = b*x_n

Classic chaotic parameters: a=1.4, b=0.3
"""

import numpy as np
from numba import jit


class HenonMap:
    """
    Henon Map: 2D discrete chaotic attractor
    
    x_{n+1} = 1 - a*x_n^2 + y_n
    y_{n+1} = b*x_n
    
    Parameters:
    -----------
    a : float
        Nonlinearity parameter (typical: 1.4)
    b : float
        Dissipation parameter (typical: 0.3)
    x0, y0 : float
        Initial conditions
    """
    
    def __init__(self, a=1.4, b=0.3, x0=0.1, y0=0.1):
        self.a = a
        self.b = b
        self.x = x0
        self.y = y0
        self.initial_state = (x0, y0)
    
    def iterate(self, n=1):
        """Iterate the map n times"""
        for _ in range(n):
            x_new = 1 - self.a * self.x**2 + self.y
            y_new = self.b * self.x
            self.x, self.y = x_new, y_new
        return self.x, self.y
    
    def generate_trajectory(self, length):
        """Generate trajectory of (x, y) pairs"""
        return _henon_trajectory_jit(self.x, self.y, self.a, self.b, length)
    
    def generate_permutation_indices(self, n):
        """
        Generate permutation indices from Henon trajectory.
        Used for cryptographic permutation stage.
        
        Returns:
        --------
        perm : ndarray
            Permutation of range(n)
        """
        # Generate trajectory
        traj_x, traj_y = self.generate_trajectory(n)
        
        # Use x-coordinates to define permutation
        # (sorted indices by magnitude)
        indices = np.argsort(traj_x)
        
        # Update internal state
        self.x, self.y = traj_x[-1], traj_y[-1]
        
        return indices
    
    def to_bytes(self, n_bytes):
        """
        Generate bytes from Henon trajectory.
        Combines x and y coordinates via mixing.
        """
        traj_x, traj_y = self.generate_trajectory(n_bytes)
        self.x, self.y = traj_x[-1], traj_y[-1]
        
        # Mix x and y, normalize to [0, 1], then quantize
        mixed = (np.abs(traj_x) + np.abs(traj_y)) / 2.0
        normalized = (mixed - mixed.min()) / (mixed.max() - mixed.min() + 1e-10)
        
        return np.floor(255 * normalized).astype(np.uint8)
    
    def reset(self, x0=None, y0=None):
        """Reset to initial or specified state"""
        if x0 is None and y0 is None:
            self.x, self.y = self.initial_state
        else:
            self.x = x0 if x0 is not None else self.x
            self.y = y0 if y0 is not None else self.y


@jit(nopython=True)
def _henon_trajectory_jit(x0, y0, a, b, length):
    """Generate Henon trajectory (JIT-compiled)"""
    x_traj = np.empty(length, dtype=np.float64)
    y_traj = np.empty(length, dtype=np.float64)
    
    x, y = x0, y0
    for i in range(length):
        x_new = 1 - a * x**2 + y
        y_new = b * x
        x, y = x_new, y_new
        x_traj[i] = x
        y_traj[i] = y
    
    return x_traj, y_traj
