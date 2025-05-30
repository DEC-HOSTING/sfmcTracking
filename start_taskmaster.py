#!/usr/bin/env python3
"""
Simple TaskMaster Flask Application Runner
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def main():
    """Main application entry point"""
    try:
        print("🚀 Starting TaskMaster Application...")
        
        from app import create_app
        print("✅ App imported successfully")
        
        app = create_app()
        print("✅ App created successfully")
        
        # Get configuration from environment
        host = os.getenv('HOST', '127.0.0.1')
        port = int(os.getenv('PORT', 5000))
        debug_mode = os.getenv('FLASK_ENV') == 'development'
        
        print(f"🌐 Starting server on http://{host}:{port}")
        print(f"🔧 Debug mode: {debug_mode}")
        print("📱 Open your browser and go to the URL above")
        print("🛑 Press Ctrl+C to stop the server")
        print("-" * 50)
        
        app.run(
            host=host,
            port=port,
            debug=debug_mode,
            threaded=True
        )
        
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Failed to start application: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
