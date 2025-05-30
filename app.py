#!/usr/bin/env python3
"""
Flask Web Application for AI-Powered Email Campaign Tracker
Restructured from JavaScript to provide better AI integration and reliability
"""

from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
import os
import json
import logging
import re
from datetime import datetime
import openai
from dotenv import load_dotenv
import secrets

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', secrets.token_hex(16))

# Enable CORS for development
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# AI Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
if OPENAI_API_KEY:
    # Initialize the OpenAI client
    from openai import OpenAI
    openai_client = OpenAI(api_key=OPENAI_API_KEY)
else:
    openai_client = None

class AIService:
    """Handle AI interactions for email campaign checklist processing"""
    
    @staticmethod
    def parse_checklist_with_ai(text_content):
        """Parse checklist text into structured format using AI"""
        try:
            if not openai_client:
                return AIService._fallback_checklist_parsing(text_content)
            
            prompt = f"""Parse this email campaign checklist text into a structured JSON format. Focus on extracting:
1. Main sections/categories (numbered items like "1. Planning", "2. Content Creation", etc.)
2. Action items within each section
3. Any status information for team members (Cathie, Malauri, etc.)

Return a JSON object with this structure:
{{
    "sections": [
        {{
            "id": 1,
            "title": "Section Title",
            "cathieStatus": "status or 'Status not specified'",
            "malaurieStatus": "status or 'Status not specified'", 
            "actions": ["action 1", "action 2", ...]
        }}
    ]
}}

Text to parse:
{text_content}

Return ONLY valid JSON, no markdown formatting or explanations."""
            
            response = openai_client.chat.completions.create(
                model=os.getenv('AI_MODEL', 'gpt-3.5-turbo'),
                messages=[
                    {"role": "system", "content": "You are a specialized JSON parser for email campaign checklists. Your sole purpose is to convert unstructured text into valid JSON. ALWAYS respond with ONLY valid JSON that starts with { and ends with }. Never include explanations, markdown formatting, or additional text."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=int(os.getenv('AI_MAX_TOKENS', 2000)),
                temperature=float(os.getenv('AI_TEMPERATURE', 0.1))
            )
            
            ai_response = response.choices[0].message.content.strip()
            
            # Parse the JSON response
            try:
                parsed_data = json.loads(ai_response)
                return parsed_data
            except json.JSONDecodeError:
                # Try to extract JSON from response
                import re
                json_match = re.search(r'\{.*\}', ai_response, re.DOTALL)
                if json_match:
                    parsed_data = json.loads(json_match.group())
                    return parsed_data
                else:
                    raise Exception("Could not parse AI response as JSON")            
        except Exception as e:
            logger.error(f"AI checklist parsing failed: {str(e)}")
            return AIService._fallback_checklist_parsing(text_content)
    
    @staticmethod
    def restructure_list_with_ai(text_content):
        """Restructure a list using AI to organize into categories"""
        try:
            if not openai_client:
                return AIService._fallback_list_restructuring(text_content)
            
            prompt = f"""You are a helpful AI assistant specialized in organizing and restructuring lists. Please analyze the following text and organize it into logical categories with priorities.

Input text to organize:
{text_content}

Please respond with a JSON object in this exact format:
{{
    "originalCount": number,
    "categories": {{
        "urgent": [array of urgent items],
        "important": [array of important items],
        "routine": [array of routine items],
        "misc": [array of other items]
    }},
    "suggestions": [array of helpful suggestions about the organization]
}}

Categorization rules:
- "urgent": Items marked as urgent, ASAP, immediate, critical deadlines
- "important": High-priority items that significantly impact goals
- "routine": Regular, recurring, or maintenance tasks
- "misc": Everything else that doesn't fit the above categories

Clean up the text and make items actionable. Respond with ONLY the JSON object."""
            
            response = openai_client.chat.completions.create(
                model=os.getenv('AI_MODEL', 'gpt-3.5-turbo'),
                messages=[
                    {"role": "system", "content": "You are a helpful AI assistant that organizes and restructures lists. Respond only with valid JSON in the requested format."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=int(os.getenv('AI_MAX_TOKENS', 2000)),
                temperature=float(os.getenv('AI_TEMPERATURE', 0.1))
            )
            
            ai_response = response.choices[0].message.content.strip()
            
            # Parse the JSON response
            try:
                parsed_data = json.loads(ai_response)
                return parsed_data
            except json.JSONDecodeError:
                # Try to extract JSON from response
                import re
                json_match = re.search(r'\{.*\}', ai_response, re.DOTALL)
                if json_match:
                    parsed_data = json.loads(json_match.group())
                    return parsed_data
                else:
                    raise Exception("Could not parse AI response as JSON")
            
        except Exception as e:
            logger.error(f"AI list restructuring failed: {str(e)}")
            return AIService._fallback_list_restructuring(text_content)
    
    @staticmethod
    def _fallback_checklist_parsing(text_content):
        """Fallback parsing when AI is not available"""
        lines = text_content.split('\n')
        lines = [line.strip() for line in lines if line.strip()]
        
        sections = []
        current_section = None
        section_id = 1
        
        for line in lines:
            # Check for section headers (numbered)
            if re.match(r'^\d+\.', line):
                if current_section:
                    sections.append(current_section)
                current_section = {
                    "id": section_id,
                    "title": re.sub(r'^\d+\.\s*', '', line),
                    "cathieStatus": "Status not specified",
                    "malaurieStatus": "Status not specified",
                    "actions": []
                }
                section_id += 1
            elif current_section:
                # Add as action item
                action = line.replace('•', '').replace('-', '').strip()
                if action:
                    current_section["actions"].append(action)
        
        if current_section:
            sections.append(current_section)
        
        # Create default section if none found
        if not sections:
            sections = [{
                "id": 1,
                "title": "Imported Checklist",
                "cathieStatus": "Status not specified",
                "malaurieStatus": "Status not specified",
                "actions": lines[:10]  # Take first 10 lines as actions
            }]
        
        return {"sections": sections}
    
    @staticmethod
    def _fallback_list_restructuring(text_content):
        """Fallback restructuring when AI is not available"""
        lines = text_content.split('\n')
        lines = [line.strip() for line in lines if line.strip()]
        
        categories = {
            "urgent": [],
            "important": [],
            "routine": [],
            "misc": []
        }
        
        for line in lines:
            lower_line = line.lower()
            if any(word in lower_line for word in ['urgent', 'asap', 'immediately', 'critical']):
                categories["urgent"].append(line)
            elif any(word in lower_line for word in ['important', 'must', 'should', 'priority']):
                categories["important"].append(line)
            elif any(word in lower_line for word in ['daily', 'weekly', 'regular', 'routine']):
                categories["routine"].append(line)
            else:
                categories["misc"].append(line)

        return {
            "originalCount": len(lines),
            "categories": categories,
            "suggestions": ["AI service not available - used basic categorization", "Consider reviewing categories manually"]
        }

# Flask Routes

@app.route('/')
def index():
    """Serve the main application"""
    return render_template('index.html')

@app.route('/chat')
def chat():
    """Serve the chat interface"""
    return render_template('chat.html')

@app.route('/api/chat', methods=['POST'])
def chat_api():
    """Handle AI chat conversations"""
    try:
        data = request.get_json()
        messages = data.get('messages', [])
        
        if not messages:
            return jsonify({"success": False, "error": "No messages provided"}), 400
        
        # Get the latest user message
        user_message = messages[-1]['content'] if messages else ""
        
        if not openai_client:
            return jsonify({
                "success": True,
                "message": "I'm sorry, but the AI service is not available right now. Please check that your OpenAI API key is configured properly."
            })
        
        # Use OpenAI to generate a response
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=1000,
            temperature=0.7
        )
        
        ai_message = response.choices[0].message.content
        
        return jsonify({
            "success": True,
            "message": ai_message
        })
        
    except Exception as e:
        logger.error(f"Chat API error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Failed to process chat request"
        }), 500

@app.route('/api/ai/import', methods=['POST'])
def ai_import():
    """Handle AI-powered checklist import and parsing"""
    try:
        data = request.get_json()
        text_content = data.get('text', '')
        
        if not text_content:
            return jsonify({"success": False, "error": "No text content provided"}), 400
        
        result = AIService.parse_checklist_with_ai(text_content)
        return jsonify({"success": True, "data": result})
        
    except Exception as e:
        logger.error(f"Import API error: {str(e)}")
        return jsonify({"success": False, "error": "Failed to parse checklist with AI"}), 500

@app.route('/api/ai/restructure', methods=['POST'])
def ai_restructure():
    """Handle AI-powered list restructuring"""
    try:
        data = request.get_json()
        text_content = data.get('text', '')
        
        if not text_content:
            return jsonify({"success": False, "error": "No text content provided"}), 400
        
        result = AIService.restructure_list_with_ai(text_content)
        return jsonify({"success": True, "data": result})
        
    except Exception as e:
        logger.error(f"Restructure API error: {str(e)}")
        return jsonify({"success": False, "error": "Failed to restructure list with AI"}), 500

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "ai_available": bool(openai_client)
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    # Development server
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    logger.info(f"Starting Flask app on port {port}")
    logger.info(f"AI service available: {bool(openai_client)}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)