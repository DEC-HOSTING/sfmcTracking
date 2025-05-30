"""
Task model for todo items
"""

from datetime import datetime
from app import db

class Task(db.Model):
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    done = db.Column(db.Boolean, default=False, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False) # Added user_id
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    priority = db.Column(db.String(10), default='medium')  # low, medium, high
    due_date = db.Column(db.DateTime)
    
    def to_dict(self):
        """Convert task to dictionary"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'done': self.done,
            'category_id': self.category_id,
            'user_id': self.user_id, # Added user_id to dict
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'priority': self.priority,
            'due_date': self.due_date.isoformat() if self.due_date else None
        }
    
    def __repr__(self):
        return f'<Task {self.title}>'
