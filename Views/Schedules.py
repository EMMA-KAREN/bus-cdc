from flask import jsonify, request, Blueprint
from model import db, Schedules

from flask_jwt_extended import jwt_required

from datetime import datetime

schedules_bp = Blueprint("schedules_bp", __name__)
# --- Schedules ---
# GET /schedules means get all schedules
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

# --- creating new Schedules ---
@schedules_bp.route('/schedules', methods=['POST'])
@jwt_required() 
def create_schedule():
    data = request.get_json()
    
    # Validate and parse datetime fields
    try:
        departure_time = datetime.strptime(data['departureTime'], '%I:%M %p')  # Example format: '09:00 AM'
        arrival_time = datetime.strptime(data['arrivalTime'], '%I:%M %p')      # Example format: '11:00 AM'
    except ValueError as e:
        return jsonify({'message': 'Invalid time format. Use HH:MM AM/PM'}), 400

    # Create a new schedule
    new_schedule = Schedules(
        busID=data['busID'],
        routeID=data['routeID'],
        departureTime=departure_time,
        arrivalTime=arrival_time,
        fare=data['fare'],
        daysOfOperation=data['daysOfOperation']
    )
    db.session.add(new_schedule)
    db.session.commit()
  
    return jsonify({'message': 'Schedule created successfully'}), 201
# put means update 
@schedules_bp.route('/schedules/<int:schedule_id>', methods=['PUT'])
@jwt_required() 
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
@jwt_required() 
def delete_schedule(schedule_id):
    schedule = Schedules.query.get(schedule_id)
    if schedule:
        db.session.delete(schedule)
        db.session.commit()
        return jsonify({'message': 'Schedule deleted successfully'})
    return jsonify({'message': 'Schedule not found'}), 404
