"""
Metrics and Evaluation Module

Implements:
- Lyapunov exponent calculation
- Shannon entropy analysis
- Avalanche effect testing
- NIST-style statistical tests
- Correlation analysis
"""

from .lyapunov import (
    compute_lyapunov_exponent,
    compute_lyapunov_logistic,
    compute_lyapunov_henon,
    compute_lyapunov_lorenz
)
from .entropy import shannon_entropy, shannon_entropy_bytes
from .avalanche import avalanche_test
from .statistical_tests import (
    frequency_test,
    runs_test,
    autocorrelation_test,
    chi_square_test,
    statistical_test_suite
)

__all__ = [
    'compute_lyapunov_exponent',
    'compute_lyapunov_logistic',
    'compute_lyapunov_henon',
    'compute_lyapunov_lorenz',
    'shannon_entropy',
    'shannon_entropy_bytes',
    'avalanche_test',
    'frequency_test',
    'runs_test',
    'autocorrelation_test',
    'chi_square_test',
    'statistical_test_suite'
]
