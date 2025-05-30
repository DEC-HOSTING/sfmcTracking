import os
import sys
import shutil

def reset_database():
    try:
        print("🔄 Starting database reset...")
        
        # Remove old database files
        for db_path in ['instance/taskmaster.db', 'taskmaster.db']:
            if os.path.exists(db_path):
                os.remove(db_path)
                print(f"✓ Removed {db_path}")
        
        # Remove migrations if they exist
        if os.path.exists('migrations'):
            shutil.rmtree('migrations')
            print("✓ Removed migrations folder")
        
        # Import after cleanup to avoid conflicts
        from app import create_app, db
        from app.models import User, Category, Task
        
        # Create new database
        app = create_app()
        with app.app_context():
            print("🔨 Creating database tables...")
            db.create_all()
            print("✓ Database tables created")
            
            # Create admin user
            print("👤 Creating admin user...")
            admin_user = User(email='admin@taskmaster.com')
            admin_user.set_password('admin123')
            db.session.add(admin_user)
            db.session.flush()  # Get the ID
            print(f"✓ Admin user created with ID: {admin_user.id}")
            
            # Create categories
            print("📁 Creating categories...")
            work_cat = Category(name='Work', color='#FF6B6B', user=admin_user)
            personal_cat = Category(name='Personal', color='#4ECDC4', user=admin_user)
            db.session.add_all([work_cat, personal_cat])
            db.session.flush()
            print(f"✓ Created categories: {work_cat.name}, {personal_cat.name}")
            
            # Create sample tasks
            print("📝 Creating sample task...")
            task1 = Task(title='Test Task', description='Sample task', priority='medium', user=admin_user, category=work_cat)
            db.session.add(task1)
            
            # Commit all changes
            db.session.commit()
            print("✓ All data committed to database")
            
            # Verify user creation
            user_check = User.query.filter_by(email='admin@taskmaster.com').first()
            if user_check:
                print(f"✅ User verification successful: {user_check.email}")
                print(f"✅ Password hash exists: {bool(user_check.password_hash)}")
            else:
                print("❌ User verification failed!")
                return False
            
            print("\n🎉 Database reset complete!")
            print("📋 Login credentials:")
            print("   Email: admin@taskmaster.com")
            print("   Password: admin123")
            return True
            
    except Exception as e:
        print(f"❌ Error during database reset: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = reset_database()
    if not success:
        sys.exit(1)
