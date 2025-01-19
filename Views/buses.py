

from flask import jsonify, request, Blueprint
from model import db, Buses
from werkzeug.security import generate_password_hash
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity
from flask_jwt_extended import get_jwt


Buses_bp = Blueprint("Buses_bp", __name__)

# --- Buses ---

@Buses_bp.route('/buses', methods=['GET'])
def get_all_buses():
    buses = Buses.query.all()
    return jsonify([{
        'busID': bus.busID,
        'busName': bus.busName,
        'busType': bus.busType,
        'capacity': bus.capacity,
        'operator': bus.operator,
        'registrationNumber': bus.registrationNumber,
        'amenities': bus.amenities
    } for bus in buses]), 200

@Buses_bp.route('/buses/<int:bus_id>', methods=['GET'])
def get_bus(bus_id):
    bus = Buses.query.get(bus_id)
    if bus:
        return jsonify(bus.to_json())
    return jsonify({'message': 'Bus not found'}), 404

@Buses_bp.route('/buses', methods=['POST'])
@jwt_required() # Assuming only admins can create buses
def create_bus():
    data = request.get_json()
    # ... (Validate data) ...
    new_bus = Buses(
        busName=data['busName'],
        busType=data['busType'],
        capacity=data['capacity'],
        operator=data['operator'],
        registrationNumber=data['registrationNumber'],
        amenities=data['amenities']
    )
    db.session.add(new_bus)
    db.session.commit()
    return jsonify({'message': 'Bus created successfully'}), 201

# ... UPDATE ...
@Buses_bp.route('/buses/<int:bus_id>', methods=['PUT'])
@jwt_required() # Assuming only admins can update buses
def update_bus(bus_id):
    bus = Buses.query.get(bus_id)
    if bus:
        data = request.get_json()
        # ... (Update bus fields with validation) ...
        bus.busName = data.get('busName', bus.busName)
        bus.busType = data.get('busType', bus.busType)
        bus.capacity = data.get('capacity', bus.capacity)
        bus.operator = data.get('operator', bus.operator)
        bus.registrationNumber = data.get('registrationNumber', bus.registrationNumber)
        bus.amenities = data.get('amenities', bus.amenities)
        db.session.commit()
        return jsonify({'message': 'Bus updated successfully'})
    return jsonify({'message': 'Bus not found'}), 404

@Buses_bp.route('/buses/<int:bus_id>', methods=['DELETE'])
@jwt_required() # Assuming only admins can delete buses
def delete_bus(bus_id):
    bus = Buses.query.get(bus_id)
    if bus:
        db.session.delete(bus)
        db.session.commit()
        return jsonify({'message': 'Bus deleted successfully'})
    return jsonify({'message': 'Bus not found'}), 404