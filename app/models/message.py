"""
Message model for AI chat history
"""

from datetime import datetime
from app import db

class Message(db.Model):
    __tablename__ = 'messages'
    
    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(20), nullable=False)  # 'user' or 'assistant' or 'system'
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    session_id = db.Column(db.String(36))  # Optional: group messages by session
    
    def to_dict(self):
        """Convert message to dictionary"""
        return {
            'id': self.id,
            'role': self.role,
            'content': self.content,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'user_id': self.user_id,
            'session_id': self.session_id
        }
    
    def __repr__(self):
        return f'<Message {self.role}: {self.content[:50]}...>'
