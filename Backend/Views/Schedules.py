
#  schedules with CRUD operations (Create, Read, Update, Delete). 
# It allows users to view all schedules, retrieve specific schedules by ID,
#  create new schedules, update existing schedules, and delete schedules,
#   JWT-based authentication for secure access.


from flask import jsonify, request, Blueprint
from model import db, Schedules
from flask_jwt_extended import jwt_required, get_jwt_identity
# from flask_jwt_extended import jwt_required

from datetime import datetime

schedules_bp = Blueprint("schedules_bp", __name__)
# --- Schedules ---
# GET /schedules means get all schedules then eturns the schedule data in JSON format.
@schedules_bp.route('/schedules', methods=['GET'])
def get_all_schedules():
    schedules = Schedules.query.all()
    return jsonify([schedule.to_json() for schedule in schedules])

#  ----Retrieves a specific schedule based on its schedule_id.
@schedules_bp.route('/schedules/<int:schedule_id>', methods=['GET'])
def get_schedule(schedule_id):
    schedule = Schedules.query.get(schedule_id)
    if schedule:
        return jsonify(schedule.to_json())
    return jsonify({'message': 'Schedule not found'}), 404

# ---Allows authenticated users (using JWT) to create a new schedule by providing necessary details ---
# --- Create a new schedule
@schedules_bp.route('/schedules', methods=['POST'])
@jwt_required()
def create_schedule():
    current_user = get_jwt_identity()
    data = request.get_json()

    try:
        new_schedule = Schedules(
            busID=int(data['busID']),
            routeID=int(data['routeID']),
            departureTime=datetime.fromisoformat(data['departureTime']),  # Updated
            arrivalTime=datetime.fromisoformat(data['arrivalTime']),      # Updated
            fare=float(data['fare']),
            daysOfOperation=data['daysOfOperation']
        )
        db.session.add(new_schedule)
        db.session.commit()
        return jsonify({'message': 'Schedule created successfully'}), 201
    except ValueError as e:
        return jsonify({'error': 'Invalid date format. Use ISO format'}), 400

# put means update 
# ---Allows authenticated users (using JWT) to update a specific schedule by providing its schedule_id and
@schedules_bp.route('/schedules/<int:schedule_id>', methods=['PUT'])
@jwt_required()
def update_schedule(schedule_id):
    try:
        schedule = Schedules.query.get(schedule_id)
        if not schedule:
            return jsonify({"message": "Schedule not found"}), 404
        
        data = request.get_json()

        # Update fields only if they are provided in the request
        if 'departureTime' in data:
            schedule.departureTime = datetime.strptime(data['departureTime'], '%Y-%m-%dT%H:%M')
        if 'arrivalTime' in data:
            schedule.arrivalTime = datetime.strptime(data['arrivalTime'], '%Y-%m-%dT%H:%M')
        if 'routeID' in data:
            schedule.routeID = data['routeID']
        if 'fare' in data:
            schedule.fare = float(data['fare'])
        if 'daysOfOperation' in data:
            schedule.daysOfOperation = data['daysOfOperation']

        db.session.commit()

        return jsonify({
            "message": "Schedule updated successfully",
            "schedule": {
                "scheduleID": schedule.scheduleID,
                "routeID": schedule.routeID,
                "departureTime": schedule.departureTime,
                "arrivalTime": schedule.arrivalTime,
                "fare": schedule.fare,
                "daysOfOperation": schedule.daysOfOperation
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

# delete means delete
# ---Allows authenticated users (using JWT) to delete a specific schedule by providing its schedule_id ---
@schedules_bp.route('/schedules/<int:schedule_id>', methods=['DELETE'])
@jwt_required() 
def delete_schedule(schedule_id):
    schedule = Schedules.query.get(schedule_id)
    if schedule:
        db.session.delete(schedule)
        db.session.commit()
        return jsonify({'message': 'Schedule deleted successfully'})
    return jsonify({'message': 'Schedule not found'}), 404
