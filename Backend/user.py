from flask import Blueprint, request, jsonify, send_from_directory
import os
from werkzeug.utils import secure_filename

user_bp = Blueprint('user', __name__)

# Directory for storing uploaded profile images
IMAGE_FOLDER = 'user_images'
if not os.path.exists(IMAGE_FOLDER):
    os.makedirs(IMAGE_FOLDER)

# Allowed image extensions
ALLOWED_IMAGE = {'png', 'jpg', 'jpeg'}

def allowed_file(filename, allowed_extensions):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

@user_bp.route('/import_user', methods=['POST'])
def import_user():
    # Get text fields from the form data
    name = request.form.get('name')
    description = request.form.get('description')

    if not name:
        return jsonify({'error': 'Name is required'}), 400
    if not description:
        return jsonify({'error': 'Description is required'}), 400

    # Check for profile picture file in the request
    if 'pfp_file' not in request.files:
        return jsonify({'error': 'No profile picture file part in the request'}), 400

    pfp_file = request.files['pfp_file']

    if pfp_file.filename == '':
        return jsonify({'error': 'No profile picture file selected'}), 400
    if not allowed_file(pfp_file.filename, ALLOWED_IMAGE):
        return jsonify({'error': 'Invalid file type for image. Only PNG, JPG, or JPEG allowed.'}), 400

    # Save the profile picture
    image_filename = secure_filename(pfp_file.filename)
    image_path = os.path.join(IMAGE_FOLDER, image_filename)
    pfp_file.save(image_path)

    # Instead of returning the local file path, we return a URL that points to our static route
    image_url = f"http://localhost:5000/user/user_images/{image_filename}"
    # Build the user profile dictionary
    user_profile = {
        'name': name,
        'description': description,
        'profilePicture': image_url  # Updated key for front-end usage
    }

    return jsonify({
        'message': 'User profile imported successfully',
        'user_profile': user_profile
    })

@user_bp.route('/user_images/<filename>')
def serve_user_image(filename):
    return send_from_directory(IMAGE_FOLDER, filename)
