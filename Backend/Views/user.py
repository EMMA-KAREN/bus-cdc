from flask import jsonify, request, Blueprint
from model import db, Users, TokenBlocklist
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity, get_jwt
from flask_mail import Mail, Message
import secrets
import re
from datetime import datetime
from enum import Enum


class GenderEnum(Enum):
    MALE = "Male"
    FEMALE = "Female"
    OTHER = "Other"

user_bp = Blueprint("user_bp", __name__)

# Initialize Flask-Mail
mail = Mail()



# Validate password strength
def validate_password_strength(password):
    """Check if the password meets the required strength."""
    pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$'
    return re.match(pattern, password) is not None

def send_email(recipient, subject, body):
    msg = Message(
        subject=subject,
        sender='your-email@example.com',  # Replace with your sender email
        recipients=[recipient],
        body=body
    )
    mail.send(msg)

# User Registration
# User Registration
@user_bp.route('/register', methods=['POST'])
def register_user():
    data = request.json

    # Check if email already exists
    if Users.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400

    # Validate password strength
    if not validate_password_strength(data['password']):
        return jsonify({'error': 'Password must meet the required strength.'}), 400

    # Default role to "user" if not provided, or use provided role
    role = data.get('role', 'user').lower()
    if role not in ['user', 'admin']:
        return jsonify({'error': 'Invalid role specified'}), 400

    # Gender validation and capitalization
    gender = data.get('gender', '').capitalize()
    valid_genders = ['Male', 'Female', 'Other']
    if gender not in valid_genders:
        return jsonify({'error': 'Invalid gender value. Valid values are: Male, Female, Other.'}), 400

    # Hash password and create a new user
    hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')
    new_user = Users(
        firstName=data['firstName'],
        lastName=data['lastName'],
        email=data['email'],
        password=hashed_password,
        phoneNumber=data.get('phoneNumber'),
        address=data.get('address'),
        date_of_birth=datetime.strptime(data.get('dateOfBirth', '2025-01-15'), '%Y-%m-%d').date(),
        gender=gender,
        role=role,
        profilePicture=data.get('profilePicture', '')
    )

    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully'}), 201

# User Login
# User Login
@user_bp.route('/login', methods=['POST'])
def login_user():
    data = request.json

    
    user = Users.query.filter_by(email=data['email']).first()

    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'error': "Either email/password is incorrect"}), 401

    # Generate access token
    access_token = create_access_token(identity={'userID': user.userID, 'role': user.role})

    
    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'role': user.role  # Include the user's role in the response
    }), 200


# Get Current User
@user_bp.route('/current_user', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_identity = get_jwt_identity()
    print("JWT Identity:", current_user_identity)  # Debugging

    if not isinstance(current_user_identity, dict) or 'userID' not in current_user_identity:
        return jsonify({'error': 'Invalid token structure'}), 401

    user = Users.query.get(current_user_identity['userID'])
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'userID': user.userID,
        'firstName': user.firstName,
        'lastName': user.lastName,
        'email': user.email,
        'role': user.role,
        'phoneNumber': user.phoneNumber,
        'address': user.address,
        'dateOfBirth': user.date_of_birth,
        'gender': user.gender.name
    }), 200


# Update User Profile
@user_bp.route('/user/update', methods=['PUT'])  # Removed {userId} from URL
@jwt_required()
def update_user_profile():
    user_id = get_jwt_identity()['userID']  # Get logged-in user's ID
    user = Users.query.get(user_id)


   
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.json

    print("Received Data:", data)

    user_id = get_jwt_identity()['userID']  # Get logged-in user's ID


    if not data:
        return jsonify({'msg': 'Missing JSON data'}), 400

    try:
        user.firstName = data.get('firstName', user.firstName)
        user.lastName = data.get('lastName', user.lastName)
        user.email = data.get('email', user.email)
        user.phoneNumber = data.get('phoneNumber', user.phoneNumber)
        user.address = data.get('address', user.address)
        user.profilePicture = data.get('profilePicture', user.profilePicture)

        if 'dateOfBirth' in data and data['dateOfBirth']:
            try:
               user.date_of_birth = datetime.strptime(data['dateOfBirth'], '%Y-%m-%d').date()
            except ValueError:
              return jsonify({'error': 'Invalid date format, expected YYYY-MM-DD'}), 400

        if 'gender' in data:
            valid_genders = ['Male', 'Female', 'Other']
            gender_value = data['gender'].capitalize()
            if gender_value not in valid_genders:
                return jsonify({'error': 'Invalid gender value'}), 400
            user.gender = gender_value

        db.session.commit()

        return jsonify({'message': 'Profile updated successfully', 'user': {
            'firstName': user.firstName,
            'lastName': user.lastName,
            'email': user.email,
            'phoneNumber': user.phoneNumber,
            'address': user.address,
            'dateOfBirth': str(user.date_of_birth),
            'gender': user.gender,
            'profilePicture': user.profilePicture
        }}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'msg': 'Failed to update profile', 'error': str(e)}), 500

# Update User Password
@user_bp.route('/user/updatepassword', methods=['PUT'])
@jwt_required()
def update_user_password():
    user_id = get_jwt_identity()['userID']

    user = Users.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.json  

    if not data.get('old_password') or not data.get('new_password'):
        return jsonify({'error': 'Both old and new passwords are required'}), 400

    if not check_password_hash(user.password, data['old_password']):
        return jsonify({'error': 'Old password is incorrect'}), 400

    if check_password_hash(user.password, data['new_password']):
        return jsonify({'error': 'New password must be different from the old password'}), 400

    user.password = generate_password_hash(data['new_password'], method='pbkdf2:sha256')
    db.session.commit()

    return jsonify({'message': 'Password updated successfully'}), 200

# Forgot Password
@user_bp.route('/forgot_password', methods=['POST'])
def forgot_password():
    data = request.json
    email = data.get('email')

    user = Users.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'Email not found'}), 404

    reset_token = secrets.token_urlsafe(32)
    user.reset_token = reset_token
    user.reset_token_expiration = datetime.now() + timedelta(hours=1)
    db.session.commit()

    try:
        send_email(
            recipient=email,
            subject='Password Reset Request',
            body=f"Hi {user.firstName},\n\n"
                 f"Use this token to reset your password: {reset_token}\n\n"
                 f"This token expires in 1 hour.\n\nBest regards,\nThe Team"
        )
    except Exception as e:
        return jsonify({'error': f"Failed to send password reset email: {str(e)}"}), 500

    return jsonify({'message': 'Password reset email sent'}), 200

# Reset Password
@user_bp.route('/reset_password', methods=['POST'])
def reset_password():
    data = request.json
    token = data.get('token')
    new_password = data.get('new_password')

    user = Users.query.filter_by(reset_token=token).first()

    if not user or user.reset_token_expiration < datetime.now():
        return jsonify({'error': 'Invalid or expired token'}), 400

    if not validate_password_strength(new_password):
        return jsonify({'error': 'Password must meet the required strength.'}), 400

    user.password = generate_password_hash(new_password, method='pbkdf2:sha256')
    user.reset_token = None
    user.reset_token_expiration = None
    db.session.commit()

    return jsonify({'message': 'Password reset successful'}), 200

# Delete User Account
@user_bp.route('/user/delete_account', methods=['DELETE'])
@jwt_required()
def delete_user_account():
    user_id = get_jwt_identity()['userID']
    user = Users.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'Account deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()  # Rollback if something goes wrong
        return jsonify({'error': f'Error deleting account: {str(e)}'}), 500
    

# @user_bp.route('/logout', methods=['POST'])
# @jwt_required()
# def logout_user():
#     jti = get_jwt()['jti']  # Get the JWT identifier
#     # Add the JTI to a blocklist so the token can't be used again
#     new_token = TokenBlocklist(jti=jti)
#     db.session.add(new_token)
#     db.session.commit()
#     return jsonify({'message': 'Successfully logged out'}), 200
