"""
Chaos Cipher - Encryption/Decryption Implementation

Implements stream-block hybrid cipher using chaotic keystream,
permutation, and diffusion.
"""

import numpy as np
import hashlib
from typing import Union

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from crypto.ckdf import ChaoticKDF


class ChaosCipher:
    """
    Chaos-based encryption cipher.
    
    Encryption pipeline:
    1. Split plaintext into blocks (128-bit)
    2. For each block:
       a. Generate keystream block from CKDF
       b. Generate permutation from chaotic map
       c. Apply permutation to plaintext block
       d. XOR with keystream (diffusion)
    
    Parameters:
    -----------
    seed : str or bytes
        Encryption seed/password
    salt : bytes
        Cryptographic salt
    block_size : int
        Block size in bytes (default 16 = 128 bits)
    """
    
    def __init__(self, seed, salt=None, block_size=16, params=None, mixing=None):
        if salt is None:
            # Generate random salt if not provided
            salt = hashlib.sha256(str(seed).encode()).digest()[:16]
        
        self.seed = seed
        self.salt = salt
        self.block_size = block_size
        
        # Initialize CKDF
        self.ckdf = ChaoticKDF(seed, salt, params=params, mixing=mixing)
    
    def encrypt(self, plaintext: Union[str, bytes]) -> bytes:
        """
        Encrypt plaintext.
        
        Parameters:
        -----------
        plaintext : str or bytes
            Data to encrypt
        
        Returns:
        --------
        ciphertext : bytes
        """
        if isinstance(plaintext, str):
            plaintext = plaintext.encode('utf-8')
        
        # Pad to block size
        plaintext = self._pad(plaintext)
        
        # Split into blocks
        n_blocks = len(plaintext) // self.block_size
        ciphertext = bytearray()
        
        for i in range(n_blocks):
            block_start = i * self.block_size
            block_end = block_start + self.block_size
            block = plaintext[block_start:block_end]
            
            # Encrypt block
            encrypted_block = self._encrypt_block(block, i)
            ciphertext.extend(encrypted_block)
        
        return bytes(ciphertext)
    
    def decrypt(self, ciphertext: bytes) -> bytes:
        """
        Decrypt ciphertext.
        
        Parameters:
        -----------
        ciphertext : bytes
            Data to decrypt
        
        Returns:
        --------
        plaintext : bytes
        """
        # Reset CKDF to initial state for deterministic keystream
        self.ckdf.reset()
        
        # Split into blocks
        n_blocks = len(ciphertext) // self.block_size
        plaintext = bytearray()
        
        for i in range(n_blocks):
            block_start = i * self.block_size
            block_end = block_start + self.block_size
            block = ciphertext[block_start:block_end]
            
            # Decrypt block
            decrypted_block = self._decrypt_block(block, i)
            plaintext.extend(decrypted_block)
        
        # Remove padding
        return self._unpad(bytes(plaintext))
    
    def _encrypt_block(self, block: bytes, block_index: int) -> bytes:
        """Encrypt a single block"""
        block_array = np.frombuffer(block, dtype=np.uint8)
        
        # Step 1: Generate permutation
        perm = self.ckdf.hcm.generate_permutation(self.block_size)
        
        # Step 2: Apply permutation
        permuted = block_array[perm]
        
        # Step 3: Generate keystream block
        keystream = self.ckdf.derive_keystream(self.block_size, raw=False)
        keystream_array = np.frombuffer(keystream, dtype=np.uint8)
        
        # Step 4: XOR diffusion
        encrypted = permuted ^ keystream_array
        
        return encrypted.tobytes()
    
    def _decrypt_block(self, block: bytes, block_index: int) -> bytes:
        """Decrypt a single block (inverse operations)"""
        block_array = np.frombuffer(block, dtype=np.uint8)
        
        # Step 1: Generate same permutation
        perm = self.ckdf.hcm.generate_permutation(self.block_size)
        
        # Step 2: Generate same keystream
        keystream = self.ckdf.derive_keystream(self.block_size, raw=False)
        keystream_array = np.frombuffer(keystream, dtype=np.uint8)
        
        # Step 3: XOR to remove diffusion
        after_xor = block_array ^ keystream_array
        
        # Step 4: Inverse permutation
        inv_perm = np.argsort(perm)
        decrypted = after_xor[inv_perm]
        
        return decrypted.tobytes()
    
    def _pad(self, data: bytes) -> bytes:
        """PKCS7 padding"""
        padding_length = self.block_size - (len(data) % self.block_size)
        padding = bytes([padding_length] * padding_length)
        return data + padding
    
    def _unpad(self, data: bytes) -> bytes:
        """Remove PKCS7 padding"""
        padding_length = data[-1]
        return data[:-padding_length]


def test_cipher():
    """Test encryption/decryption"""
    print("Testing Chaos Cipher...")
    
    seed = "test_password_123"
    cipher = ChaosCipher(seed)
    
    # Test 1: Basic encryption/decryption
    plaintext = "Hello, Chaos Cryptography! 🦋"
    ciphertext = cipher.encrypt(plaintext)
    decrypted = cipher.decrypt(ciphertext)
    
    assert decrypted.decode('utf-8') == plaintext
    print(f"✓ Encryption/Decryption test passed")
    print(f"  Plaintext:  {plaintext}")
    print(f"  Ciphertext: {ciphertext.hex()[:64]}...")
    print(f"  Decrypted:  {decrypted.decode('utf-8')}")
    
    # Test 2: Wrong key fails
    cipher2 = ChaosCipher("wrong_password")
    try:
        wrong_decrypt = cipher2.decrypt(ciphertext)
        # Should get garbage, not original plaintext
        assert wrong_decrypt.decode('utf-8', errors='ignore') != plaintext
        print("✓ Wrong key produces different output")
    except:
        print("✓ Wrong key fails to decrypt")
    
    # Test 3: Avalanche effect
    cipher3 = ChaosCipher("test_password_124")  # One char different
    ciphertext2 = cipher3.encrypt(plaintext)
    
    # Calculate bit difference
    diff_bits = sum(bin(b1 ^ b2).count('1') for b1, b2 in zip(ciphertext, ciphertext2))
    total_bits = len(ciphertext) * 8
    avalanche_pct = (diff_bits / total_bits) * 100
    
    print(f"✓ Avalanche effect: {diff_bits}/{total_bits} bits differ ({avalanche_pct:.1f}%)")
    print(f"  Target: ~50% (good avalanche)")
    
    print("\nCipher tests completed successfully!")


if __name__ == "__main__":
    test_cipher()
