"""
Chaos Cryptography - Cryptographic Primitives Module

Implements:
- Chaotic Key Derivation Function (CKDF)
- Encryption/Decryption with hybrid chaos
- Cryptographic post-processing (HKDF)
"""

from .ckdf import ChaoticKDF
from .cipher import ChaosCipher

__all__ = ['ChaoticKDF', 'ChaosCipher']
