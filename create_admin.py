#!/usr/bin/env python3
"""
Simple user creation script
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app import create_app, db
    from app.models.user import User
    from app.models.category import Category
    
    print("🔧 Creating admin user...")
      app = create_app()
    with app.app_context():
        # Get credentials from environment
        admin_email = os.getenv('ADMIN_EMAIL', 'admin@taskmaster.com')
        admin_password = os.getenv('ADMIN_PASSWORD', 'admin123')
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=admin_email).first()
        if existing_user:
            print("👤 Admin user already exists, updating password...")
            existing_user.set_password('admin123')
            db.session.commit()
            print("✅ Password updated!")
        else:
            print("👤 Creating new admin user...")
            admin_user = User(email='admin@taskmaster.com')
            admin_user.set_password('admin123')
            db.session.add(admin_user)
            db.session.commit()
            print("✅ Admin user created!")
        
        # Verify the user
        user = User.query.filter_by(email='admin@taskmaster.com').first()
        if user and user.check_password('admin123'):
            print("✅ Login test successful!")
            print(f"📧 Email: {user.email}")
            print("🔑 Password: admin123")
        else:
            print("❌ Login test failed!")
            
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
