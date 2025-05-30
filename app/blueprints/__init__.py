"""
Blueprints package initialization
"""

from app.blueprints.auth import auth_bp
from app.blueprints.api import api_bp
from app.blueprints.main import main_bp

__all__ = ['auth_bp', 'api_bp', 'main_bp']
