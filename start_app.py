#!/usr/bin/env python3
"""
Simple Flask app runner - bypasses terminal issues
"""

import os
import sys

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def main():
    try:
        print("🚀 Starting TaskMaster application...")
        
        # Load environment variables
        from dotenv import load_dotenv
        load_dotenv()
        
        # Import and create app
        from app import create_app
        app = create_app()
        
        print("✅ Application created successfully")
        print("🌐 Starting server on http://localhost:5000")
        print("📋 Use admin@taskmaster.com / admin123 to login")
        print("🛑 Press Ctrl+C to stop")
        
        # Run the app
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=True,
            use_reloader=False  # Disable reloader to avoid issues
        )
        
    except ImportError as e:
        print(f"❌ Missing dependencies: {e}")
        print("📦 Please install requirements: pip install -r requirements.txt")
    except Exception as e:
        print(f"❌ Error starting application: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
