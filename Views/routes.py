
from flask_jwt_extended import jwt_required

from flask import jsonify, request, Blueprint
from model import db, Routes
from werkzeug.security import generate_password_hash

routes_bp = Blueprint("routes_bp", __name__)
# --- Routes ---

@routes_bp.route('/routes', methods=['GET'])
def get_all_routes():
    routes = Routes.query.all()
    return jsonify([route.to_json() for route in routes])

@routes_bp.route('/routes/<int:route_id>', methods=['GET'])
def get_route(route_id):
    route = Routes.query.get(route_id)
    if route:
        return jsonify(route.to_json())
    return jsonify({'message': 'Route not found'}), 404

@routes_bp.route('/routes', methods=['POST'])
@jwt_required() # Assuming only admins can create routes
def create_route():
    data = request.get_json()
    # ... (Validate data) ...
    new_route = Routes(
        origin=data['origin'],
        destination=data['destination'],
        distance=data['distance'],
        estimatedDuration=data['estimatedDuration']
    )
    db.session.add(new_route)
    db.session.commit()
    return jsonify({'message': 'Route created successfully'}), 201

@routes_bp.route('/routes/<int:route_id>', methods=['PUT'])
@jwt_required() # Assuming only admins can update routes
def update_route(route_id):
    route = Routes.query.get(route_id)
    if route:
        data = request.get_json()
        # ... (Update route fields with validation) ...
        route.origin = data.get('origin', route.origin)
        route.destination = data.get('destination', route.destination)
        route.distance = data.get('distance', route.distance)
        route.estimatedDuration = data.get('estimatedDuration', route.estimatedDuration)
        db.session.commit()
        return jsonify({'message': 'Route updated successfully'})
    return jsonify({'message': 'Route not found'}), 404

@routes_bp.route('/routes/<int:route_id>', methods=['DELETE'])
@jwt_required() # Assuming only admins can delete routes
def delete_route(route_id):
    route = Routes.query.get(route_id)
    if route:
        db.session.delete(route)
        db.session.commit()
        return jsonify({'message': 'Route deleted successfully'})
    return jsonify({'message': 'Route not found'}), 404