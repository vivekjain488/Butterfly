from setuptools import setup, find_packages

setup(
    name="chaos-crypto",
    version="0.1.0",
    description="Research-grade cryptosystem based on deterministic chaos",
    authors=["Aditi Singh", "Vivek Jain"],
    packages=find_packages(),
    python_requires=">=3.9",
    install_requires=[
        "numpy>=1.24.0",
        "scipy>=1.10.0",
        "numba>=0.57.0",
        "flask>=2.3.0",
        "flask-cors>=4.0.0",
        "cryptography>=41.0.0",
        "hkdf>=0.0.3",
    ],
    extras_require={
        "dev": [
            "pytest>=7.4.0",
            "pytest-cov>=4.1.0",
            "matplotlib>=3.7.0",
        ]
    },
)
