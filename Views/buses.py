
# CRUD operations (Create, Read, Update, Delete)
# JWT-based authentication is used for secure access, allowing only authorized users to create, update, or delete buses.

from flask import jsonify, request, Blueprint
from model import db, Buses
from flask_jwt_extended import jwt_required


Buses_bp = Blueprint("Buses_bp", __name__)

# --- Buses ---
# GET /buses (all buses)

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

# get bus by id
@Buses_bp.route('/buses/<int:bus_id>', methods=['GET'])
def get_bus(bus_id):
    bus = Buses.query.get(bus_id)
    if bus:
        return jsonify(bus.to_json()),200
    return jsonify({'message': 'Bus not found'}), 404

# POST /buses (create a new bus)---- Allows authenticated users
@Buses_bp.route('/buses', methods=['POST'])
@jwt_required()
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

# ... UPDATE  buses based on id ...Allows authenticated users 
@Buses_bp.route('/buses/<int:bus_id>', methods=['PUT'])
@jwt_required()
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

# ... DELETE buses based on id ...Allows authenticated users
@Buses_bp.route('/buses/<int:bus_id>', methods=['DELETE'])
@jwt_required() # Assuming only admins can delete buses
def delete_bus(bus_id):
    bus = Buses.query.get(bus_id)
    if bus:
        db.session.delete(bus)
        db.session.commit()
        return jsonify({'message': 'Bus deleted successfully'})
    return jsonify({'message': 'Bus not found'}), 404