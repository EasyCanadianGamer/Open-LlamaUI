from extensions import db
from datetime import datetime
import uuid

class Character(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    personality = db.Column(db.Text, nullable=False)
    scenario = db.Column(db.Text, nullable=False)
    first_mes = db.Column(db.Text, nullable=False)
    mes_example = db.Column(db.Text, nullable=True)
    image_path = db.Column(db.String(200), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "personality": self.personality,
            "scenario": self.scenario,
            "first_mes": self.first_mes,
            "mes_example": self.mes_example,
            "image_path": self.image_path
        }


class ChatSession(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))  # UUID for session
    character_id = db.Column(db.Integer, db.ForeignKey('character.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship to Character and Messages
    character = db.relationship('Character', backref=db.backref('sessions', lazy=True))
    messages = db.relationship('Message', backref='chat_session', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            "id": self.id,
            "character_id": self.character_id,
            "created_at": self.created_at.isoformat(),
            "messages": [message.to_dict() for message in self.messages]
        }


class Message(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))  # UUID for message
    session_id = db.Column(db.String(36), db.ForeignKey('chat_session.id'), nullable=False)
    role = db.Column(db.String(10), nullable=False)  # 'user', 'assistant', or 'system'
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "session_id": self.session_id,
            "role": self.role,
            "content": self.content,
            "timestamp": self.timestamp.isoformat()
        }
