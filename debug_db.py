#!/usr/bin/env python3
"""
Debug script to check what's happening
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    print("1. Starting imports...")
    from app import create_app, db
    print("2. App imports successful")
    
    from app.models.user import User
    print("3. User model imported")
    
    app = create_app()
    print("4. App created")
    
    with app.app_context():
        print("5. In app context")
        
        # Check database file
        if os.path.exists('instance/taskmaster.db'):
            print("6. Database file exists")
        else:
            print("6. Database file missing!")
        
        # Try to query
        try:
            user_count = User.query.count()
            print(f"7. User count: {user_count}")
        except Exception as e:
            print(f"7. Query error: {e}")
        
        # Try to create tables
        try:
            db.create_all()
            print("8. Tables created/verified")
        except Exception as e:
            print(f"8. Table creation error: {e}")
        
        # Try to create user
        try:
            admin_user = User(email='admin@taskmaster.com')
            admin_user.set_password('admin123')
            db.session.add(admin_user)
            db.session.commit()
            print("9. User created successfully")
        except Exception as e:
            print(f"9. User creation error: {e}")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
