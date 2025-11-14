"""
Flask REST API for Butterfly

Endpoints:
- POST /api/derive_key - Derive cryptographic key
- POST /api/encrypt - Encrypt plaintext
- POST /api/decrypt - Decrypt ciphertext
- GET  /api/metrics/entropy - Entropy analysis
- GET  /api/metrics/lyapunov - Lyapunov exponent
- POST /api/metrics/avalanche - Avalanche effect test
- POST /api/metrics/statistical - Statistical test suite
- GET  /api/attractor - Lorenz attractor data
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import numpy as np
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from crypto.ckdf import ChaoticKDF
from crypto.cipher import ButterflyCipher
from chaos.hybrid_map import HybridChaoticMap
from metrics.lyapunov import compute_lyapunov_logistic, compute_lyapunov_henon, compute_lyapunov_lorenz
from metrics.entropy import shannon_entropy_bytes
from metrics.avalanche import avalanche_test
from metrics.statistical_tests import statistical_test_suite

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Default parameters (safe chaotic regime)
DEFAULT_PARAMS = {
    'logistic_r': 3.99,
    'henon_a': 1.4,
    'henon_b': 0.3,
    'lorenz_sigma': 10.0,
    'lorenz_rho': 28.0,
    'lorenz_beta': 8.0/3.0,
    'sine_mu': 0.99
}

DEFAULT_MIXING = (0.25, 0.25, 0.25, 0.25)


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Butterfly API',
        'version': '0.1.0'
    })


@app.route('/api/derive_key', methods=['POST'])
def derive_key():
    """
    Derive cryptographic key via CKDF.
    
    Request body:
    {
        "seed": "string",
        "salt": "base64",  # optional
        "key_length": 32,
        "params": {...},   # optional
        "mixing": [...]    # optional
    }
    """
    try:
        data = request.get_json()
        
        seed = data.get('seed')
        if not seed:
            return jsonify({'error': 'Seed is required'}), 400
        
        # Parse salt
        salt_b64 = data.get('salt')
        if salt_b64:
            salt = base64.b64decode(salt_b64)
        else:
            # Generate salt from seed hash
            import hashlib
            salt = hashlib.sha256(seed.encode()).digest()[:16]
        
        key_length = data.get('key_length', 32)
        params = data.get('params', DEFAULT_PARAMS)
        mixing = tuple(data.get('mixing', DEFAULT_MIXING))
        
        # Derive key
        ckdf = ChaoticKDF(seed, salt, params=params, mixing=mixing)
        key = ckdf.derive_key(key_length)
        
        return jsonify({
            'key': base64.b64encode(key).decode('utf-8'),
            'key_length': len(key),
            'params_used': params,
            'mixing_used': mixing
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/encrypt', methods=['POST'])
def encrypt():
    """
    Encrypt plaintext.
    
    Request body:
    {
        "plaintext": "string or base64",
        "seed": "string",
        "params": {...},  # optional
        "mode": "text" or "binary"
    }
    """
    try:
        data = request.get_json()
        
        plaintext = data.get('plaintext')
        seed = data.get('seed')
        mode = data.get('mode', 'text')
        user_params = data.get('params', {})
        mixing = data.get('mixing')
        
        # Merge user params with defaults
        params = DEFAULT_PARAMS.copy()
        params.update(user_params)
        
        if not plaintext or not seed:
            return jsonify({'error': 'plaintext and seed required'}), 400
        
        # Parse plaintext
        if mode == 'binary':
            plaintext = base64.b64decode(plaintext)
        else:
            plaintext = plaintext.encode('utf-8')
        
        # Encrypt
        cipher = ButterflyCipher(seed, params=params, mixing=tuple(mixing) if mixing else None)
        ciphertext = cipher.encrypt(plaintext)
        
        # Compute keystream hash for verification
        import hashlib
        keystream_sample = cipher.ckdf.derive_keystream(32, raw=True)
        keystream_hash = hashlib.sha256(keystream_sample.tobytes()).hexdigest()
        
        return jsonify({
            'ciphertext': base64.b64encode(ciphertext).decode('utf-8'),
            'ciphertext_length': len(ciphertext),
            'keystream_hash': keystream_hash,
            'params_used': cipher.ckdf.params
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/decrypt', methods=['POST'])
def decrypt():
    """
    Decrypt ciphertext.
    
    Request body:
    {
        "ciphertext": "base64",
        "seed": "string",
        "params": {...},  # optional
        "mode": "text" or "binary"
    }
    """
    try:
        data = request.get_json()
        
        ciphertext_b64 = data.get('ciphertext')
        seed = data.get('seed')
        mode = data.get('mode', 'text')
        user_params = data.get('params', {})
        mixing = data.get('mixing')
        
        # Merge user params with defaults
        params = DEFAULT_PARAMS.copy()
        params.update(user_params)
        
        if not ciphertext_b64 or not seed:
            return jsonify({'error': 'ciphertext and seed required'}), 400
        
        # Decode ciphertext
        ciphertext = base64.b64decode(ciphertext_b64)
        
        # Decrypt
        cipher = ButterflyCipher(seed, params=params, mixing=tuple(mixing) if mixing else None)
        plaintext = cipher.decrypt(ciphertext)
        
        # Return as text or binary
        if mode == 'text':
            try:
                plaintext_str = plaintext.decode('utf-8')
                return jsonify({
                    'plaintext': plaintext_str,
                    'plaintext_length': len(plaintext)
                })
            except:
                return jsonify({'error': 'Decrypted data is not valid UTF-8'}), 400
        else:
            return jsonify({
                'plaintext': base64.b64encode(plaintext).decode('utf-8'),
                'plaintext_length': len(plaintext)
            })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/metrics/entropy', methods=['POST'])
def compute_entropy():
    """
    Compute Shannon entropy of keystream or data.
    
    Request body:
    {
        "data": "base64",  # optional, or generate from seed
        "seed": "string",  # optional
        "length": 1000     # keystream length if using seed
    }
    """
    try:
        data = request.get_json()
        
        if 'data' in data:
            # Analyze provided data
            byte_data = base64.b64decode(data['data'])
            byte_array = np.frombuffer(byte_data, dtype=np.uint8)
        else:
            # Generate keystream from seed
            seed = data.get('seed', 'default_seed')
            length = data.get('length', 1000)
            
            ckdf = ChaoticKDF(seed, b'entropy_test_salt')
            byte_array = ckdf.derive_keystream(length, raw=False)
            byte_array = np.frombuffer(byte_array, dtype=np.uint8)
        
        # Compute entropy
        entropy = shannon_entropy_bytes(byte_array)
        
        # Block-wise entropy
        block_size = 16
        n_blocks = len(byte_array) // block_size
        block_entropies = []
        for i in range(n_blocks):
            block = byte_array[i*block_size:(i+1)*block_size]
            block_entropies.append(float(shannon_entropy_bytes(block)))
        
        return jsonify({
            'entropy': float(entropy),
            'target': 8.0,
            'quality': 'Excellent' if entropy >= 7.99 else 'Good' if entropy >= 7.9 else 'Poor',
            'sample_size': len(byte_array),
            'block_entropies': block_entropies[:20]  # First 20 blocks
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/metrics/lyapunov', methods=['POST'])
def compute_lyapunov():
    """
    Compute Lyapunov exponents for chaotic maps.
    
    Request body:
    {
        "maps": ["logistic", "henon"],  # which maps to test
        "params": {...}  # optional custom params
    }
    """
    try:
        data = request.get_json()
        
        maps_to_test = data.get('maps', ['logistic', 'henon'])
        params = data.get('params', DEFAULT_PARAMS)
        
        print(f"[LYAPUNOV] Maps: {maps_to_test}, Params: {params}")
        
        results = {}
        
        if 'logistic' in maps_to_test:
            r_param = float(params.get('logistic_r', 3.99))
            print(f"[LYAPUNOV] Computing logistic with r={r_param}")
            lambda_log = compute_lyapunov_logistic(
                r=r_param,
                n_iterations=5000
            )
            results['logistic'] = {
                'lambda': float(lambda_log),
                'chaotic': bool(lambda_log > 0),
                'r': r_param
            }
        
        if 'henon' in maps_to_test:
            a_param = float(params.get('henon_a', 1.4))
            b_param = float(params.get('henon_b', 0.3))
            print(f"[LYAPUNOV] Computing henon with a={a_param}, b={b_param}")
            lambda_hen = compute_lyapunov_henon(
                a=a_param,
                b=b_param,
                n_iterations=5000
            )
            results['henon'] = {
                'lambda': float(lambda_hen),
                'chaotic': bool(lambda_hen > 0),
                'a': a_param,
                'b': b_param
            }
        
        print(f"[LYAPUNOV] Results: {results}")
        return jsonify(results)
    
    except Exception as e:
        print(f"[LYAPUNOV ERROR] {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/metrics/avalanche', methods=['POST'])
def compute_avalanche():
    """
    Test avalanche effect.
    
    Request body:
    {
        "seed": "string",
        "plaintext": "string",
        "n_trials": 50
    }
    """
    try:
        data = request.get_json()
        
        seed = data.get('seed', 'test_seed')
        plaintext = data.get('plaintext', 'Hello, Butterfly! This is a test message for avalanche effect analysis.')
        n_trials = data.get('n_trials', 50)
        
        print(f"[AVALANCHE] Testing with seed={seed}, plaintext_len={len(plaintext)}, trials={n_trials}")
        
        # Create encryption function that uses different cipher instance each time
        def encrypt_func(pt):
            c = ButterflyCipher(seed, params=data.get('params'))
            return c.encrypt(pt)
        
        from metrics.avalanche import avalanche_test
        results = avalanche_test(encrypt_func, plaintext.encode(), n_trials=n_trials)
        
        print(f"[AVALANCHE] Result: {results['mean_flip_percentage']:.2f}% ± {results['std_flip_percentage']:.2f}%")
        
        # Convert numpy types to Python types
        return jsonify({
            'mean_flip_percentage': float(results['mean_flip_percentage']),
            'std_flip_percentage': float(results['std_flip_percentage']),
            'min_flip': int(results['min_flip']),
            'max_flip': int(results['max_flip']),
            'total_bits': int(results['total_bits']),
            'target': results['target'],
            'quality': 'Excellent' if abs(results['mean_flip_percentage'] - 50) < 5 else 'Good' if abs(results['mean_flip_percentage'] - 50) < 10 else 'Poor'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/metrics/statistical', methods=['POST'])
def run_statistical_tests():
    """
    Run statistical test suite.
    
    Request body:
    {
        "seed": "string",  # optional
        "data": "base64",  # optional, or generate from seed
        "length": 10000
    }
    """
    try:
        data = request.get_json()
        
        print(f"[STATISTICAL] Request data: {data}")
        
        if 'data' in data:
            byte_data = base64.b64decode(data['data'])
            byte_array = np.frombuffer(byte_data, dtype=np.uint8)
        else:
            seed = data.get('seed', 'test_seed')
            length = data.get('length', 10000)
            
            print(f"[STATISTICAL] Generating keystream: seed={seed}, length={length}")
            ckdf = ChaoticKDF(seed, b'statistical_test_salt')
            keystream = ckdf.derive_keystream(length, raw=False)
            byte_array = np.frombuffer(keystream, dtype=np.uint8)
        
        print(f"[STATISTICAL] Running tests on {len(byte_array)} bytes")
        # Run test suite
        results = statistical_test_suite(byte_array, verbose=False)
        
        # Convert to JSON-serializable format
        json_results = {}
        for test_name, result in results.items():
            if test_name == 'summary':
                json_results[test_name] = {
                    'total_tests': int(result['total_tests']),
                    'passed': int(result['passed']),
                    'failed': int(result['failed']),
                    'pass_rate': float(result['pass_rate'])
                }
            else:
                json_results[test_name] = {
                    'test_name': result['test_name'],
                    'statistic': float(result['statistic']) if result['statistic'] is not None else None,
                    'p_value': float(result['p_value']),
                    'passed': bool(result['passed']),
                    'description': str(result['description'])
                }
        
        print(f"[STATISTICAL] Success: {json_results.get('summary', {})}")
        return jsonify(json_results)
    
    except Exception as e:
        print(f"[STATISTICAL ERROR] {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/attractor', methods=['POST'])
def get_attractor_data():
    """
    Generate Lorenz attractor trajectory data.
    
    Request body:
    {
        "n_points": 1000,
        "params": {...}  # optional
    }
    """
    try:
        data = request.get_json()
        
        n_points = data.get('n_points', 1000)
        params = data.get('params', DEFAULT_PARAMS)
        mixing = tuple(data.get('mixing', DEFAULT_MIXING))
        
        # Create hybrid map
        hcm = HybridChaoticMap(params=params, mixing=mixing)
        
        # Get attractor data
        trajectory = hcm.get_attractor_data(n_points)
        
        return jsonify({
            'points': trajectory.tolist(),
            'n_points': len(trajectory),
            'params': {
                'sigma': params.get('lorenz_sigma', 10.0),
                'rho': params.get('lorenz_rho', 28.0),
                'beta': params.get('lorenz_beta', 8.0/3.0)
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print("=== Starting Butterfly API Server ===")
    print("Endpoints available:")
    print("  - POST /api/derive_key")
    print("  - POST /api/encrypt")
    print("  - POST /api/decrypt")
    print("  - POST /api/metrics/entropy")
    print("  - POST /api/metrics/lyapunov")
    print("  - POST /api/metrics/avalanche")
    print("  - POST /api/metrics/statistical")
    print("  - POST /api/attractor")
    print("\n>>> Server running on http://localhost:5000 <<<\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
