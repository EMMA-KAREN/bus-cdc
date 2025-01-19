
from flask import jsonify, request, Blueprint
from model import db, Bookings
from flask_jwt_extended import jwt_required, get_jwt_identity



bookings_bp = Blueprint("bookings_bp", __name__)
# --- Bookings ---

@bookings_bp.route('/bookings')
def get_users_bookings():
    users_with_bookings = db.session.query(Users, Bookings, Buses, Routes).join(Bookings).join(Buses).join(Routes).all()
    
    result = []
    for user, booking, bus, route in users_with_bookings:
        result.append({
            'user_id': user.id,
            'username': user.username,
            'bus_name': bus.bus_name,
            'route_name': route.route_name
        })
    
    return jsonify(result)