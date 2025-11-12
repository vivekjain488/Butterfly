"""
Statistical Tests for Randomness (NIST-inspired)

Implements simplified versions of NIST SP 800-22 tests:
- Frequency (Monobit) Test
- Runs Test
- Chi-Square Test
- Autocorrelation Test
"""

import numpy as np
from scipy import stats
from collections import Counter
import math


def frequency_test(bit_sequence, alpha=0.01):
    """
    Frequency (Monobit) Test
    
    Tests if number of 0s and 1s are approximately equal.
    
    Parameters:
    -----------
    bit_sequence : array-like
        Sequence of bits (0s and 1s)
    alpha : float
        Significance level (default 0.01)
    
    Returns:
    --------
    result : dict
        {
            'test_name': str,
            'statistic': float,
            'p_value': float,
            'passed': bool,
            'description': str
        }
    """
    n = len(bit_sequence)
    
    # Count 1s (convert to int to avoid overflow)
    ones = int(np.sum(bit_sequence))
    
    # Sum = ones - zeros = 2*ones - n
    s = abs(2 * ones - n)
    
    # Test statistic
    s_obs = s / math.sqrt(n)
    
    # P-value
    p_value = math.erfc(s_obs / math.sqrt(2))
    
    return {
        'test_name': 'Frequency (Monobit) Test',
        'statistic': s_obs,
        'p_value': p_value,
        'passed': p_value >= alpha,
        'description': f'Tests if #0s ≈ #1s (p={p_value:.4f}, threshold={alpha})'
    }


def runs_test(bit_sequence, alpha=0.01):
    """
    Runs Test
    
    Tests for expected number of runs (consecutive bits of same value).
    
    Returns:
    --------
    result : dict
    """
    n = len(bit_sequence)
    ones = int(np.sum(bit_sequence))
    pi = ones / n
    
    # Pre-test: check if frequency is reasonable
    if abs(pi - 0.5) >= 2 / math.sqrt(n):
        return {
            'test_name': 'Runs Test',
            'statistic': None,
            'p_value': 0.0,
            'passed': False,
            'description': 'Failed pre-test: frequency too far from 0.5'
        }
    
    # Count runs
    runs = 1
    for i in range(1, n):
        if bit_sequence[i] != bit_sequence[i-1]:
            runs += 1
    
    # Test statistic
    numerator = abs(runs - 2 * n * pi * (1 - pi))
    denominator = 2 * math.sqrt(2 * n) * pi * (1 - pi)
    
    if denominator == 0:
        v_obs = 0
    else:
        v_obs = numerator / denominator
    
    # P-value
    p_value = math.erfc(v_obs / math.sqrt(2))
    
    return {
        'test_name': 'Runs Test',
        'statistic': v_obs,
        'p_value': p_value,
        'passed': p_value >= alpha,
        'description': f'Tests for expected # of runs (p={p_value:.4f})'
    }


def chi_square_test(byte_sequence, alpha=0.01):
    """
    Chi-Square Test for uniformity of byte distribution.
    
    Tests if all byte values (0-255) appear with equal frequency.
    
    Parameters:
    -----------
    byte_sequence : array-like
        Sequence of bytes (0-255)
    
    Returns:
    --------
    result : dict
    """
    n = len(byte_sequence)
    
    # Count occurrences of each byte value
    counts = Counter(byte_sequence)
    
    # Expected frequency for uniform distribution
    expected = n / 256
    
    # Chi-square statistic
    chi_square = 0
    for i in range(256):
        observed = counts.get(i, 0)
        chi_square += (observed - expected)**2 / expected
    
    # Degrees of freedom = 256 - 1 = 255
    df = 255
    
    # P-value
    p_value = 1 - stats.chi2.cdf(chi_square, df)
    
    return {
        'test_name': 'Chi-Square Test',
        'statistic': chi_square,
        'p_value': p_value,
        'passed': p_value >= alpha,
        'description': f'Tests byte uniformity (p={p_value:.4f})'
    }


def autocorrelation_test(sequence, max_lag=100, alpha=0.01):
    """
    Autocorrelation Test
    
    Tests for independence between values at different lags.
    
    Parameters:
    -----------
    sequence : array-like
        Input sequence
    max_lag : int
        Maximum lag to test
    
    Returns:
    --------
    result : dict
    """
    n = len(sequence)
    seq_array = np.array(sequence, dtype=np.float64)
    
    # Normalize to zero mean, unit variance
    seq_normalized = (seq_array - np.mean(seq_array)) / (np.std(seq_array) + 1e-10)
    
    # Compute autocorrelations
    autocorr = []
    lags = range(1, min(max_lag + 1, n // 2))
    
    for lag in lags:
        corr = np.corrcoef(seq_normalized[:-lag], seq_normalized[lag:])[0, 1]
        autocorr.append(abs(corr))
    
    # Test: autocorrelation should be close to 0
    max_autocorr = max(autocorr) if autocorr else 0
    
    # Threshold: 2 / sqrt(n) for 95% confidence
    threshold = 2 / math.sqrt(n)
    
    passed = max_autocorr < threshold
    
    return {
        'test_name': 'Autocorrelation Test',
        'statistic': max_autocorr,
        'threshold': threshold,
        'p_value': 1.0 - max_autocorr if max_autocorr < 1 else 0.0,
        'passed': passed,
        'description': f'Tests independence (max_corr={max_autocorr:.4f}, threshold={threshold:.4f})'
    }


def serial_test(bit_sequence, m=2, alpha=0.01):
    """
    Serial Test (m-bit pattern distribution)
    
    Tests if all m-bit patterns appear with equal frequency.
    
    Parameters:
    -----------
    bit_sequence : array-like
        Sequence of bits
    m : int
        Pattern length
    
    Returns:
    --------
    result : dict
    """
    n = len(bit_sequence)
    
    if n < m:
        return {
            'test_name': f'Serial Test (m={m})',
            'statistic': None,
            'p_value': 0.0,
            'passed': False,
            'description': 'Sequence too short'
        }
    
    # Count m-bit patterns
    patterns = {}
    for i in range(n - m + 1):
        pattern = tuple(bit_sequence[i:i+m])
        patterns[pattern] = patterns.get(pattern, 0) + 1
    
    # Expected count for each pattern
    expected = (n - m + 1) / (2**m)
    
    # Chi-square statistic
    chi_square = 0
    for count in patterns.values():
        chi_square += (count - expected)**2 / expected
    
    # Degrees of freedom
    df = 2**m - 1
    
    # P-value
    p_value = 1 - stats.chi2.cdf(chi_square, df)
    
    return {
        'test_name': f'Serial Test (m={m})',
        'statistic': chi_square,
        'p_value': p_value,
        'passed': p_value >= alpha,
        'description': f'Tests {m}-bit pattern uniformity (p={p_value:.4f})'
    }


def statistical_test_suite(byte_sequence, verbose=True):
    """
    Run complete statistical test suite.
    
    Parameters:
    -----------
    byte_sequence : bytes or ndarray
        Byte sequence to test
    verbose : bool
        Print results
    
    Returns:
    --------
    results : dict
        Dictionary of all test results
    """
    if isinstance(byte_sequence, bytes):
        byte_array = np.frombuffer(byte_sequence, dtype=np.uint8)
    else:
        byte_array = byte_sequence
    
    # Convert to bits
    bit_array = np.unpackbits(byte_array)
    
    results = {}
    
    # Run tests
    results['frequency'] = frequency_test(bit_array)
    results['runs'] = runs_test(bit_array)
    results['chi_square'] = chi_square_test(byte_array)
    results['autocorrelation'] = autocorrelation_test(byte_array)
    results['serial_2bit'] = serial_test(bit_array, m=2)
    results['serial_3bit'] = serial_test(bit_array, m=3)
    
    # Summary
    passed_count = sum(1 for r in results.values() if r['passed'])
    total_count = len(results)
    pass_rate = (passed_count / total_count) * 100
    
    results['summary'] = {
        'total_tests': total_count,
        'passed': passed_count,
        'failed': total_count - passed_count,
        'pass_rate': pass_rate
    }
    
    if verbose:
        print("\n" + "="*70)
        print("STATISTICAL TEST SUITE RESULTS")
        print("="*70)
        
        for test_name, result in results.items():
            if test_name == 'summary':
                continue
            
            status = "✓ PASS" if result['passed'] else "✗ FAIL"
            print(f"\n{result['test_name']}: {status}")
            print(f"  {result['description']}")
            if result.get('statistic') is not None:
                print(f"  Statistic: {result['statistic']:.4f}")
        
        print("\n" + "="*70)
        print(f"SUMMARY: {passed_count}/{total_count} tests passed ({pass_rate:.1f}%)")
        print("="*70 + "\n")
    
    return results


def test_statistical_suite():
    """Test the statistical test suite"""
    print("Testing Statistical Test Suite...")
    
    # Generate test data
    print("\n1. Testing with truly random data:")
    random_bytes = np.random.randint(0, 256, 10000, dtype=np.uint8)
    results_random = statistical_test_suite(random_bytes, verbose=True)
    
    print("\n2. Testing with low-entropy data (repeated pattern):")
    pattern_bytes = np.array([0, 1, 2, 3] * 2500, dtype=np.uint8)
    results_pattern = statistical_test_suite(pattern_bytes, verbose=True)
    
    print("\nStatistical test suite completed!")


if __name__ == "__main__":
    test_statistical_suite()
