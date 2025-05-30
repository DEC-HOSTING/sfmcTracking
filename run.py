#!/usr/bin/env python3
"""
Main entry point for TaskMaster Flask Application
Production-ready runner with proper error handling and configuration
"""

import os
import sys
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the current directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

logger_run_py = logging.getLogger(__name__) # Use this for run.py specific logs

def create_app_wrapper(): # Renamed to avoid confusion with app.create_app
    logger_run_py.info("run.py: Inside create_app_wrapper()")
    try:
        from app import create_app as actual_flask_app_factory
        logger_run_py.info("run.py: Imported actual_flask_app_factory from app package.")
        app_instance = actual_flask_app_factory()
        logger_run_py.info("run.py: actual_flask_app_factory() executed successfully.")
        return app_instance
    except ImportError as e:
        logger_run_py.error(f"run.py: Failed to import app factory from app package: {e}", exc_info=True)
        sys.exit(1)
    except Exception as e:
        logger_run_py.error(f"run.py: Failed to create app via actual_flask_app_factory: {e}", exc_info=True)
        sys.exit(1)

def initialize_database_wrapper(app_instance): # Renamed
    logger_run_py.info("run.py: Inside initialize_database_wrapper()")
    try:
        from flask_migrate import upgrade
        with app_instance.app_context():
            logger_run_py.info("run.py: Attempting database migration (upgrade)...")
            try:
                upgrade()
                logger_run_py.info("run.py: Database migrated successfully via upgrade().")
            except Exception as e_upgrade:
                logger_run_py.warning(f"run.py: Database migration (upgrade) failed: {e_upgrade}. Falling back to db.create_all().", exc_info=True)
                from app.models import db # Ensure db is imported correctly here
                logger_run_py.info("run.py: Attempting db.create_all()...")
                db.create_all()
                logger_run_py.info("run.py: db.create_all() executed.")
        logger_run_py.info("run.py: Database initialization wrapper finished.")
    except Exception as e:
        logger_run_py.error(f"run.py: Database initialization wrapper failed critically: {e}", exc_info=True)
        # Depending on the app's needs, you might want to sys.exit(1) here or allow running with a potentially uninitialized DB

def main():
    """Main application entry point"""
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    logger_run_py.info("run.py: main() started. Basic logging configured.")
    
    logger_run_py.info("run.py: Calling create_app_wrapper()...")
    app = create_app_wrapper()
    logger_run_py.info(f"run.py: create_app_wrapper() returned app: {app}")
    
    if app: # Proceed only if app creation was successful
        logger_run_py.info("run.py: Calling initialize_database_wrapper()...")
        initialize_database_wrapper(app)
        logger_run_py.info("run.py: initialize_database_wrapper() finished.")
        
        # Get configuration from environment
        host = os.getenv('HOST', '0.0.0.0')
        port = int(os.getenv('PORT', 5000))
        debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
        
        logger_run_py.info(f"run.py: Starting Flask app.run() on {host}:{port}, debug={debug_mode}")
        
        try:
            # For initial debugging, let's disable reloader if it's causing issues
            use_reloader_flag = False # Set to False to disable reloader for now
            logger_run_py.info(f"run.py: app.run() called with use_reloader={use_reloader_flag}")
            app.run(
                host=host,
                port=port,
                debug=debug_mode,
                use_reloader=use_reloader_flag, 
                threaded=True
            )
        except KeyboardInterrupt:
            logger_run_py.info("run.py: Application stopped by user (KeyboardInterrupt).")
        except Exception as e:
            logger_run_py.error(f"run.py: Flask app.run() failed: {e}", exc_info=True)
            sys.exit(1)
    else:
        logger_run_py.error("run.py: App creation failed. Exiting.")
        sys.exit(1)

if __name__ == '__main__':
    main()
