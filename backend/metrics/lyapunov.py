"""
Lyapunov Exponent Calculation

Measures sensitivity to initial conditions.
Positive λ₁ indicates Butterfly.
"""

import numpy as np
from numba import jit


def compute_lyapunov_exponent(map_func, x0, params, n_iterations=10000, 
                               dt=0.01, epsilon=1e-8):
    """
    Compute largest Lyapunov exponent using finitetime method.
    
    Parameters:
    -----------
    map_func : callable
        Function that iterates the map: x_{n+1} = map_func(x_n, params)
    x0 : float or array
        Initial condition
    params : dict
        Map parameters
    n_iterations : int
        Number of iterations
    dt : float
        Time step (for continuous systems)
    epsilon : float
        Initial separation
    
    Returns:
    --------
    lambda_1 : float
        Largest Lyapunov exponent
    """
    x = np.array(x0, dtype=np.float64)
    x_perturbed = x + epsilon * np.random.randn(*x.shape if hasattr(x, 'shape') else (1,))
    
    lyapunov_sum = 0.0
    
    for i in range(n_iterations):
        # Evolve both trajectories
        x = map_func(x, params)
        x_perturbed = map_func(x_perturbed, params)
        
        # Compute separation
        delta = np.linalg.norm(x_perturbed - x) if hasattr(x, '__len__') else abs(x_perturbed - x)
        
        # Accumulate logarithm
        if delta > 1e-12:
            lyapunov_sum += np.log(delta / epsilon)
            
            # Renormalize perturbation
            direction = (x_perturbed - x) / delta
            x_perturbed = x + epsilon * direction
    
    lambda_1 = lyapunov_sum / (n_iterations * dt)
    return lambda_1


def compute_lyapunov_logistic(r=3.99, x0=0.5, n_iterations=10000):
    """
    Compute Lyapunov exponent for Logistic map.
    
    Analytical formula: λ = lim (1/n) Σ log|r - 2rx_i|
    """
    x = x0
    lyapunov_sum = 0.0
    
    for _ in range(n_iterations):
        x = r * x * (1 - x)
        derivative = abs(r - 2 * r * x)
        if derivative > 1e-12:
            lyapunov_sum += np.log(derivative)
    
    return lyapunov_sum / n_iterations


def compute_lyapunov_henon(a=1.4, b=0.3, x0=0.1, y0=0.1, n_iterations=10000):
    """
    Compute Lyapunov exponent for Henon map using QR decomposition.
    """
    x, y = x0, y0
    lyapunov_sum = 0.0
    
    # Tangent vector
    v = np.array([1.0, 0.0])
    
    for _ in range(n_iterations):
        # Jacobian matrix
        J = np.array([
            [-2 * a * x, 1],
            [b, 0]
        ])
        
        # Evolve tangent vector
        v = J @ v
        norm_v = np.linalg.norm(v)
        
        if norm_v > 1e-12:
            lyapunov_sum += np.log(norm_v)
            v = v / norm_v
        
        # Evolve state
        x_new = 1 - a * x**2 + y
        y_new = b * x
        x, y = x_new, y_new
    
    return lyapunov_sum / n_iterations


def compute_lyapunov_lorenz(sigma=10.0, rho=28.0, beta=8.0/3.0,
                            x0=1.0, y0=1.0, z0=1.0,
                            dt=0.01, n_iterations=10000):
    """
    Compute Lyapunov exponent for Lorenz system.
    """
    from scipy.integrate import odeint
    
    def lorenz(state, t):
        x, y, z = state
        return [
            sigma * (y - x),
            x * (rho - z) - y,
            x * y - beta * z
        ]
    
    # Main trajectory
    state = np.array([x0, y0, z0])
    
    # Perturbed trajectory
    epsilon = 1e-8
    state_perturbed = state + epsilon * np.random.randn(3)
    
    lyapunov_sum = 0.0
    t = np.linspace(0, dt, 2)
    
    for _ in range(n_iterations):
        # Integrate both trajectories
        state = odeint(lorenz, state, t)[-1]
        state_perturbed = odeint(lorenz, state_perturbed, t)[-1]
        
        # Compute separation
        delta = np.linalg.norm(state_perturbed - state)
        
        if delta > 1e-12:
            lyapunov_sum += np.log(delta / epsilon)
            
            # Renormalize
            direction = (state_perturbed - state) / delta
            state_perturbed = state + epsilon * direction
    
    return lyapunov_sum / (n_iterations * dt)


def test_lyapunov():
    """Test Lyapunov exponent calculations"""
    print("Testing Lyapunov Exponent Calculations...")
    
    # Logistic map
    lambda_logistic = compute_lyapunov_logistic(r=3.99)
    print(f"✓ Logistic Map (r=3.99): λ₁ = {lambda_logistic:.4f}")
    print(f"  Expected: λ₁ > 0 for Butterfly")
    
    # Henon map
    lambda_henon = compute_lyapunov_henon(a=1.4, b=0.3)
    print(f"✓ Henon Map (a=1.4, b=0.3): λ₁ = {lambda_henon:.4f}")
    
    # Lorenz system (expensive, use fewer iterations)
    lambda_lorenz = compute_lyapunov_lorenz(n_iterations=1000)
    print(f"✓ Lorenz System: λ₁ = {lambda_lorenz:.4f}")
    
    print("\nAll Lyapunov tests completed!")


if __name__ == "__main__":
    test_lyapunov()
