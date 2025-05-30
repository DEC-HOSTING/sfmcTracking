#!/usr/bin/env python3
"""
Direct database user creation
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.user import User
from werkzeug.security import generate_password_hash

app = create_app()
with app.app_context():
    # Clear any existing users first
    print("🧹 Clearing existing users...")
    User.query.delete()
    db.session.commit()
    
    # Create admin user manually
    print("👤 Creating admin user...")
    admin_user = User()
    admin_user.email = 'admin@taskmaster.com'
    admin_user.password_hash = generate_password_hash('admin123')
    admin_user.is_active = True
    
    db.session.add(admin_user)
    db.session.commit()
    
    # Verify
    user = User.query.filter_by(email='admin@taskmaster.com').first()
    if user:
        print(f"✅ User created: {user.email}")
        print(f"✅ Password check: {user.check_password('admin123')}")
        print("✅ Ready to login!")
    else:
        print("❌ User creation failed")
