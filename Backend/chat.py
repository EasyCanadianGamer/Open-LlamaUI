# from ollama import chat

# stream = chat(
#     model='Godmoded/llama3-lexi-uncensored',
#     messages=[{'role': 'user', 'content': 'Why is the sky blue?'}],
#     stream=True,
# )

# for chunk in stream:
#   print(chunk['message']['content'], end='', flush=True)

# from ollama import chat

# # System prompt to set behavior
# system_prompt = "You are a helpful astrophysicist. Explain concepts clearly with scientific accuracy but in simple terms."

# # Initialize messages with system prompt
# messages = [
#     {'role': 'system', 'content': system_prompt}
# ]

# while True:
#     # Get user input
#     user_input = input("\nYou: ")
    
#     # Exit condition
#     if user_input.lower() in ['exit', 'quit']:
#         break
    
#     # Add user message to history
#     messages.append({'role': 'user', 'content': user_input})
    
#     # Generate response
#     stream = chat(
#         model='Godmoded/llama3-lexi-uncensored',
#         messages=messages,
#         stream=True,
#     )
    
#     # Stream response and build full output
#     print("\nAssistant: ", end='', flush=True)
#     full_response = []
#     for chunk in stream:
#         content = chunk['message']['content']
#         print(content, end='', flush=True)
#         full_response.append(content)
    
#     # Add assistant response to history
#     messages.append({'role': 'assistant', 'content': ''.join(full_response)})

# print("\nGoodbye!")


# backend/chat.py


import uuid
import json, os
from datetime import datetime
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from ollama import chat  # Assuming you're using this for chat functionality

# Import the database instance and Character model
from extensions import db  # Import db from the new extensions module
from models import Character

chat_bp = Blueprint('ch', __name__)

# Set up directories for storing uploads
JSON_FOLDER = 'jsons'
IMAGE_FOLDER = 'images'
for folder in (JSON_FOLDER, IMAGE_FOLDER):
    if not os.path.exists(folder):
        os.makedirs(folder)

ALLOWED_JSON = {'json'}
ALLOWED_IMAGE = {'png', 'jpg', 'jpeg'}

def allowed_file(filename, allowed_extensions):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions



@chat_bp.route('/characters', methods=['GET'])
def get_characters():
    characters = Character.query.all()  # Fetch all characters from the database
    characters_list = [
        {'id': character.id, 'name': character.name, 'image_path': character.image_path}
        for character in characters
    ]
    return jsonify(characters_list)



@chat_bp.route('/import_character', methods=['POST'])
def import_character():
    if 'json_file' not in request.files:
        return jsonify({'error': 'No JSON file part in the request'}), 400
    if 'pfp_file' not in request.files:
        return jsonify({'error': 'No profile picture file part in the request'}), 400

    json_file = request.files['json_file']
    pfp_file = request.files['pfp_file']

    if json_file.filename == '':
        return jsonify({'error': 'No JSON file selected'}), 400
    if not allowed_file(json_file.filename, ALLOWED_JSON):
        return jsonify({'error': 'Invalid file type for JSON. Only .json allowed.'}), 400

    if pfp_file.filename == '':
        return jsonify({'error': 'No profile picture file selected'}), 400
    if not allowed_file(pfp_file.filename, ALLOWED_IMAGE):
        return jsonify({'error': 'Invalid file type for image. Only PNG, JPG, or JPEG allowed.'}), 400

    # Save the JSON file
    json_filename = secure_filename(json_file.filename)
    json_path = os.path.join(JSON_FOLDER, json_filename)
    json_file.save(json_path)

    try:
        with open(json_path, 'r') as f:
            character_data = json.load(f)
        required_keys = ['name', 'description', 'personality', 'scenario', 'first_mes', 'mes_example']
        for key in required_keys:
            if key not in character_data:
                return jsonify({'error': f'Missing required key: {key}'}), 400
    except Exception as e:
        return jsonify({'error': f'Error parsing JSON: {str(e)}'}), 500

    # Save the profile picture file
    image_filename = secure_filename(pfp_file.filename)
    image_path = os.path.join(IMAGE_FOLDER, image_filename)
    pfp_file.save(image_path)
    character_data['image_path'] = image_path

    # Create a new Character record in the database
    new_character = Character(
        name=character_data['name'],
        description=character_data['description'],
        personality=character_data['personality'],
        scenario=character_data['scenario'],
        first_mes=character_data['first_mes'],
        mes_example=character_data['mes_example'],
        image_path=character_data['image_path']
    )
    db.session.add(new_character)
    db.session.commit()

    return jsonify({
        'message': 'Character imported successfully',
        'character_data': character_data,
        'character_id': new_character.id
    })

# def load_character_data(filename):
#     # If you wish to load a JSON from disk (if needed)
#     json_path = os.path.join(JSON_FOLDER, filename)
#     try:
#         with open(json_path, 'r') as f:
#             return json.load(f)
#     except Exception as e:
#         print("Error loading JSON from disk:", e, flush=True)
#         return None

print("character_id")
    
@chat_bp.route('/start', methods=['POST'])
def start_chat():
    data = request.json
    session_id = data.get('session_id')  # Get session_id from the request
    character_id = data.get('character_id')  # Expecting character ID instead of filename

    if not character_id:
        return jsonify({'error': 'Character ID is required'}), 400

    # Query the database for the character
    character = Character.query.get(character_id)
    if not character:
        return jsonify({'error': 'Character not found'}), 404

    # Prepare the required keys from the database
    required_keys = ['name', 'description', 'personality', 'scenario', 'first_mes']
    missing_keys = [key for key in required_keys if not getattr(character, key, None)]
    if missing_keys:
        return jsonify({'error': f"Missing required keys: {', '.join(missing_keys)}"}), 400

    # Check if session already exists
    if session_id and session_id in sessions:
        # Return the existing session if found
        existing_session = sessions[session_id]
        return jsonify({
            'session_id': session_id,
            'first_message': existing_session['messages'][1]['content'],  # Existing character's first message
            'character_name': existing_session['character_data']['name'],
            'image_path': existing_session['character_data']['image_path']
        }), 200

    # If no valid session_id, create a new session
    session_id = str(uuid.uuid4())  # Unique ID for this chat session

    # Build the system prompt with the character's data
    system_prompt = f"""You are {character.name}, {character.description}
Personality: {character.personality}
Scenario: {character.scenario}"""

    # Store the session data for a new session
    sessions[session_id] = {
        'messages': [
            {
                'id': str(uuid.uuid4()),  # ID for system message
                'role': 'system',
                'content': system_prompt,
                'timestamp': datetime.now().isoformat()
            },
            {
                'id': str(uuid.uuid4()),  # ID for the character's first message
                'role': 'assistant',
                'content': character.first_mes,
                'timestamp': datetime.now().isoformat()
            }
        ],
        'character_data': {
            'name': character.name,
            'description': character.description,
            'personality': character.personality,
            'scenario': character.scenario,
            'first_mes': character.first_mes,
            'image_path': character.image_path
        }
    }

    # Return the new session ID and character info
    return jsonify({
        'session_id': session_id,  # Returning the session ID to the client
        'first_message': character.first_mes,  # Sending the first message from the character
        'character_name': character.name,
        'image_path': character.image_path
    })

@chat_bp.route('/chat', methods=['POST'])
def chat_with_character():
    data = request.json
    session_id = data.get('session_id')
    user_message = data.get('message')
    
    if not session_id or session_id not in sessions:
        return jsonify({'error': 'Invalid session ID'}), 400
    if not user_message:
        return jsonify({'error': 'Message is required'}), 400

    session = sessions[session_id]
    character_data = session['character_data']
    
    try:
        # Add user message to session
        user_message_id = str(uuid.uuid4())  # Create message ID for user
        session['messages'].append({
            'id': user_message_id,
            'role': 'user',
            'content': user_message,
            'timestamp': datetime.now().isoformat()
        })

        # Generate AI response
        stream = chat(
            model='Godmoded/llama3-lexi-uncensored',
            messages=session['messages'],
            stream=True,
            options={'temperature': 0.7, 'top_p': 0.9}
        )
        
        full_response = []
        for chunk in stream:
            content = chunk['message']['content']
            full_response.append(content)

        ai_response = ''.join(full_response)
        ai_message_id = str(uuid.uuid4())  # ID for AI response

        # Add AI response to session
        session['messages'].append({
            'id': ai_message_id,
            'role': 'assistant',
            'content': ai_response,
            'timestamp': datetime.now().isoformat()
        })

        return jsonify({
            'user_message_id': user_message_id,  # ID of user message
            'ai_message_id': ai_message_id,  # ID of AI response
            'response': ai_response
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# In-memory session storage remains for chat functionality
sessions = {}


@chat_bp.route('/messages/<message_id>', methods=['PUT'])
def update_message(message_id):
    session_id = request.json.get('session_id')
    new_content = request.json.get('content')
    
    if not session_id or session_id not in sessions:
        return jsonify({'error': 'Invalid session ID'}), 400
    if not new_content:
        return jsonify({'error': 'Content is required'}), 400

    session = sessions[session_id]
    for msg in session['messages']:
        if msg['id'] == message_id and msg['role'] == 'user':
            msg['content'] = new_content
            msg['timestamp'] = datetime.now().isoformat()
            return jsonify({'message': 'Message updated', 'updated_message': msg})
    
    return jsonify({'error': 'Message not found or not editable'}), 404

@chat_bp.route('/messages/<message_id>/regenerate', methods=['POST'])
def regenerate_message(message_id):
    session_id = request.json.get('session_id')
    
    if not session_id or session_id not in sessions:
        return jsonify({'error': 'Invalid session ID'}), 400

    session = sessions[session_id]
    for index, msg in enumerate(session['messages']):
        if msg['id'] == message_id and msg['role'] == 'assistant':
            try:
                # Get conversation history up to the regeneration point
                context_messages = [m for m in session['messages'][:index] if m['role'] != 'system']
                
                # Regenerate response
                stream = chat(
                    model='Godmoded/llama3-lexi-uncensored',
                    messages=context_messages,
                    stream=True,
                    options={'temperature': 0.7, 'top_p': 0.9}
                )
                
                full_response = []
                for chunk in stream:
                    content = chunk['message']['content']
                    full_response.append(content)
                
                # Update existing message
                msg['content'] = ''.join(full_response)
                msg['timestamp'] = datetime.now().isoformat()
                return jsonify({'message': 'Response regenerated', 'updated_message': msg})
            
            except Exception as e:
                return jsonify({'error': str(e)}), 500
    
    return jsonify({'error': 'Message not found or not an AI message'}), 404

@chat_bp.route('/messages/<message_id>', methods=['DELETE'])
def delete_message(message_id):
    session_id = request.json.get('session_id')
    
    if not session_id or session_id not in sessions:
        return jsonify({'error': 'Invalid session ID'}), 400

    session = sessions[session_id]
    message_index = next((i for i, m in enumerate(session['messages']) if m['id'] == message_id), None)
    
    if message_index is None:
        return jsonify({'error': 'Message not found'}), 404

    deleted_ids = []
    # Check if deleting AI response and corresponding user message
    if (session['messages'][message_index]['role'] == 'assistant' 
        and message_index > 0 
        and session['messages'][message_index-1]['role'] == 'user'):
        
        deleted_ids.extend([session['messages'][message_index-1]['id'], message_id])
        del session['messages'][message_index-1:message_index+1]
    else:
        deleted_ids.append(message_id)
        del session['messages'][message_index]

    return jsonify({'message': 'Messages deleted', 'deleted_ids': deleted_ids})