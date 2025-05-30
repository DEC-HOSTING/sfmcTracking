"""
Main Blueprint - Dashboard and static pages
"""

from flask import Blueprint, render_template, redirect, url_for
from flask_login import login_required, current_user

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    """Landing page with login"""
    return render_template('index.html')

@main_bp.route('/dashboard')
@login_required
def dashboard():
    """Main dashboard page"""
    return render_template('dashboard.html', user=current_user)

@main_bp.route('/health')
def health_check():
    """Health check endpoint"""
    return {
        'status': 'healthy',
        'service': 'TaskMaster Dashboard',
        'version': '1.0.0'
    }
