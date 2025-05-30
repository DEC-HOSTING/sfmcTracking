"""
API Blueprint for TaskMaster Application
Handles tasks, categories, chat, and other API endpoints
"""

from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
import json
import logging
import traceback
from datetime import datetime
from app import db
from app.models.user import User
from app.models.category import Category
from app.models.task import Task
from app.models.message import Message
from app.services.ai_service import AIService

logger = logging.getLogger(__name__)

# Create blueprint
api_bp = Blueprint('api', __name__, url_prefix='/api')


# Chat Endpoints
@api_bp.route('/chat', methods=['POST'])
@login_required
def chat():
    """Handle chat messages with AI assistance"""
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({
                "success": False,
                "message": "Invalid request. Message is required."
            }), 400
        
        user_message = data['message'].strip()
        if not user_message:
            return jsonify({
                "success": False,
                "message": "Message cannot be empty."
            }), 400
        
        # Save user message
        user_msg = Message(
            user_id=current_user.id,
            role='user',
            content=user_message
        )
        db.session.add(user_msg)
          # Prepare messages for AI
        recent_messages = Message.query.filter_by(user_id=current_user.id)\
                                     .order_by(Message.timestamp.desc())\
                                     .limit(10).all()
        
        messages = []
        
        # Add system prompt
        messages.append({
            "role": "system",
            "content": """You are TaskMaster AI, a helpful assistant for task and productivity management. 
            You help users organize their tasks, provide productivity advice, and assist with planning.
            Be friendly, concise, and focused on helping users be more productive.
            When users ask for task creation, provide specific, actionable suggestions."""
        })
        
        # Add conversation history (reverse order for chronological)
        for msg in reversed(recent_messages):
            messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # Add current message
        messages.append({
            "role": "user",
            "content": user_message
        })
        
        # Get AI response
        ai_response = AIService.chat_completion(messages)
        
        if ai_response["success"]:
            # Save AI response
            ai_msg = Message(
                user_id=current_user.id,
                role='assistant',
                content=ai_response["message"]
            )
            db.session.add(ai_msg)
            
            created_tasks = []
            created_categories = []
            
            # Check if user wants task generation
            if data.get('generate_tasks', False):
                task_response = AIService.generate_tasks(user_message)
                if task_response["success"]:
                    try:
                        task_data = json.loads(task_response["message"])
                        # create_tasks_from_ai will now let exceptions propagate
                        created_tasks, created_categories = create_tasks_from_ai(task_data)
                    except json.JSONDecodeError as e: # Catch only JSON parsing errors here
                        logger.warning(f"Failed to parse task generation JSON: {e}")
            
            db.session.commit()
            
            return jsonify({
                "success": True,
                "message": ai_response["message"],
                "created_tasks": [task.to_dict() for task in created_tasks],
                "created_categories": [cat.to_dict() for cat in created_categories]
            })
        else:
            db.session.rollback()
            return jsonify({
                "success": False,
                "message": ai_response.get("message", "I'm experiencing technical difficulties. Please try again later.")
            }), 500
            
    except Exception as e:
        db.session.rollback()
        logger.error(f"Chat endpoint error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "message": "I apologize, but I'm experiencing technical difficulties. Please try again later."
        }), 500


def create_tasks_from_ai(task_data):
    """Create tasks and categories from AI-generated data"""
    created_categories = []
    created_tasks = []
    
    # Removed top-level try-except block to let exceptions propagate
    # Create categories first
    if 'categories' in task_data:
        for cat_data in task_data['categories']:
            existing_cat = Category.query.filter_by(
                name=cat_data['name'], 
                user_id=current_user.id
            ).first()
            
            if not existing_cat:
                new_category = Category(
                    name=cat_data['name'],
                    color=cat_data.get('color', '#000000'),
                    user_id=current_user.id
                )
                db.session.add(new_category)
                db.session.flush()  # Get ID
                created_categories.append(new_category)
    
    # Create tasks
    if 'tasks' in task_data:
        for task_data_item in task_data['tasks']:
            # Find category
            category = None
            if 'category_name' in task_data_item:
                category = Category.query.filter_by(
                    name=task_data_item['category_name'],
                    user_id=current_user.id
                ).first()
            
            new_task = Task(
                title=task_data_item['title'],
                description=task_data_item.get('description', ''),
                priority=task_data_item.get('priority', 'medium'),
                category_id=category.id if category else None,
                user_id=current_user.id
            )
            db.session.add(new_task)
            created_tasks.append(new_task)
    
    return created_tasks, created_categories
    # Removed the original try-except block that would catch all exceptions,
    # log them, and return [], []. Now, database errors will propagate.

# Task Endpoints
@api_bp.route('/tasks', methods=['GET'])
@login_required
def get_tasks():
    """Get all tasks for the current user"""
    try:
        tasks = Task.query.filter_by(user_id=current_user.id).all()
        return jsonify({
            "success": True,
            "tasks": [task.to_dict() for task in tasks]
        })
    except Exception as e:
        logger.error(f"Get tasks error: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Failed to load tasks"
        }), 500


@api_bp.route('/tasks', methods=['POST'])
@login_required
def create_task():
    """Create a new task"""
    try:
        data = request.get_json()
        if not data or 'title' not in data:
            return jsonify({
                "success": False,
                "message": "Task title is required"
            }), 400
        
        task = Task(
            title=data['title'],
            description=data.get('description', ''),
            priority=data.get('priority', 'medium'),
            category_id=data.get('category_id'),
            user_id=current_user.id
        )
        
        db.session.add(task)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "task": task.to_dict(),
            "message": "Task created successfully"
        })
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Create task error: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Failed to create task"
        }), 500


@api_bp.route('/tasks/<int:task_id>', methods=['PUT'])
@login_required
def update_task(task_id):
    """Update a task"""
    try:
        task = Task.query.filter_by(id=task_id, user_id=current_user.id).first()
        if not task:
            return jsonify({
                "success": False,
                "message": "Task not found"
            }), 404
        
        data = request.get_json()
        
        # Update fields if provided
        if 'title' in data:
            task.title = data['title']
        if 'description' in data:
            task.description = data['description']
        if 'priority' in data:
            task.priority = data['priority']
        if 'category_id' in data:
            task.category_id = data['category_id']
        if 'done' in data:
            task.done = data['done']
            if data['done']:
                task.completed_at = datetime.utcnow()
            else:
                task.completed_at = None
        
        task.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            "success": True,
            "task": task.to_dict(),
            "message": "Task updated successfully"
        })
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Update task error: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Failed to update task"
        }), 500


@api_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
@login_required
def delete_task(task_id):
    """Delete a task"""
    try:
        task = Task.query.filter_by(id=task_id, user_id=current_user.id).first()
        if not task:
            return jsonify({
                "success": False,
                "message": "Task not found"
            }), 404
        
        db.session.delete(task)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Task deleted successfully"
        })
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Delete task error: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Failed to delete task"
        }), 500


# Category Endpoints
@api_bp.route('/categories', methods=['GET'])
@login_required
def get_categories():
    """Get all categories for the current user"""
    try:
        categories = Category.query.filter_by(user_id=current_user.id).all()
        
        # Add task counts
        categories_with_counts = []
        for category in categories:
            cat_dict = category.to_dict()
            cat_dict['task_count'] = Task.query.filter_by(category_id=category.id).count()
            cat_dict['completed_count'] = Task.query.filter_by(category_id=category.id, done=True).count()
            categories_with_counts.append(cat_dict)
        
        return jsonify({
            "success": True,
            "categories": categories_with_counts
        })
    except Exception as e:
        logger.error(f"Get categories error: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Failed to load categories"
        }), 500


@api_bp.route('/categories', methods=['POST'])
@login_required
def create_category():
    """Create a new category"""
    try:
        data = request.get_json()
        if not data or 'name' not in data:
            return jsonify({
                "success": False,
                "message": "Category name is required"
            }), 400
        
        # Check if category already exists
        existing = Category.query.filter_by(name=data['name'], user_id=current_user.id).first()
        if existing:
            return jsonify({
                "success": False,
                "message": "Category already exists"
            }), 409
        
        category = Category(
            name=data['name'],
            color=data.get('color', '#000000'),
            user_id=current_user.id
        )
        
        db.session.add(category)
        db.session.commit()
        
        cat_dict = category.to_dict()
        cat_dict['task_count'] = 0
        cat_dict['completed_count'] = 0
        
        return jsonify({
            "success": True,
            "category": cat_dict,
            "message": "Category created successfully"
        })
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Create category error: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Failed to create category"
        }), 500
