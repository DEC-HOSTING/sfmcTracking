"""
Flask Application Factory for Unified Task Management & AI Chat Dashboard
A modern, avant-garde interface combining secure authentication, task management, and AI chat.
"""

import os
import secrets
from flask import Flask
from flask_cors import CORS
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask extensions
db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()

def create_app(config_name=None):
    """Application factory pattern"""
    app = Flask(__name__)
      # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', secrets.token_hex(16))
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///taskmaster.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['DEBUG'] = True  # Enable debug mode to see detailed errors
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    
    # Configure Flask-Login
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please log in to access the dashboard.'
    login_manager.login_message_category = 'info'
    
    # Enable CORS for development
    CORS(app)
    
    # User loader for Flask-Login
    @login_manager.user_loader
    def load_user(user_id):
        from app.models.user import User
        return User.query.get(int(user_id))
    
    # Register blueprints
    from app.blueprints.auth import auth_bp
    from app.blueprints.api import api_bp
    from app.blueprints.main import main_bp
    
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(main_bp)
    
    return app
