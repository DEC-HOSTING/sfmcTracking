#!/usr/bin/env python3
"""
Database initialization script for TaskMaster
Sets up database tables and creates admin user
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

def init_database():
    """Initialize database with tables and sample data"""
    try:
        from app import create_app
        from app.models import db, User, Category, Task
        
        print("Creating Flask application...")
        app = create_app()
        
        with app.app_context():
            print("Creating database tables...")
            db.create_all()              # Check if admin user exists
            admin_email = os.getenv('ADMIN_EMAIL', 'admin@taskmaster.com')
            admin_password = os.getenv('ADMIN_PASSWORD', 'admin123')
            admin_user = User.query.filter_by(email=admin_email).first()
            if not admin_user:
                print("Creating admin user...")
                admin_user = User(
                    email=admin_email
                )
                admin_user.set_password(admin_password)
                db.session.add(admin_user)
                
                # Create sample categories
                print("Creating sample categories...")
                categories = [
                    Category(name='Work', color='#333333', user=admin_user),
                    Category(name='Personal', color='#666666', user=admin_user),
                    Category(name='Projects', color='#000000', user=admin_user)
                ]
                
                for category in categories:
                    db.session.add(category)
                
                db.session.commit()
                
                # Create sample tasks
                print("Creating sample tasks...")
                work_category = categories[0]
                personal_category = categories[1]
                
                tasks = [
                    Task(
                        title='Review quarterly reports',
                        description='Analyze Q4 performance metrics and prepare summary',
                        priority='high',
                        user=admin_user,
                        category=work_category
                    ),
                    Task(
                        title='Team meeting preparation',
                        description='Prepare agenda and materials for Monday team meeting',
                        priority='medium',
                        user=admin_user,
                        category=work_category
                    ),
                    Task(
                        title='Update project documentation',
                        description='Document recent changes and update API specifications',
                        priority='medium',
                        user=admin_user,
                        category=work_category
                    ),
                    Task(
                        title='Plan weekend activities',
                        description='Research local events and make weekend plans',
                        priority='low',
                        user=admin_user,
                        category=personal_category
                    )
                ]
                
                for task in tasks:
                    db.session.add(task)
                
                db.session.commit()
                print("Sample data created successfully!")
            else:
                print("Admin user already exists, skipping sample data creation")
              print("Database initialization complete!")
            print("\nLogin credentials:")
            print(f"Email: {admin_email}")
            print("Password: [Check .env file]")
            
    except Exception as e:
        print(f"Database initialization failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == '__main__':
    success = init_database()
    if success:
        print("\n✅ Database ready!")
    else:
        print("\n❌ Database initialization failed!")
        sys.exit(1)
