
# user-related actions such as registering,
#  logging in, 
# updating profile information, 
# changing passwords, 
# deleting accounts,
# logging out using JWT-based authentication for secure access to protected routes.


from flask import jsonify, request, Blueprint
from model import db, Users, TokenBlocklist
from werkzeug.security import generate_password_hash,  check_password_hash
from datetime import datetime

from datetime import timezone
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity, get_jwt

from flask_mail import Mail, Message

user_bp = Blueprint("user_bp", __name__)


@user_bp.route('/users', methods=['GET'])
def get_users():
    return "User Blueprint is working!"



# User Registration -----registers a user if email is unique ,validates D.O.B string to object-----
# Initialize Flask-Mail
mail = Mail()

@user_bp.route('/register', methods=['POST'])
def register_user():
    data = request.json

    # Check if email already exists before registering a user
    if Users.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400

    # Convert the dateOfBirth string to a date object
    date_of_birth = datetime.strptime(data['dateOfBirth'], '%Y-%m-%d').date() if data.get('dateOfBirth') else None

    # Normalize gender input
    gender = data.get('gender', '').capitalize()
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
        gender=gender
    )

    # Add and commit the new user
    db.session.add(new_user)
    db.session.commit()

    # Send a confirmation email
    try:
        send_email(
            recipient=data['email'],
            subject='Welcome to the Bus Booking System',
            body=f"Hi {new_user.firstName},\n\n"
                 f"Thank you for registering! You can now book buses and routes using our platform.\n\n"
                 f"Best regards,\nThe Team"
        )
    except Exception as e:
        return jsonify({'error': f"User registered, but email sending failed: {str(e)}"}), 500

    return jsonify({'message': 'User registered successfully'}), 201

# User Login -----checks if email and password are valid, returns a JWT token if they are-----
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

def send_email(recipient, subject, body):
    msg = Message(
        subject=subject,
        sender='emmaculate.mwikali@student.moringaschool.com',  # Replace with your sender email
        recipients=[recipient],
        body=body
    )
    mail.send(msg)


# Get Current User ---retrive data of currently log in user  using  jwt to authenicate
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

# Update User Profile  for those log in user  
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

# Update User Password for only users who have log in 
@user_bp.route('/user/updatepassword', methods=['PUT'])
@jwt_required()
def update_user_password():
     # Get the ID of the logged-in user
    user_id = get_jwt_identity() 
    # Retrieve the user from the database
    user = Users.query.get(user_id)  

    # If the user is not found, return an error ---- Parse the incoming JSON request
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.json  

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