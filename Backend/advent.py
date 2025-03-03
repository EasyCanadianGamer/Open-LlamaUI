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
from flask import Blueprint, request, jsonify
import json, os
from werkzeug.utils import secure_filename
from ollama import chat  # Assuming you're using this for chat functionality

chat_bp = Blueprint('chat', __name__)

# Set up directories for storing uploads
JSON_FOLDER = 'jsons'
IMAGE_FOLDER = 'images'
for folder in (JSON_FOLDER, IMAGE_FOLDER):
    if not os.path.exists(folder):
        os.makedirs(folder)

# Allowed file extensions for JSON and image uploads
ALLOWED_JSON = {'json'}
ALLOWED_IMAGE = {'png', 'jpg', 'jpeg'}

def allowed_file(filename, allowed_extensions):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

@chat_bp.route('/import_character', methods=['POST'])
def import_character():
    # Check if both files are present in the request
    if 'json_file' not in request.files:
        return jsonify({'error': 'No JSON file part in the request'}), 400
    if 'pfp_file' not in request.files:
        return jsonify({'error': 'No profile picture file part in the request'}), 400

    json_file = request.files['json_file']
    pfp_file = request.files['pfp_file']

    # Validate the JSON file
    if json_file.filename == '':
        return jsonify({'error': 'No JSON file selected'}), 400
    if not allowed_file(json_file.filename, ALLOWED_JSON):
        return jsonify({'error': 'Invalid file type for JSON. Only .json allowed.'}), 400

    # Validate the image file
    if pfp_file.filename == '':
        return jsonify({'error': 'No profile picture file selected'}), 400
    if not allowed_file(pfp_file.filename, ALLOWED_IMAGE):
        return jsonify({'error': 'Invalid file type for image. Only PNG, JPG, or JPEG allowed.'}), 400

    # Save the JSON file
    json_filename = secure_filename(json_file.filename)
    json_path = os.path.join(JSON_FOLDER, json_filename)
    json_file.save(json_path)

    # Load the character data from JSON file
    try:
        with open(json_path, 'r') as f:
            # For your provided JSON structure, we expect the character details at the top level.
            character_data = json.load(f)
        # Optionally, you could verify required keys exist:
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

    # Insert image path into the character data
    character_data['image_path'] = image_path

    return jsonify({
        'message': 'Character imported successfully',
        'character_data': character_data
    })

# Existing chat routes remain unchanged

@chat_bp.route('/start', methods=['POST'])
def start_chat():
    data = request.json
    character_data = data.get('character_data')
    if not character_data:
        return jsonify({'error': 'Character data is required'}), 400

    # Build the system prompt from character data
    system_prompt = f"""
    You are {character_data['name']}, {character_data['description']}
    **Personality:** {character_data['personality']}
    **Scenario:** {character_data['scenario']}
    **Creator Notes:** {character_data.get('creator_notes', 'No notes provided')}
    **Examples of Interaction:**
    {character_data['mes_example']}

    Always respond in character and start conversations with the provided first message.
    """

    temperature = 0.7  # or get from request.args if needed
    top_p = 0.9
    messages = [
        {'role': 'system', 'content': system_prompt},
        {'role': 'assistant', 'content': character_data['first_mes']}
    ]
    return jsonify({
        'character_name': character_data['name'],
        'first_message': character_data['first_mes'],
        'image_path': character_data.get('image_path')
    })
    
    

@chat_bp.route('/chat', methods=['POST'])
def chat_with_character():
    user_input = request.json.get('message')
    if not user_input:
        return jsonify({'error': 'Message is required'}), 400

    try:
        character_data = request.json.get('character_data')
        system_prompt = request.json.get('system_prompt')
        temperature = request.json.get('temperature', 0.7)
        top_p = request.json.get('top_p', 0.9)
        messages = [
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': user_input}
        ]

        stream = chat(
            model='Godmoded/llama3-lexi-uncensored',
            messages=messages,
            stream=True,
            options={'temperature': temperature, 'top_p': top_p}
        )

        full_response = []
        for chunk in stream:
            content = chunk['message']['content']
            full_response.append(content)

        assistant_reply = ''.join(full_response)
        messages.append({'role': 'assistant', 'content': assistant_reply})
        return jsonify({'response': assistant_reply})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
