#!/usr/bin/env python3
"""
Debug script to test API endpoints and identify session management issues
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.user import User
from app.models.category import Category
from app.models.task import Task
import logging

# Setup logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def test_database_connections():
    """Test basic database operations"""
    print("=== Testing Database Connections ===")
    
    app = create_app()
    
    with app.app_context():
        try:
            # Test basic queries
            user_count = User.query.count()
            category_count = Category.query.count()
            task_count = Task.query.count()
            
            print(f"✅ Database connection successful")
            print(f"   Users: {user_count}")
            print(f"   Categories: {category_count}")
            print(f"   Tasks: {task_count}")
            
            # Test session operations
            test_user = User.query.filter_by(email='admin@taskmaster.com').first()
            if test_user:
                print(f"✅ Test user found: {test_user.email}")
                
                # Test user's categories
                user_categories = Category.query.filter_by(user_id=test_user.id).all()
                print(f"   User categories: {len(user_categories)}")
                
                # Test user's tasks
                user_tasks = Task.query.filter_by(user_id=test_user.id).all()
                print(f"   User tasks: {len(user_tasks)}")
                
            else:
                print("❌ Test user not found")
                
        except Exception as e:
            print(f"❌ Database error: {str(e)}")
            import traceback
            traceback.print_exc()

def test_session_isolation():
    """Test database session isolation"""
    print("\n=== Testing Session Isolation ===")
    
    app = create_app()
    
    with app.app_context():
        try:
            # Simulate the chat endpoint session management
            print("Testing session management like chat endpoint...")
            
            # Start a transaction
            from flask_login import login_user
            from app.models.message import Message
            
            # Get test user
            test_user = User.query.filter_by(email='admin@taskmaster.com').first()
            if not test_user:
                print("❌ No test user found")
                return
                
            # Test adding a message (simulating chat)
            test_message = Message(
                user_id=test_user.id,
                role='user',
                content='Test message for session management'
            )
            
            db.session.add(test_message)
            print("✅ Message added to session")
            
            # Test querying while transaction is open
            categories = Category.query.filter_by(user_id=test_user.id).all()
            print(f"✅ Categories queried during transaction: {len(categories)}")
            
            # Commit transaction
            db.session.commit()
            print("✅ Transaction committed successfully")
            
            # Clean up test message
            Message.query.filter_by(content='Test message for session management').delete()
            db.session.commit()
            print("✅ Test message cleaned up")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Session management error: {str(e)}")
            import traceback
            traceback.print_exc()

def test_ai_service():
    """Test AI service timeout handling"""
    print("\n=== Testing AI Service ===")
    
    try:
        from app.services.ai_service import AIService
        
        # Test with a simple message
        test_messages = [
            {"role": "user", "content": "Hello, can you help me create a simple task?"}
        ]
        
        print("Testing AI service with timeout handling...")
        response = AIService.chat_completion(test_messages)
        
        if response["success"]:
            print("✅ AI service responded successfully")
            print(f"   Response: {response['message'][:100]}...")
        else:
            print("⚠️ AI service returned error response")
            print(f"   Error: {response.get('message', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ AI service error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🔍 TaskMaster Debug Tool")
    print("=" * 50)
    
    test_database_connections()
    test_session_isolation()
    test_ai_service()
    
    print("\n" + "=" * 50)
    print("✅ Debug tests completed")
