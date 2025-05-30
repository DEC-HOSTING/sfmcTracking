"""
Chat Blueprint for Kluster AI Flask Application
Handles all chat-related endpoints
"""

from flask import Blueprint, request, jsonify, session
import logging
from kluster_app import ChatService, MessageFormatter, SessionManager

logger = logging.getLogger(__name__)

# Create blueprint
chat_bp = Blueprint('chat', __name__, url_prefix='/chat')


@chat_bp.route('/', methods=['POST'])
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
        return jsonify({
            "success": False,
            "error": "Internal server error",
            "message": "I apologize, but I'm experiencing technical difficulties. Please try again later."
        }), 500


@chat_bp.route('/history', methods=['GET'])
def get_chat_history():
    """Get chat history for current session"""
    try:
        session_id = session.get('session_id')
        if not session_id:
            return jsonify({"history": [], "session_id": None})
        
        # In a real app, you'd retrieve from database
        # For now, return empty as we don't persist history
        return jsonify({
            "history": [],
            "session_id": session_id,
            "message": "Chat history not persisted in this demo"
        })
        
    except Exception as e:
        logger.error(f"Chat history error: {str(e)}")
        return jsonify({"error": "Failed to retrieve chat history"}), 500


@chat_bp.route('/clear', methods=['POST'])
def clear_chat():
    """Clear current chat session"""
    try:
        session.pop('session_id', None)
        session.pop('created_at', None)
        
        return jsonify({
            "success": True,
            "message": "Chat session cleared"
        })
        
    except Exception as e:
        logger.error(f"Clear chat error: {str(e)}")
        return jsonify({"error": "Failed to clear chat session"}), 500
