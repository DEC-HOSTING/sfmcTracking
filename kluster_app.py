#!/usr/bin/env python3
"""
Flask Web Application with Kluster AI Mistral-Nemo Integration
Refactored from messy JavaScript to clean, modular Python
"""

from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
import os
import json
import logging
import re
from datetime import datetime
import traceback
from dotenv import load_dotenv
import secrets
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', secrets.token_hex(16))

# Enable CORS for development
CORS(app)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Kluster AI Configuration
KLUSTER_API_KEY = "ddc437e6-6c4c-4649-ade4-34d99fa0cd26"
KLUSTER_BASE_URL = "https://api.kluster.ai/v1"
KLUSTER_MODEL = "mistralai/Mistral-Nemo-Instruct-2407"

# Initialize Kluster AI client
kluster_client = OpenAI(
    api_key=KLUSTER_API_KEY,
    base_url=KLUSTER_BASE_URL
)

logger.info("Kluster AI client initialized successfully")


class ChatService:
    """Handle chat interactions with Kluster AI's Mistral-Nemo model"""
    
    @staticmethod
    def chat_completion(messages):
        """
        Create a chat completion using Kluster AI's Mistral-Nemo model
        
        Args:
            messages (list): List of message objects with 'role' and 'content'
            
        Returns:
            dict: Response from the AI model
        """
        try:
            logger.info(f"Making chat completion request with {len(messages)} messages")
            
            response = kluster_client.chat.completions.create(
                model=KLUSTER_MODEL,
                messages=messages,
                max_completion_tokens=4000,
                temperature=0.1,
                top_p=1
            )
            
            assistant_message = response.choices[0].message.content
            
            logger.info("Chat completion successful")
            return {
                "success": True,
                "message": assistant_message,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens if response.usage else None,
                    "completion_tokens": response.usage.completion_tokens if response.usage else None,
                    "total_tokens": response.usage.total_tokens if response.usage else None
                }
            }
            
        except Exception as e:
            logger.error(f"Chat completion failed: {str(e)}")
            logger.error(traceback.format_exc())
            return {
                "success": False,
                "error": str(e),
                "fallback_message": "I apologize, but I'm experiencing technical difficulties. Please try again later."
            }


class MessageFormatter:
    """Helper functions for formatting and sanitizing messages (refactored from JS)"""
    
    @staticmethod
    def sanitize_input(text):
        """Sanitize user input to prevent issues"""
        if not isinstance(text, str):
            return ""
        
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Remove potentially harmful characters (basic sanitization)
        text = re.sub(r'[<>]', '', text)
        
        # Limit length
        if len(text) > 10000:
            text = text[:10000] + "..."
        
        return text
    
    @staticmethod
    def build_conversation_history(messages):
        """Build conversation history from message list"""
        formatted_messages = []
        
        for msg in messages:
            if isinstance(msg, dict) and 'role' in msg and 'content' in msg:
                formatted_messages.append({
                    "role": msg['role'],
                    "content": MessageFormatter.sanitize_input(msg['content'])
                })
        
        return formatted_messages
    
    @staticmethod
    def format_datetime(timestamp=None):
        """Format datetime for display (Python equivalent of JS date formatting)"""
        if timestamp is None:
            timestamp = datetime.now()
        elif isinstance(timestamp, (int, float)):
            timestamp = datetime.fromtimestamp(timestamp)
        
        return timestamp.strftime("%Y-%m-%d %H:%M:%S")


class ListOrganizer:
    """Utility functions for organizing and restructuring lists (refactored from JS)"""
    
    @staticmethod
    def categorize_items(items):
        """Categorize list items based on keywords and patterns"""
        categories = {
            "urgent": [],
            "important": [],
            "routine": [],
            "misc": []
        }
        
        for item in items:
            if not item.strip():
                continue
                
            item_lower = item.lower()
            
            # Urgent keywords
            if any(keyword in item_lower for keyword in [
                'urgent', 'asap', 'immediately', 'critical', 'emergency', 'deadline'
            ]):
                categories["urgent"].append(item.strip())
            # Important keywords
            elif any(keyword in item_lower for keyword in [
                'important', 'priority', 'must', 'should', 'key', 'essential'
            ]):
                categories["important"].append(item.strip())
            # Routine keywords
            elif any(keyword in item_lower for keyword in [
                'daily', 'weekly', 'monthly', 'regular', 'routine', 'maintenance'
            ]):
                categories["routine"].append(item.strip())
            else:
                categories["misc"].append(item.strip())
        
        return categories
    
    @staticmethod
    def generate_suggestions(categories):
        """Generate helpful suggestions based on categorized items"""
        suggestions = []
        
        if categories["urgent"]:
            suggestions.append(f"You have {len(categories['urgent'])} urgent items that need immediate attention")
        
        if categories["important"]:
            suggestions.append(f"Consider scheduling time for {len(categories['important'])} important tasks")
        
        if categories["routine"]:
            suggestions.append(f"Set up recurring reminders for {len(categories['routine'])} routine tasks")
        
        if not any(categories.values()):
            suggestions.append("No items were categorized. Try providing more specific task descriptions")
        
        return suggestions


class SessionManager:
    """Handle user sessions (refactored from JS session handling)"""
    
    @staticmethod
    def create_session_id():
        """Create a unique session identifier"""
        return secrets.token_hex(16)
    
    @staticmethod
    def get_or_create_session():
        """Get existing session or create new one"""
        if 'session_id' not in session:
            session['session_id'] = SessionManager.create_session_id()
            session['created_at'] = MessageFormatter.format_datetime()
        
        return session['session_id']


# Flask Routes

@app.route('/')
def index():
    """Serve the main application"""
    return render_template('chat.html')


@app.route('/chat', methods=['POST'])
def chat():
    """
    Main chat endpoint for Kluster AI integration
    Accepts JSON payload with messages array and returns AI response
    """
    try:
        # Get session
        session_id = SessionManager.get_or_create_session()
        
        # Parse request
        data = request.get_json()
        if not data or 'messages' not in data:
            return jsonify({
                "error": "Invalid request. Expected JSON with 'messages' array"
            }), 400
        
        # Validate and format messages
        raw_messages = data.get('messages', [])
        if not isinstance(raw_messages, list) or len(raw_messages) == 0:
            return jsonify({
                "error": "Messages must be a non-empty array"
            }), 400
        
        # Build conversation history
        messages = MessageFormatter.build_conversation_history(raw_messages)
        
        # Log request
        logger.info(f"Session {session_id}: Processing chat request with {len(messages)} messages")
        
        # Get AI response
        ai_response = ChatService.chat_completion(messages)
        
        # Log response
        if ai_response["success"]:
            logger.info(f"Session {session_id}: Chat completion successful")
        else:
            logger.error(f"Session {session_id}: Chat completion failed - {ai_response.get('error')}")
        
        # Return response
        return jsonify({
            "success": ai_response["success"],
            "message": ai_response.get("message", ai_response.get("fallback_message")),
            "usage": ai_response.get("usage"),
            "session_id": session_id,
            "timestamp": MessageFormatter.format_datetime()
        })
        
    except Exception as e:
        logger.error(f"Chat endpoint error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": "Internal server error",
            "message": "I apologize, but I'm experiencing technical difficulties. Please try again later."
        }), 500


@app.route('/api/organize', methods=['POST'])
def organize_list():
    """
    Organize a list using AI assistance
    Refactored from JavaScript list organization logic
    """
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({
                "error": "Invalid request. Expected JSON with 'text' field"
            }), 400
        
        text_content = MessageFormatter.sanitize_input(data['text'])
        if not text_content:
            return jsonify({
                "error": "No valid text content provided"
            }), 400
        
        # Split into items
        items = [item.strip() for item in text_content.split('\n') if item.strip()]
        
        # Use AI to organize the list
        messages = [
            {
                "role": "system", 
                "content": "You are a helpful AI assistant specialized in organizing and categorizing lists. Analyze the provided list and organize it into logical categories with priorities. Respond with a JSON object containing categorized items and helpful suggestions."
            },
            {
                "role": "user",
                "content": f"""Please organize this list into categories (urgent, important, routine, misc) and provide suggestions:

{text_content}

Respond with JSON in this format:
{{
    "originalCount": number,
    "categories": {{
        "urgent": [array of urgent items],
        "important": [array of important items],
        "routine": [array of routine items],
        "misc": [array of other items]
    }},
    "suggestions": [array of helpful suggestions]
}}"""
            }
        ]
        
        ai_response = ChatService.chat_completion(messages)
        
        if ai_response["success"]:
            try:
                # Try to parse JSON from AI response
                organized_data = json.loads(ai_response["message"])
            except json.JSONDecodeError:
                # Fallback to manual organization
                logger.warning("AI response not valid JSON, using fallback organization")
                categories = ListOrganizer.categorize_items(items)
                organized_data = {
                    "originalCount": len(items),
                    "categories": categories,
                    "suggestions": ListOrganizer.generate_suggestions(categories)
                }
        else:
            # Fallback to manual organization
            categories = ListOrganizer.categorize_items(items)
            organized_data = {
                "originalCount": len(items),
                "categories": categories,
                "suggestions": ListOrganizer.generate_suggestions(categories)
            }
        
        return jsonify({
            "success": True,
            "data": organized_data,
            "ai_used": ai_response["success"]
        })
        
    except Exception as e:
        logger.error(f"Organize endpoint error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Failed to organize list"
        }), 500


@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    try:
        # Test Kluster AI connectivity
        test_response = kluster_client.chat.completions.create(
            model=KLUSTER_MODEL,
            messages=[{"role": "user", "content": "Hello"}],
            max_completion_tokens=10,
            temperature=0.1
        )
        
        ai_status = "healthy"
    except Exception as e:
        logger.error(f"AI health check failed: {str(e)}")
        ai_status = "unhealthy"
    
    return jsonify({
        "status": "healthy",
        "timestamp": MessageFormatter.format_datetime(),
        "ai_status": ai_status,
        "model": KLUSTER_MODEL,
        "version": "1.0.0"
    })


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({"error": "Internal server error"}), 500


if __name__ == '__main__':
    # Development server
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    logger.info(f"Starting Flask app on port {port}")
    logger.info(f"Kluster AI Model: {KLUSTER_MODEL}")
    logger.info(f"Debug mode: {debug}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
