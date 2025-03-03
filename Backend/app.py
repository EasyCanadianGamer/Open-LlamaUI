# backend/app.py
from flask import Flask, jsonify
from flask_cors import CORS
from extensions import db
from user import user_bp
from chat import chat_bp

app = Flask(__name__)
CORS(app)  # Allow Vite's dev server (localhost:5173)

# Configure SQLite database (app.db will be created in your project folder)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize SQLAlchemy with the Flask app
db.init_app(app)

# Import models after initializing db
from models import Character

app.register_blueprint(chat_bp, url_prefix='/ch')
app.register_blueprint(user_bp, url_prefix='/user')

@app.route('/api/message')
def get_message():
    return jsonify({"text": "Hello from Python + Vite!"})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create tables if they don't exist
    app.run(port=5000)
