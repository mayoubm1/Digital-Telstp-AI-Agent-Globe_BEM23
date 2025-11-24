from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class ShortTermMemory(db.Model):
    __tablename__ = 'short_term_memory'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(100), nullable=False)
    context_type = db.Column(db.String(50), nullable=False)  # conversation, task, system
    content = db.Column(db.Text, nullable=False)
    meta_data = db.Column(db.Text)  # JSON string for additional metadata
    priority = db.Column(db.Integer, default=1)  # 1-10, higher is more important
    access_count = db.Column(db.Integer, default=0)
    last_accessed = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime)  # when this memory should be cleaned up
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'context_type': self.context_type,
            'content': self.content,
            'metadata': json.loads(self.meta_data) if self.meta_data else {},
            'priority': self.priority,
            'access_count': self.access_count,
            'last_accessed': self.last_accessed.isoformat(),
            'created_at': self.created_at.isoformat(),
            'expires_at': self.expires_at.isoformat() if self.expires_at else None
        }

class LongTermMemory(db.Model):
    __tablename__ = 'long_term_memory'
    
    id = db.Column(db.Integer, primary_key=True)
    memory_type = db.Column(db.String(50), nullable=False)  # pattern, insight, experience
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    context = db.Column(db.Text)  # JSON string for context information
    emotional_context = db.Column(db.Text)  # JSON string for emotional/evaluative context
    importance_score = db.Column(db.Float, default=1.0)
    consolidation_score = db.Column(db.Float, default=0.0)  # how well consolidated this memory is
    related_memories = db.Column(db.Text)  # JSON array of related memory IDs
    tags = db.Column(db.Text)  # JSON array of tags
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_reinforced = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'memory_type': self.memory_type,
            'title': self.title,
            'content': self.content,
            'context': json.loads(self.context) if self.context else {},
            'emotional_context': json.loads(self.emotional_context) if self.emotional_context else {},
            'importance_score': self.importance_score,
            'consolidation_score': self.consolidation_score,
            'related_memories': json.loads(self.related_memories) if self.related_memories else [],
            'tags': json.loads(self.tags) if self.tags else [],
            'created_at': self.created_at.isoformat(),
            'last_reinforced': self.last_reinforced.isoformat()
        }

class EpisodicMemory(db.Model):
    __tablename__ = 'episodic_memory'
    
    id = db.Column(db.Integer, primary_key=True)
    event_title = db.Column(db.String(200), nullable=False)
    event_description = db.Column(db.Text, nullable=False)
    participants = db.Column(db.Text)  # JSON array of participants
    location = db.Column(db.String(200))  # virtual location or context
    outcome = db.Column(db.Text)
    emotional_impact = db.Column(db.String(50))  # positive, negative, neutral, mixed
    lessons_learned = db.Column(db.Text)
    related_knowledge = db.Column(db.Text)  # JSON array of related knowledge IDs
    event_timestamp = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'event_title': self.event_title,
            'event_description': self.event_description,
            'participants': json.loads(self.participants) if self.participants else [],
            'location': self.location,
            'outcome': self.outcome,
            'emotional_impact': self.emotional_impact,
            'lessons_learned': self.lessons_learned,
            'related_knowledge': json.loads(self.related_knowledge) if self.related_knowledge else [],
            'event_timestamp': self.event_timestamp.isoformat(),
            'created_at': self.created_at.isoformat()
        }

class ProceduralMemory(db.Model):
    __tablename__ = 'procedural_memory'
    
    id = db.Column(db.Integer, primary_key=True)
    skill_name = db.Column(db.String(200), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=False)
    steps = db.Column(db.Text, nullable=False)  # JSON array of steps
    conditions = db.Column(db.Text)  # JSON object for when to use this skill
    success_rate = db.Column(db.Float, default=0.0)
    usage_count = db.Column(db.Integer, default=0)
    last_used = db.Column(db.DateTime)
    optimization_notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'skill_name': self.skill_name,
            'description': self.description,
            'steps': json.loads(self.steps) if self.steps else [],
            'conditions': json.loads(self.conditions) if self.conditions else {},
            'success_rate': self.success_rate,
            'usage_count': self.usage_count,
            'last_used': self.last_used.isoformat() if self.last_used else None,
            'optimization_notes': self.optimization_notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
