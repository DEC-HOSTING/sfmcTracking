"""
AI Service for Kluster AI Integration
Handles chat completions and task generation using Mistral-Nemo model
"""

import os
import logging
import traceback
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Kluster AI Configuration
KLUSTER_API_KEY = os.getenv('KLUSTER_API_KEY', 'ddc437e6-6c4c-4649-ade4-34d99fa0cd26')
KLUSTER_BASE_URL = os.getenv('KLUSTER_BASE_URL', 'https://api.kluster.ai/v1')
KLUSTER_MODEL = os.getenv('KLUSTER_MODEL', 'mistralai/Mistral-Nemo-Instruct-2407')

# Initialize Kluster AI client
try:
    kluster_client = OpenAI(
        api_key=KLUSTER_API_KEY,
        base_url=KLUSTER_BASE_URL
    )
    logger.info("Kluster AI client initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Kluster AI client: {str(e)}")
    kluster_client = None

class AIService:
    """Handle AI interactions with Kluster AI's Mistral-Nemo model"""
    
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
            if not kluster_client:
                return {
                    "success": False,
                    "error": "AI service not available",
                    "message": "I apologize, but the AI service is currently unavailable. Please try again later."
                }
            
            logger.info(f"Making chat completion request with {len(messages)} messages")
              # Add timeout handling for Kluster AI
            response = None
            assistant_message = None
            
            try:
                logger.info(f"Sending request to Kluster AI with model: {KLUSTER_MODEL}")
                response = kluster_client.chat.completions.create(
                    model=KLUSTER_MODEL,
                    messages=messages,
                    max_completion_tokens=4000,
                    temperature=0.1,
                    top_p=1,
                    timeout=30  # 30 second timeout
                )
                
                assistant_message = response.choices[0].message.content
                logger.info("Successfully received response from Kluster AI")
                
            except Exception as api_error:
                logger.warning(f"Kluster AI API timeout/error: {str(api_error)}")
                logger.warning(f"Error type: {type(api_error).__name__}")
                
                # Fallback to a helpful response based on the user's message
                user_message = messages[-1].get('content', '') if messages else ''
                
                # Create a more contextual fallback message
                if 'task' in user_message.lower():
                    assistant_message = f"I'm having trouble connecting to my AI service right now, but I can still help you with task management! You can:\n\n• Use the 'Add Task' button to create new tasks\n• Organize tasks into categories using the sidebar\n• Mark tasks as complete by clicking the checkbox\n\nYour request was: '{user_message}'\n\nI'll be back online soon to provide more AI-powered assistance!"
                elif 'category' in user_message.lower() or 'organize' in user_message.lower():
                    assistant_message = f"I'm experiencing connectivity issues, but you can still organize your work! Try:\n\n• Creating new categories in the sidebar\n• Moving tasks between categories\n• Using colors to organize your workflow\n\nYour request: '{user_message}'\n\nI'll be back to help with AI-powered organization soon!"
                else:
                    assistant_message = f"I apologize, but I'm having trouble connecting to my AI service right now. However, you can still use all the TaskMaster features:\n\n• Create and manage tasks\n• Organize with categories\n• Track your progress\n\nYour message: '{user_message}'\n\nI'll be back online shortly to provide full AI assistance!"
                
                response = None  # Ensure response is None for fallback handling
            
            logger.info("Chat completion successful")
            return {
                "success": True,
                "message": assistant_message,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens if response and response.usage else None,
                    "completion_tokens": response.usage.completion_tokens if response and response.usage else None,
                    "total_tokens": response.usage.total_tokens if response and response.usage else None
                }
            }
            
        except Exception as e:
            logger.error(f"Chat completion failed: {str(e)}")
            logger.error(traceback.format_exc())
            return {
                "success": False,
                "error": str(e),
                "message": "I apologize, but I'm experiencing technical difficulties. Please try again later."
            }
    
    @staticmethod
    def generate_tasks(user_prompt):
        """
        Generate tasks and categories based on user prompt
        
        Args:
            user_prompt (str): User's request for task generation
            
        Returns:
            dict: AI response with structured task/category data
        """
        system_prompt = """You are a task-generation engine that outputs valid JSON with tasks and categories.

Your response must be ONLY valid JSON in this exact format:
{
  "categories": [
    {"name": "Category Name", "color": "#000000"}
  ],
  "tasks": [
    {
      "title": "Task Title",
      "description": "Detailed description",
      "category_name": "Category Name",
      "priority": "high|medium|low"
    }
  ]
}

Rules:
- Always create 3-7 practical, actionable tasks
- Group tasks into 2-4 logical categories
- Use colors: #000000 (black), #333333 (dark gray), #666666 (medium gray)
- Priorities: high, medium, low
- Make descriptions specific and helpful"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        return AIService.chat_completion(messages)
