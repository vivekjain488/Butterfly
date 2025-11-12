"""
Chaotic Key Derivation Function (CKDF)

Derives cryptographic keys from user secrets using chaotic dynamics.
Includes cryptographic post-processing via HKDF-SHA256.
"""

import hashlib
import hmac
import numpy as np
from hkdf import hkdf_expand, hkdf_extract

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from chaos import HybridChaoticMap


class ChaoticKDF:
    """
    Chaotic Key Derivation Function
    
    Procedure:
    1. Preprocess seed via HMAC-SHA512(seed, salt)
    2. Map to initial conditions for chaotic maps
    3. Burn-in iterations (default 4096)
    4. Generate keystream from hybrid chaos
    5. Post-process with HKDF-SHA256 for final key
    
    Parameters:
    -----------
    seed : str or bytes
        User secret (password/seed)
    salt : bytes
        Cryptographic salt (min 16 bytes)
    params : dict, optional
        Custom chaotic map parameters
    mixing : tuple, optional
        Mixing coefficients (alpha, beta, gamma, delta)
    burn_in : int
        Iterations to discard (default 4096)
    """
    
    def __init__(self, seed, salt, params=None, mixing=None, burn_in=4096):
        if isinstance(seed, str):
            seed = seed.encode('utf-8')
        
        if len(salt) < 16:
            raise ValueError("Salt must be at least 16 bytes")
        
        self.seed = seed
        self.salt = salt
        self.burn_in = burn_in
        
        # Step 1: Preprocess seed with HMAC-SHA512
        preseed = hmac.new(salt, seed, hashlib.sha512).digest()
        
        # Step 2: Map to initial conditions
        initial_conditions = self._preseed_to_initial_conditions(preseed)
        
        # Initialize hybrid chaotic map
        self.hcm = HybridChaoticMap(
            params=params,
            mixing=mixing,
            initial_conditions=initial_conditions
        )
        
        self.params = self.hcm.params
        self.mixing = (self.hcm.alpha, self.hcm.beta, self.hcm.gamma, self.hcm.delta)
    
    def _preseed_to_initial_conditions(self, preseed):
        """
        Map preseed bytes to chaotic map initial conditions.
        
        Uses SHA-512 output (64 bytes) to derive initial conditions
        for all maps with good entropy distribution.
        """
        # Split preseed into chunks for each map
        logistic_seed = int.from_bytes(preseed[0:8], 'big')
        henon_seed_x = int.from_bytes(preseed[8:16], 'big')
        henon_seed_y = int.from_bytes(preseed[16:24], 'big')
        lorenz_seed_x = int.from_bytes(preseed[24:32], 'big')
        lorenz_seed_y = int.from_bytes(preseed[32:40], 'big')
        lorenz_seed_z = int.from_bytes(preseed[40:48], 'big')
        sine_seed = int.from_bytes(preseed[48:56], 'big')
        
        # Normalize to (0, 1) for maps that need it
        max_val = 2**64
        
        return {
            'logistic_x0': (logistic_seed / max_val) * 0.8 + 0.1,  # [0.1, 0.9]
            'henon_x0': (henon_seed_x / max_val) * 0.4 - 0.2,  # [-0.2, 0.2]
            'henon_y0': (henon_seed_y / max_val) * 0.4 - 0.2,
            'lorenz_x0': (lorenz_seed_x / max_val) * 20 - 10,  # [-10, 10]
            'lorenz_y0': (lorenz_seed_y / max_val) * 20 - 10,
            'lorenz_z0': (lorenz_seed_z / max_val) * 40 + 5,  # [5, 45]
            'sine_x0': (sine_seed / max_val) * 0.8 + 0.1  # [0.1, 0.9]
        }
    
    def derive_key(self, key_length, info=b"chaos-crypto-key"):
        """
        Derive cryptographic key of specified length.
        
        Parameters:
        -----------
        key_length : int
            Desired key length in bytes
        info : bytes
            Context information for HKDF
        
        Returns:
        --------
        key : bytes
            Derived cryptographic key
        """
        # Generate raw chaotic keystream
        raw_keystream = self.hcm.generate_keystream(
            n_bytes=key_length * 2,  # Generate 2x for HKDF processing
            burn_in=self.burn_in
        )
        
        # Post-process with HKDF for cryptographic strength
        # Extract phase
        prk = hkdf_extract(self.salt, raw_keystream.tobytes(), hash=hashlib.sha256)
        
        # Expand phase
        key = hkdf_expand(prk, info, key_length, hash=hashlib.sha256)
        
        return key
    
    def derive_keystream(self, length, raw=False):
        """
        Derive keystream for stream cipher.
        
        Parameters:
        -----------
        length : int
            Keystream length in bytes
        raw : bool
            If True, return raw chaotic bytes without HKDF post-processing
        
        Returns:
        --------
        keystream : bytes or ndarray
        """
        keystream = self.hcm.generate_keystream(length, burn_in=self.burn_in)
        
        if raw:
            return keystream
        else:
            # HKDF has a limit of 255 * hash_length bytes (8160 for SHA256)
            # For larger streams, use chunked HKDF or raw output
            MAX_HKDF_LENGTH = 255 * 32  # 8160 bytes for SHA256
            
            if length <= MAX_HKDF_LENGTH:
                # Apply HKDF whitening for smaller keystreams
                prk = hkdf_extract(self.salt, keystream.tobytes(), hash=hashlib.sha256)
                return hkdf_expand(prk, b"keystream", length, hash=hashlib.sha256)
            else:
                # For larger keystreams, use chunked approach
                result = bytearray()
                keystream_bytes = keystream.tobytes()
                chunks = (length + MAX_HKDF_LENGTH - 1) // MAX_HKDF_LENGTH
                
                for i in range(chunks):
                    start = i * MAX_HKDF_LENGTH
                    end = min(start + MAX_HKDF_LENGTH, length)
                    chunk_len = end - start
                    
                    # Extract PRK from this chunk
                    chunk = keystream_bytes[start:end]
                    prk = hkdf_extract(self.salt, chunk, hash=hashlib.sha256)
                    
                    # Expand to required length
                    expanded = hkdf_expand(prk, b"keystream", chunk_len, hash=hashlib.sha256)
                    result.extend(expanded)
                
                return bytes(result)
    
    def reset(self):
        """Reset chaotic maps to initial state"""
        self.hcm.reset()


def test_ckdf():
    """Test CKDF determinism and sensitivity"""
    print("Testing Chaotic KDF...")
    
    seed = "my_super_secret_password"
    salt = b"random_salt_16++"
    
    # Test 1: Determinism
    ckdf1 = ChaoticKDF(seed, salt)
    key1 = ckdf1.derive_key(32)
    
    ckdf2 = ChaoticKDF(seed, salt)
    key2 = ckdf2.derive_key(32)
    
    assert key1 == key2, "CKDF not deterministic!"
    print("✓ Determinism test passed")
    
    # Test 2: Sensitivity
    seed_modified = "my_super_secret_passwore"  # One char different
    ckdf3 = ChaoticKDF(seed_modified, salt)
    key3 = ckdf3.derive_key(32)
    
    # Hamming distance
    hamming = sum(b1 != b2 for b1, b2 in zip(key1, key3))
    print(f"✓ Seed sensitivity: {hamming}/32 bytes differ ({hamming/32*100:.1f}%)")
    
    # Test 3: Key length
    key_128 = ckdf1.derive_key(16)
    key_256 = ckdf1.derive_key(32)
    assert len(key_128) == 16
    assert len(key_256) == 32
    print("✓ Key length test passed")
    
    print("\nCKDF tests completed successfully!")


if __name__ == "__main__":
    test_ckdf()
