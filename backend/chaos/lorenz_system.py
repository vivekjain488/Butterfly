"""
Lorenz System Implementation
dx/dt = σ(y - x)
dy/dt = x(ρ - z) - y
dz/dt = xy - βz

Classic parameters: σ=10, ρ=28, β=8/3
"""

import numpy as np
from numba import jit
from scipy.integrate import odeint


class LorenzSystem:
    """
    Lorenz System: 3D continuous chaotic attractor
    
    dx/dt = σ(y - x)
    dy/dt = x(ρ - z) - y
    dz/dt = xy - βz
    
    Parameters:
    -----------
    sigma, rho, beta : float
        Lorenz parameters
    x0, y0, z0 : float
        Initial conditions
    dt : float
        Integration time step
    """
    
    def __init__(self, sigma=10.0, rho=28.0, beta=8.0/3.0, 
                 x0=1.0, y0=1.0, z0=1.0, dt=0.01):
        self.sigma = sigma
        self.rho = rho
        self.beta = beta
        self.state = np.array([x0, y0, z0], dtype=np.float64)
        self.initial_state = self.state.copy()
        self.dt = dt
    
    def derivatives(self, state, t=0):
        """Compute derivatives for ODE integration"""
        x, y, z = state
        return np.array([
            self.sigma * (y - x),
            x * (self.rho - z) - y,
            x * y - self.beta * z
        ])
    
    def iterate_rk4(self, n=1):
        """Iterate using 4th-order Runge-Kutta"""
        for _ in range(n):
            self.state = _rk4_step(
                self.state, self.dt, self.sigma, self.rho, self.beta
            )
        return self.state
    
    def generate_trajectory(self, length):
        """
        Generate trajectory using RK4 integration.
        
        Returns:
        --------
        trajectory : ndarray, shape (length, 3)
            Array of (x, y, z) coordinates
        """
        trajectory = np.empty((length, 3), dtype=np.float64)
        
        for i in range(length):
            self.state = _rk4_step(
                self.state, self.dt, self.sigma, self.rho, self.beta
            )
            trajectory[i] = self.state
        
        return trajectory
    
    def to_bytes(self, n_bytes):
        """
        Generate bytes from Lorenz trajectory.
        Uses combined entropy from all three coordinates.
        """
        # Generate enough trajectory points
        traj = self.generate_trajectory(n_bytes)
        
        # Mix x, y, z coordinates
        # Normalize each component separately then combine
        x_norm = self._normalize(traj[:, 0])
        y_norm = self._normalize(traj[:, 1])
        z_norm = self._normalize(traj[:, 2])
        
        # Hash-like mixing: weighted combination
        mixed = (0.5 * x_norm + 0.3 * y_norm + 0.2 * z_norm) % 1.0
        
        return np.floor(255 * mixed).astype(np.uint8)
    
    @staticmethod
    def _normalize(arr):
        """Normalize array to [0, 1]"""
        arr_min, arr_max = arr.min(), arr.max()
        return (arr - arr_min) / (arr_max - arr_min + 1e-10)
    
    def reset(self, x0=None, y0=None, z0=None):
        """Reset to initial or specified state"""
        if x0 is None and y0 is None and z0 is None:
            self.state = self.initial_state.copy()
        else:
            if x0 is not None: self.state[0] = x0
            if y0 is not None: self.state[1] = y0
            if z0 is not None: self.state[2] = z0


@jit(nopython=True)
def _lorenz_derivatives(state, sigma, rho, beta):
    """Compute Lorenz derivatives (JIT-compiled)"""
    x, y, z = state
    return np.array([
        sigma * (y - x),
        x * (rho - z) - y,
        x * y - beta * z
    ])


@jit(nopython=True)
def _rk4_step(state, dt, sigma, rho, beta):
    """Single RK4 integration step (JIT-compiled)"""
    k1 = _lorenz_derivatives(state, sigma, rho, beta)
    k2 = _lorenz_derivatives(state + 0.5 * dt * k1, sigma, rho, beta)
    k3 = _lorenz_derivatives(state + 0.5 * dt * k2, sigma, rho, beta)
    k4 = _lorenz_derivatives(state + dt * k3, sigma, rho, beta)
    
    return state + (dt / 6.0) * (k1 + 2*k2 + 2*k3 + k4)
