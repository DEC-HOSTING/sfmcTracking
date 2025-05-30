#!/usr/bin/env python3
"""
Debug script to test the Flask app
"""

import os
import sys

print("=== Flask App Debug ===")
print(f"Python version: {sys.version}")
print(f"Current directory: {os.getcwd()}")
print(f"Python path: {sys.path}")

print("\n=== Testing imports ===")
try:
    from dotenv import load_dotenv
    load_dotenv()
    print("✓ dotenv loaded")
except Exception as e:
    print(f"✗ dotenv error: {e}")

print("\n=== Environment variables ===")
print(f"FLASK_ENV: {os.getenv('FLASK_ENV', 'Not set')}")
print(f"PORT: {os.getenv('PORT', 'Not set')}")
print(f"OPENAI_API_KEY: {'Set' if os.getenv('OPENAI_API_KEY') else 'Not set'}")

print("\n=== Testing Flask app import ===")
try:
    import app
    print("✓ App module imported successfully")
    print(f"✓ Flask app object exists: {hasattr(app, 'app')}")
    if hasattr(app, 'app'):
        print(f"✓ Flask app type: {type(app.app)}")
        print(f"✓ Flask app routes: {list(app.app.url_map.iter_rules())}")
    else:
        print("✗ No 'app' attribute in module")
        print(f"Available attributes: {[attr for attr in dir(app) if not attr.startswith('_')]}")
except Exception as e:
    print(f"✗ App import error: {e}")
    import traceback
    traceback.print_exc()

print("\n=== Testing direct Flask app run ===")
try:
    from flask import Flask
    debug_app = Flask(__name__)
    
    @debug_app.route('/debug')
    def debug_route():
        return {"status": "debug_ok"}
    
    print("✓ Debug Flask app created")
    print("Starting debug server on port 5002...")
    debug_app.run(host='0.0.0.0', port=5002, debug=False, use_reloader=False)
    
except Exception as e:
    print(f"✗ Debug Flask app error: {e}")
    import traceback
    traceback.print_exc()
