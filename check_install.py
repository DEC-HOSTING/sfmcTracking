#!/usr/bin/env python3
"""
Simple installation test
"""

import sys
import subprocess

def test_package(package_name):
    try:
        __import__(package_name)
        print(f"✅ {package_name} is installed")
        return True
    except ImportError:
        print(f"❌ {package_name} is NOT installed")
        return False

packages = [
    'flask',
    'flask_login',
    'flask_sqlalchemy',
    'flask_migrate',
    'flask_cors',
    'dotenv',
    'bcrypt',
    'requests'
]

print("Testing package installations:")
all_good = True

for package in packages:
    if not test_package(package):
        all_good = False

if all_good:
    print("\n🎉 All packages are installed correctly!")
    
    # Try to import our app
    try:
        from app import create_app
        app = create_app()
        print("✅ App factory works correctly")
    except Exception as e:
        print(f"❌ App factory failed: {e}")
else:
    print("\n⚠️ Some packages are missing. Try running:")
    print("pip install flask flask-login flask-sqlalchemy flask-migrate flask-cors python-dotenv bcrypt requests")
