#!/usr/bin/env python3
"""
API Key Generator untuk Anti-Plagiasi System
Created by devnolife

Generate secure API key untuk authentication antara Next.js dan Python API
"""

import secrets
import string
import hashlib
from datetime import datetime

def generate_api_key(length: int = 64) -> str:
    """
    Generate cryptographically secure API key
    
    Args:
        length: Length of the API key (default: 64)
    
    Returns:
        Secure random API key
    """
    alphabet = string.ascii_letters + string.digits
    api_key = ''.join(secrets.choice(alphabet) for _ in range(length))
    return api_key

def generate_prefixed_api_key(prefix: str = "apk") -> str:
    """
    Generate API key with prefix for easy identification
    
    Args:
        prefix: Prefix for the API key (default: "apk")
    
    Returns:
        Prefixed API key in format: prefix_randomstring
    """
    random_part = generate_api_key(48)
    return f"{prefix}_{random_part}"

def hash_api_key(api_key: str) -> str:
    """
    Hash API key using SHA-256 for secure storage
    
    Args:
        api_key: Plain text API key
    
    Returns:
        SHA-256 hash of the API key
    """
    return hashlib.sha256(api_key.encode()).hexdigest()

if __name__ == "__main__":
    print("╔═══════════════════════════════════════════════════════════════════════╗")
    print("║                    🔐 API KEY GENERATOR 🔐                            ║")
    print("║                  Anti-Plagiasi System                                 ║")
    print("╚═══════════════════════════════════════════════════════════════════════╝")
    print()
    print("⚡ Created by devnolife")
    print()
    
    # Generate API keys
    api_key = generate_prefixed_api_key("apk")
    api_key_hash = hash_api_key(api_key)
    
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print()
    print("🔑 Generated API Key:")
    print(f"   {api_key}")
    print()
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print()
    print("📋 Configuration Instructions:")
    print()
    print("1️⃣  Python Backend (.env):")
    print("   Add this line to your Python backend .env file:")
    print()
    print(f"   API_KEY={api_key}")
    print()
    print("2️⃣  Next.js Frontend (frontend/.env):")
    print("   Add this line to your Next.js frontend .env file:")
    print()
    print(f"   PYTHON_API_KEY={api_key}")
    print()
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print()
    print("⚠️  IMPORTANT SECURITY NOTES:")
    print("   • Keep this API key SECRET and secure")
    print("   • Never commit .env files to version control")
    print("   • Regenerate API key if compromised")
    print("   • Use different API keys for dev/staging/prod environments")
    print()
    print("🔒 API Key Hash (SHA-256):")
    print(f"   {api_key_hash}")
    print()
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print()
    print(f"✅ Generated at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
