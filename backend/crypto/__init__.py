"""
Butterfly - Cryptographic Primitives Module

Implements:
- Chaotic Key Derivation Function (CKDF)
- Encryption/Decryption with hybrid Butterfly
- Cryptographic post-processing (HKDF)
"""

from .ckdf import ChaoticKDF
from .cipher import ButterflyCipher

__all__ = ['ChaoticKDF', 'ButterflyCipher']
