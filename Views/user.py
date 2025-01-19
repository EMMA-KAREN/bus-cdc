

from flask import jsonify, request, Blueprint
from model import db, Users, TokenBlocklist
from werkzeug.security import generate_password_hash,  check_password_hash
from datetime import datetime, timedelta

from datetime import timezone
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity, get_jwt



user_bp = Blueprint("user_bp", __name__)


@user_bp.route('/users', methods=['GET'])
def get_users():
    return "User Blueprint is working!"



# User Registration
@user_bp.route('/register', methods=['POST'])
def register_user():
    data = request.json

    # Check if email already exists
    if Users.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400

    # Convert the dateOfBirth string to a date object
    date_of_birth = datetime.strptime(data['dateOfBirth'], '%Y-%m-%d').date() if data.get('dateOfBirth') else None

    # Normalize gender input
    gender = data.get('gender', '').capitalize()  # Capitalize 'female' to 'Female'

    # Validate that the gender is among allowed values
    allowed_genders = ['Male', 'Female', 'Other']
    if gender not in allowed_genders:
        return jsonify({'error': f"Invalid gender. Allowed values: {', '.join(allowed_genders)}"}), 400

    # Hash the password
    hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')

    # Create a new user instance
    new_user = Users(
        firstName=data['firstName'],
        lastName=data['lastName'],
        email=data['email'],
        password=hashed_password,
        phoneNumber=data.get('phoneNumber'),
        address=data.get('address'),
        dateOfBirth=date_of_birth,
        gender=gender  # Use normalized gender
    )

    # Add and commit the new user
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

# User Login
@user_bp.route('/login', methods=['POST'])
def login_user():
    data = request.json
    user = Users.query.filter_by(email=data['email']).first()

    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'error': "Either email/password is incorrect"}), 401

    # Generate access token
    access_token = create_access_token(identity=user.userID)
    
    return jsonify({
        'message': 'Login successful',
        'access_token': access_token
    }), 200



# Get Current User 
@user_bp.route('/current_user', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    user = Users.query.get(current_user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'userID': user.userID,
        'firstName': user.firstName,
        'lastName': user.lastName,
        'email': user.email,
        'phoneNumber': user.phoneNumber,
        'address': user.address,
        'dateOfBirth': user.dateOfBirth,
        'gender': user.gender
    }), 200

# Update User Profile (protected)
@user_bp.route('/user/update', methods=['PUT'])
@jwt_required()
def update_user_profile():
    user_id = get_jwt_identity()
    user = Users.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.json
    user.firstName = data.get('firstName', user.firstName)
    user.lastName = data.get('lastName', user.lastName)
    user.phoneNumber = data.get('phoneNumber', user.phoneNumber)
    user.address = data.get('address', user.address)
    db.session.commit()
    return jsonify({'message': 'Profile updated successfully'}), 200

# Update User Password (protected)
@user_bp.route('/user/updatepassword', methods=['PUT'])
@jwt_required()
def update_user_password():
    user_id = get_jwt_identity()  # Get the ID of the logged-in user
    user = Users.query.get(user_id)  # Retrieve the user from the database

    # If the user is not found, return an error
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.json  # Parse the incoming JSON request

    # Validate that both old_password and new_password are present
    if not data.get('old_password') or not data.get('new_password'):
        return jsonify({'error': 'Both old and new passwords are required'}), 400

    # Verify the old password
    if not check_password_hash(user.password, data['old_password']):
        return jsonify({'error': 'Old password is incorrect'}), 400

    # Check if the new password is the same as the old password
    if check_password_hash(user.password, data['new_password']):
        return jsonify({'error': 'New password must be different from the old password'}), 400

    # Hash and update the password
    user.password = generate_password_hash(data['new_password'], method='pbkdf2:sha256')

    # Commit the changes to the database
    db.session.commit()

    return jsonify({'message': 'Password updated successfully'}), 200

# Delete User Account (protected)
@user_bp.route('/user/delete_account', methods=['DELETE'])
@jwt_required()
def delete_user_account():
    user_id = get_jwt_identity()
    user = Users.query.get(user_id)
    if user:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'Account deleted successfully'})
    return jsonify({'message': 'User not found'}), 404

#--- log out 

@user_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    now = datetime.now(timezone.utc)
    db.session.add(TokenBlocklist(jti=jti, created_at=now))
    db.session.commit()
    return jsonify({"success ":"Logged out successfully"})