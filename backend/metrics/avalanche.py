"""
Avalanche Effect Testing

Measures how much a small change in input affects output.
Good cipher: ~50% bits flip from single bit input change.
"""

import numpy as np
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))


def avalanche_test(encrypt_func, plaintext, n_trials=100):
    """
    Test avalanche effect of encryption function.
    
    Flips random bits in plaintext and measures ciphertext bit differences.
    
    Parameters:
    -----------
    encrypt_func : callable
        Encryption function: ciphertext = encrypt_func(plaintext)
    plaintext : bytes
        Original plaintext
    n_trials : int
        Number of bit-flip trials
    
    Returns:
    --------
    results : dict
        {
            'mean_flip_percentage': float,
            'std_flip_percentage': float,
            'min_flip': int,
            'max_flip': int,
            'all_flips': list
        }
    """
    # Original ciphertext
    original_ct = encrypt_func(plaintext)
    original_bits = bytes_to_bits(original_ct)
    
    flip_percentages = []
    flip_counts = []
    
    for _ in range(n_trials):
        # Flip a random bit in plaintext
        modified_pt = flip_random_bit(plaintext)
        
        # Encrypt modified plaintext
        modified_ct = encrypt_func(modified_pt)
        modified_bits = bytes_to_bits(modified_ct)
        
        # Count bit differences
        flipped_bits = sum(b1 != b2 for b1, b2 in zip(original_bits, modified_bits))
        total_bits = len(original_bits)
        
        flip_counts.append(flipped_bits)
        flip_percentages.append((flipped_bits / total_bits) * 100)
    
    return {
        'mean_flip_percentage': np.mean(flip_percentages),
        'std_flip_percentage': np.std(flip_percentages),
        'min_flip': np.min(flip_counts),
        'max_flip': np.max(flip_counts),
        'total_bits': len(original_bits),
        'all_flips': flip_counts,
        'target': '~50%'
    }


def avalanche_test_seed_sensitivity(cipher_class, plaintext, seed, n_trials=100):
    """
    Test seed sensitivity: tiny seed changes -> large ciphertext changes.
    
    Parameters:
    -----------
    cipher_class : class
        Cipher class with __init__(seed) and encrypt(plaintext)
    plaintext : str or bytes
        Plaintext to encrypt
    seed : str
        Original seed
    n_trials : int
        Number of seed perturbation trials
    
    Returns:
    --------
    results : dict
    """
    # Original encryption
    cipher_orig = cipher_class(seed)
    ct_orig = cipher_orig.encrypt(plaintext)
    bits_orig = bytes_to_bits(ct_orig)
    
    flip_percentages = []
    
    for i in range(n_trials):
        # Modify seed slightly
        if isinstance(seed, str):
            # Change one character
            modified_seed = seed[:-1] + chr((ord(seed[-1]) + i + 1) % 128)
        else:
            # Flip one bit in byte representation
            modified_seed = flip_random_bit(seed)
        
        # Encrypt with modified seed
        cipher_mod = cipher_class(modified_seed)
        ct_mod = cipher_mod.encrypt(plaintext)
        bits_mod = bytes_to_bits(ct_mod)
        
        # Count differences
        flipped = sum(b1 != b2 for b1, b2 in zip(bits_orig, bits_mod))
        total = len(bits_orig)
        flip_percentages.append((flipped / total) * 100)
    
    return {
        'mean_flip_percentage': np.mean(flip_percentages),
        'std_flip_percentage': np.std(flip_percentages),
        'target': '~50%'
    }


def bytes_to_bits(byte_data):
    """Convert bytes to list of bits"""
    if isinstance(byte_data, str):
        byte_data = byte_data.encode()
    
    bits = []
    for byte in byte_data:
        for i in range(8):
            bits.append((byte >> i) & 1)
    return bits


def flip_random_bit(data):
    """Flip a random bit in byte data"""
    if isinstance(data, str):
        data = data.encode()
    
    data_array = bytearray(data)
    
    # Choose random byte and bit position
    byte_pos = np.random.randint(0, len(data_array))
    bit_pos = np.random.randint(0, 8)
    
    # Flip the bit
    data_array[byte_pos] ^= (1 << bit_pos)
    
    return bytes(data_array)


def hamming_distance(bytes1, bytes2):
    """Compute Hamming distance between two byte sequences"""
    if len(bytes1) != len(bytes2):
        raise ValueError("Sequences must have equal length")
    
    distance = 0
    for b1, b2 in zip(bytes1, bytes2):
        # XOR and count set bits
        xor = b1 ^ b2
        distance += bin(xor).count('1')
    
    return distance


def test_avalanche():
    """Test avalanche calculations"""
    print("Testing Avalanche Effect...")
    
    from crypto.cipher import ButterflyCipher
    
    # Setup
    seed = "test_password"
    plaintext = "The quick brown fox jumps over the lazy dog"
    
    # Test 1: Plaintext avalanche
    cipher = ButterflyCipher(seed)
    
    def encrypt_func(pt):
        # Create new cipher instance to reset state
        c = ButterflyCipher(seed)
        return c.encrypt(pt)
    
    results = avalanche_test(encrypt_func, plaintext.encode(), n_trials=50)
    
    print(f"✓ Plaintext Avalanche Effect:")
    print(f"  Mean flip: {results['mean_flip_percentage']:.2f}% ± {results['std_flip_percentage']:.2f}%")
    print(f"  Range: {results['min_flip']}-{results['max_flip']} bits (out of {results['total_bits']})")
    print(f"  Target: ~50% for good avalanche")
    
    # Test 2: Seed sensitivity
    results_seed = avalanche_test_seed_sensitivity(
        ButterflyCipher, plaintext, seed, n_trials=20
    )
    
    print(f"✓ Seed Sensitivity:")
    print(f"  Mean flip: {results_seed['mean_flip_percentage']:.2f}% ± {results_seed['std_flip_percentage']:.2f}%")
    print(f"  Target: ~50% for good sensitivity")
    
    print("\nAvalanche tests completed!")


if __name__ == "__main__":
    test_avalanche()
