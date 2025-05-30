"""
Category model for organizing tasks
"""

from datetime import datetime
from app import db

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    color = db.Column(db.String(7), default='#000000')  # Hex color for category
    
    # Relationships
    tasks = db.relationship('Task', backref='category', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert category to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'color': self.color,
            'task_count': self.tasks.count(),
            'completed_count': self.tasks.filter_by(done=True).count()
        }
    
    def __repr__(self):
        return f'<Category {self.name}>'
