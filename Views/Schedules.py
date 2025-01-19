from flask import jsonify, request, Blueprint
from model import db, Schedules
from werkzeug.security import generate_password_hash
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity
from flask_jwt_extended import get_jwt


schedules_bp = Blueprint("schedules_bp", __name__)
# --- Schedules ---

@schedules_bp.route('/schedules', methods=['GET'])
def get_all_schedules():
    schedules = Schedules.query.all()
    return jsonify([schedule.to_json() for schedule in schedules])

@schedules_bp.route('/schedules/<int:schedule_id>', methods=['GET'])
def get_schedule(schedule_id):
    schedule = Schedules.query.get(schedule_id)
    if schedule:
        return jsonify(schedule.to_json())
    return jsonify({'message': 'Schedule not found'}), 404

@schedules_bp.route('/schedules', methods=['POST'])
@jwt_required() # Assuming only admins can create schedules
def create_schedule():
    data = request.get_json()
    # ... (Validate data) ...
    new_schedule = Schedules(
        busID=data['busID'],
        routeID=data['routeID'],
        departureTime=data['departureTime'],
        arrivalTime=data['arrivalTime'],
        fare=data['fare'],
        daysOfOperation=data['daysOfOperation']
    )
    db.session.add(new_schedule)
    db.session.commit()
    return jsonify({'message': 'Schedule created successfully'}), 201

@schedules_bp.route('/schedules/<int:schedule_id>', methods=['PUT'])
@jwt_required() # Assuming only admins can update schedules
def update_schedule(schedule_id):
    schedule = Schedules.query.get(schedule_id)
    if schedule:
        data = request.get_json()
        # ... (Update schedule fields with validation) ...
        schedule.busID = data.get('busID', schedule.busID)
        schedule.routeID = data.get('routeID', schedule.routeID)
        schedule.departureTime = data.get('departureTime', schedule.departureTime)
        schedule.arrivalTime = data.get('arrivalTime', schedule.arrivalTime)
        schedule.fare = data.get('fare', schedule.fare)
        schedule.daysOfOperation = data.get('daysOfOperation', schedule.daysOfOperation)
        db.session.commit()
        return jsonify({'message': 'Schedule updated successfully'})
    return jsonify({'message': 'Schedule not found'}), 404

@schedules_bp.route('/schedules/<int:schedule_id>', methods=['DELETE'])
@jwt_required() # Assuming only admins can delete schedules
def delete_schedule(schedule_id):
    schedule = Schedules.query.get(schedule_id)
    if schedule:
        db.session.delete(schedule)
        db.session.commit()
        return jsonify({'message': 'Schedule deleted successfully'})
    return jsonify({'message': 'Schedule not found'}), 404
