"""
Shannon Entropy Analysis

Measures randomness/unpredictability of byte sequences.
Target: ~7.99 bits/byte for good cryptographic keystream.
"""

import numpy as np
from collections import Counter
import math


def shannon_entropy(sequence):
    """
    Compute Shannon entropy of a sequence.
    
    H(X) = -Σ p(x_i) log₂(p(x_i))
    
    Parameters:
    -----------
    sequence : array-like
        Input sequence
    
    Returns:
    --------
    entropy : float
        Shannon entropy in bits
    """
    if len(sequence) == 0:
        return 0.0
    
    # Count frequencies
    counts = Counter(sequence)
    n = len(sequence)
    
    # Compute probabilities and entropy
    entropy = 0.0
    for count in counts.values():
        p = count / n
        if p > 0:
            entropy -= p * math.log2(p)
    
    return entropy


def shannon_entropy_bytes(byte_array):
    """
    Compute Shannon entropy of byte array.
    
    For perfect randomness: H ≈ 8.0 bits/byte
    For cryptographic use: H ≥ 7.99 bits/byte
    
    Parameters:
    -----------
    byte_array : bytes or ndarray
        Byte sequence
    
    Returns:
    --------
    entropy : float
        Shannon entropy in bits per byte
    """
    if isinstance(byte_array, bytes):
        byte_array = np.frombuffer(byte_array, dtype=np.uint8)
    
    return shannon_entropy(byte_array)


def entropy_per_block(byte_array, block_size=16):
    """
    Compute entropy for each block.
    
    Useful for detecting local patterns.
    
    Returns:
    --------
    entropies : list
        Entropy for each block
    """
    n_blocks = len(byte_array) // block_size
    entropies = []
    
    for i in range(n_blocks):
        block = byte_array[i * block_size:(i + 1) * block_size]
        entropies.append(shannon_entropy_bytes(block))
    
    return entropies


def conditional_entropy(sequence, order=1):
    """
    Compute conditional entropy H(X_n | X_{n-1}, ..., X_{n-order}).
    
    Measures predictability given previous symbols.
    """
    if len(sequence) <= order:
        return 0.0
    
    # Build conditional frequency table
    contexts = {}
    
    for i in range(order, len(sequence)):
        context = tuple(sequence[i - order:i])
        symbol = sequence[i]
        
        if context not in contexts:
            contexts[context] = Counter()
        contexts[context][symbol] += 1
    
    # Compute conditional entropy
    total_count = sum(sum(counter.values()) for counter in contexts.values())
    h_conditional = 0.0
    
    for context, counter in contexts.items():
        context_count = sum(counter.values())
        p_context = context_count / total_count
        
        # Entropy within this context
        h_context = 0.0
        for symbol_count in counter.values():
            p_symbol_given_context = symbol_count / context_count
            if p_symbol_given_context > 0:
                h_context -= p_symbol_given_context * math.log2(p_symbol_given_context)
        
        h_conditional += p_context * h_context
    
    return h_conditional


def test_entropy():
    """Test entropy calculations"""
    print("Testing Entropy Calculations...")
    
    # Test 1: Perfect randomness (should be ~8.0)
    random_bytes = np.random.randint(0, 256, 10000, dtype=np.uint8)
    h_random = shannon_entropy_bytes(random_bytes)
    print(f"✓ Random bytes: H = {h_random:.4f} bits/byte")
    print(f"  Target: ≈ 8.0 for perfect randomness")
    
    # Test 2: Low entropy (repeated pattern)
    repeated = np.array([0, 1, 0, 1] * 1000, dtype=np.uint8)
    h_repeated = shannon_entropy_bytes(repeated)
    print(f"✓ Repeated pattern: H = {h_repeated:.4f} bits/byte")
    print(f"  Expected: ~1.0 (only 2 symbols)")
    
    # Test 3: Zero entropy (constant)
    constant = np.zeros(1000, dtype=np.uint8)
    h_constant = shannon_entropy_bytes(constant)
    print(f"✓ Constant sequence: H = {h_constant:.4f} bits/byte")
    print(f"  Expected: 0.0")
    
    # Test 4: Block entropy
    block_entropies = entropy_per_block(random_bytes, block_size=16)
    avg_block_entropy = np.mean(block_entropies)
    std_block_entropy = np.std(block_entropies)
    print(f"✓ Block entropy (16-byte blocks):")
    print(f"  Mean: {avg_block_entropy:.4f} ± {std_block_entropy:.4f}")
    
    # Test 5: Conditional entropy
    h_cond = conditional_entropy(random_bytes[:1000], order=1)
    print(f"✓ Conditional entropy H(X_n|X_{{n-1}}): {h_cond:.4f}")
    print(f"  For true randomness, should be ≈ 8.0")
    
    print("\nEntropy tests completed!")


if __name__ == "__main__":
    test_entropy()
