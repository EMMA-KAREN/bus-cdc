from flask import jsonify, request, Blueprint
from model import db, Bookings, Users
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError

bookings_bp = Blueprint("bookings_bp", __name__)

def get_user_from_token():
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else identity.get("userID")
    return Users.query.get(user_id)

@bookings_bp.route("/bookings", methods=["POST"])
@jwt_required()
def book_bus():
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({"error": "User not found"}), 404

        booking_data = request.json
        if 'routeID' not in booking_data:
            return jsonify({"error": "'routeID' is required"}), 400

        booking = Bookings(
            userID=user.userID,
            routeID=booking_data['routeID'],
            scheduleID=booking_data['scheduleID'],
            busID=booking_data['busID'],
            seatNumbers=",".join(map(str, booking_data['seatNumbers'])),
            totalPrice=booking_data['totalPrice'],
            paymentGateway=booking_data['paymentGateway'],
            transactionID=booking_data['transactionID']
        )
        db.session.add(booking)
        db.session.commit()
        return jsonify({"message": "Booking successful"}), 201
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({"error": "Integrity error", "details": str(e.orig)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error saving booking", "details": str(e)}), 500

@bookings_bp.route('/bookings', methods=['GET'])
@jwt_required()
def get_user_bookings():
    user = get_user_from_token()
    if not user:
        return jsonify({"message": "User not found"}), 404

    requested_user_id = request.args.get('userID', type=int)
    if requested_user_id and user.role != 'admin' and requested_user_id != user.userID:
        return jsonify({"message": "Unauthorized to view other user's bookings"}), 403

    bookings = (Bookings.query.all() if user.role == 'admin' else 
                Bookings.query.filter_by(userID=user.userID).all())
    
    result = [{
        'bookingID': b.bookingID,
        'scheduleID': b.scheduleID,
        'seatNumbers': b.seatNumbers.split(','),
        'status': b.status,
        'paymentStatus': b.paymentStatus,
        'userID': b.userID, 
    } for b in bookings]
    return jsonify(result)

@bookings_bp.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    users = Users.query.all()
    result = [{
        'userID': u.userID,
        'name': u.name,
        'email': u.email,
        'role': u.role
    } for u in users]
    return jsonify(result), 200

@bookings_bp.route('/bookings/<int:bookingID>', methods=['PUT'])
@jwt_required()
def update_booking(bookingID):
    user = get_user_from_token()
    if not user:
        return jsonify({"message": "User not found"}), 404

    booking = Bookings.query.get(bookingID)
    if not booking or (booking.userID != user.userID and user.role != 'admin'):
        return jsonify({"message": "Unauthorized"}), 403

    data = request.get_json()
    booking.seatNumbers = ','.join(map(str, data.get('seatNumbers', booking.seatNumbers.split(','))))
    booking.totalPrice = data.get('totalPrice', booking.totalPrice)

    db.session.commit()
    return jsonify({"message": "Booking updated"})

@bookings_bp.route('/bookings/<int:bookingID>', methods=['DELETE'])
@jwt_required()
def delete_booking(bookingID):
    user = get_user_from_token()
    if not user:
        return jsonify({"message": "User not found"}), 404

    booking = Bookings.query.get(bookingID)
    if not booking or (booking.userID != user.userID and user.role != 'admin'):
        return jsonify({"message": "Unauthorized"}), 403
    
    db.session.delete(booking)
    db.session.commit()
    return jsonify({"message": "Booking deleted successfully"}), 200

@bookings_bp.route('/bookings/<int:booking_id>/admin/status', methods=['PUT'])
@jwt_required()
def update_booking_status(booking_id):
    current_user = get_user_from_token()
    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "Unauthorized"}), 403

    # Debugging: Print request JSON
    print("Received data:", request.json)

    data = request.json
    if not data or "status" not in data:
        return jsonify({"error": "Missing required fields"}), 422

    new_status = data.get("status")
    new_payment_status = data.get("paymentStatus")  # Ensure correct spelling

    booking = Bookings.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    booking.status = new_status
    if new_payment_status is not None:
        booking.payment_status = new_payment_status

    db.session.commit()
    return jsonify({"message": "Booking status updated successfully"}), 200


def send_confirmation_message_to_user(userID, bookingID):
    user = Users.query.get(userID)
    if user:
        message = f"Your booking {bookingID} has been confirmed."
        print(f"Sending email to {user.email}: {message}")
    else:
        print("User not found, unable to send confirmation.")