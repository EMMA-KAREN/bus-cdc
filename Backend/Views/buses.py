from flask import Flask, jsonify, request, Blueprint
from flask_cors import CORS
from flask_jwt_extended import jwt_required
from model import db, Buses

app = Flask(__name__)
CORS(app)

Buses_bp = Blueprint("Buses_bp", __name__)

VALID_BUS_TYPES = ["AC Sleeper", "Non-AC Seat", "AC Seater", "Luxury"]

# GET all buses
@Buses_bp.route('/buses', methods=['GET'])
def get_all_buses():
    buses = Buses.query.all()
    return jsonify([bus.to_json() for bus in buses]), 200

# GET bus by ID
@Buses_bp.route('/buses/<int:bus_id>', methods=['GET'])
def get_bus(bus_id):
    bus = Buses.query.get(bus_id)
    if bus:
        return jsonify(bus.to_json()), 200
    return jsonify({'message': 'Bus not found'}), 404

# CREATE a new bus
@Buses_bp.route('/buses', methods=['POST'])
@jwt_required()
def add_bus():
    data = request.get_json()
    
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    bus_type = data.get('busType')
    if bus_type not in VALID_BUS_TYPES:
        return jsonify({'message': f"Invalid bus type. Valid types: {', '.join(VALID_BUS_TYPES)}"}), 400

    if Buses.query.filter_by(registrationNumber=data.get('registrationNumber')).first():
        return jsonify({'message': 'Registration number already exists'}), 400

    new_bus = Buses(
        busName=data['busName'],
        busType=bus_type,
        capacity=data['capacity'],
        operator=data['operator'],
        registrationNumber=data['registrationNumber'],
        amenities=data.get('amenities', "")
    )
    db.session.add(new_bus)
    db.session.commit()
    return jsonify({'message': 'Bus created successfully', 'busID': new_bus.busID}), 201

# UPDATE a bus
@Buses_bp.route('/buses/<int:bus_id>', methods=['PUT'])
@jwt_required()
def update_bus(bus_id):
    bus = Buses.query.get(bus_id)
    if not bus:
        return jsonify({'message': 'Bus not found'}), 404

    data = request.get_json()
    bus.busName = data.get('busName', bus.busName)
    bus.busType = data.get('busType', bus.busType)
    bus.capacity = data.get('capacity', bus.capacity)
    bus.operator = data.get('operator', bus.operator)
    bus.registrationNumber = data.get('registrationNumber', bus.registrationNumber)
    bus.amenities = data.get('amenities', bus.amenities)

    db.session.commit()
    return jsonify({'message': 'Bus updated successfully'}), 200

# DELETE a bus
@Buses_bp.route('/buses/<int:bus_id>', methods=['DELETE'])
@jwt_required()
def delete_bus(bus_id):
    bus = Buses.query.get(bus_id)
    if not bus:
        return jsonify({'message': 'Bus not found'}), 404

    db.session.delete(bus)
    db.session.commit()
    return jsonify({'message': 'Bus deleted successfully'}), 200
