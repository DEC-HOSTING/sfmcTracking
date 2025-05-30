#!/usr/bin/env python3
"""
Minimal Flask app test
"""

print("Starting minimal app test...")

try:
    from flask import Flask, jsonify
    from flask_cors import CORS
    from dotenv import load_dotenv
    import os
    
    print("✓ Imports successful")
    
    # Load environment variables
    load_dotenv()
    print("✓ Environment loaded")
    
    # Initialize Flask app
    app = Flask(__name__)
    print("✓ Flask app created")
    
    # Enable CORS
    CORS(app)
    print("✓ CORS enabled")
    
    @app.route('/health')
    def health():
        return jsonify({"status": "healthy"})
    
    print("✓ Route defined")
    
    if __name__ == '__main__':
        print("✓ Starting server...")
        app.run(host='0.0.0.0', port=5000, debug=True)
        
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
