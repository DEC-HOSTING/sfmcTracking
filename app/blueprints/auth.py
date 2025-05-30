"""
Authentication Blueprint - Login, Logout, Registration
"""

from flask import Blueprint, request, jsonify, session, redirect, url_for
from flask_login import login_user, logout_user, login_required, current_user
from app import db
from app.models.user import User
from app.models.category import Category

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Handle user login"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({
                'success': False,
                'message': 'Email and password are required'
            }), 400
        
        # Find user by email
        user = User.query.filter_by(email=email).first()
        
        if user and user.check_password(password) and user.is_active:
            login_user(user, remember=True)
            
            return jsonify({
                'success': True,
                'message': 'Login successful',
                'user': user.to_dict(),
                'redirect': '/dashboard'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Invalid email or password'
            }), 401
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Login failed. Please try again.'
        }), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    """Handle user registration"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({
                'success': False,
                'message': 'Email and password are required'
            }), 400
        
        if len(password) < 6:
            return jsonify({
                'success': False,
                'message': 'Password must be at least 6 characters long'
            }), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({
                'success': False,
                'message': 'User already exists with this email'
            }), 409
        
        # Create new user
        new_user = User(email=email)
        new_user.set_password(password)
        
        db.session.add(new_user)
        db.session.commit()
        
        # Create default category
        default_category = Category(name='General', user_id=new_user.id, color='#000000')
        db.session.add(default_category)
        db.session.commit()
        
        # Log in the new user
        login_user(new_user, remember=True)
        
        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'user': new_user.to_dict(),
            'redirect': '/dashboard'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Registration failed. Please try again.'
        }), 500

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    """Handle user logout"""
    logout_user()
    return jsonify({
        'success': True,
        'message': 'Logged out successfully',
        'redirect': '/'
    })

@auth_bp.route('/check', methods=['GET'])
def check_auth():
    """Check if user is authenticated"""
    if current_user.is_authenticated:
        return jsonify({
            'authenticated': True,
            'user': current_user.to_dict()
        })
    else:
        return jsonify({
            'authenticated': False
        })
