from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import Column, Integer, String, Text, Date, Enum as SqlEnum

metadata = MetaData()

db = SQLAlchemy(metadata=metadata)

# Define GenderEnum as a Python enum with explicit values.
class GenderEnum(PyEnum):
    Male = 'Male'
    Female = 'Female'
    Other = 'Other'

# Users table storing user information.
class Users(db.Model):
    __tablename__ = 'Users'

    userID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    firstName = db.Column(db.String(50), nullable=False)
    lastName = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(512), nullable=False)
    phoneNumber = db.Column(db.String(20), nullable=True)
    address = db.Column(db.Text, nullable=True)
    date_of_birth = db.Column(db.Date, nullable=True)
    # Provide a name for the enum so PostgreSQL can create it properly.
    gender = db.Column(SqlEnum(GenderEnum, name='gender_enum'), nullable=False)
    profilePicture = db.Column(db.Text, nullable=True)
    role = db.Column(db.String(50), nullable=True)
    bookings = db.relationship("Bookings", back_populates="user")

# Buses table with bus details.
class Buses(db.Model):
    __tablename__ = 'Buses'

    busID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    busName = db.Column(db.String(50), nullable=False)
    busType = db.Column(db.String(50), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    operator = db.Column(db.String(100), nullable=False)
    registrationNumber = db.Column(db.String(20), unique=True, nullable=False)
    amenities = db.Column(db.Text)

    def to_json(self):
        return {
            'busID': self.busID,
            'busName': self.busName,
            'busType': self.busType,
            'capacity': self.capacity,
            'operator': self.operator,
            'registrationNumber': self.registrationNumber,
            'amenities': self.amenities
        }

# Routes table for storing route information.
class Routes(db.Model):
    __tablename__ = 'Routes'

    routeID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    origin = db.Column(db.String(100), nullable=False)
    destination = db.Column(db.String(100), nullable=False)
    distance = db.Column(db.Float)
    estimatedDuration = db.Column(db.Integer)  # Duration in minutes
    
    def to_json(self):
        return {
            "routeID": self.routeID,
            "origin": self.origin,
            "destination": self.destination,
            "distance": self.distance,
            "estimatedDuration": self.estimatedDuration
        }

# Schedules table linking buses and routes with timing and fare details.
class Schedules(db.Model):
    __tablename__ = 'Schedules'

    scheduleID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    busID = db.Column(db.Integer, db.ForeignKey('Buses.busID'), nullable=False)
    routeID = db.Column(db.Integer, db.ForeignKey('Routes.routeID'), nullable=False)
    departureTime = db.Column(db.DateTime, nullable=False)
    arrivalTime = db.Column(db.DateTime, nullable=False)
    fare = db.Column(db.Float, nullable=False)
    daysOfOperation = db.Column(db.String)  # e.g., "Monday,Tuesday,Wednesday"

    bus = db.relationship('Buses', backref=db.backref('schedules', lazy=True))
    route = db.relationship('Routes', backref=db.backref('schedules', lazy=True))
    
    def to_json(self):
        return {
            "scheduleID": self.scheduleID,
            "busID": self.busID,
            "routeID": self.routeID,
            "departureTime": self.departureTime,
            "arrivalTime": self.arrivalTime,
            "fare": self.fare,
            "daysOfOperation": self.daysOfOperation,
        }

# Bookings table with ENUM columns that now include names.
class Bookings(db.Model):
    __tablename__ = 'Bookings'

    bookingID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    userID = db.Column(db.Integer, db.ForeignKey('Users.userID'), nullable=False)
    routeID = db.Column(db.Integer, db.ForeignKey('Routes.routeID'), nullable=False)
    scheduleID = db.Column(db.Integer, db.ForeignKey('Schedules.scheduleID'), nullable=False)
    busID = db.Column(db.Integer, db.ForeignKey('Buses.busID'), nullable=False)
    seatNumbers = db.Column(db.String, nullable=False)
    bookingDate = db.Column(db.DateTime, default=datetime.utcnow)
    totalPrice = db.Column(db.Float, nullable=False)
    # Add a name to the enum so that PostgreSQL ENUM type requirements are met.
    status = db.Column(SqlEnum('Confirmed', 'Cancelled', 'Pending', 'Completed', name='booking_status_enum'), default='Pending')
    paymentStatus = db.Column(SqlEnum('Paid', 'Unpaid', name='payment_status_enum'), default='Unpaid')
    paymentGateway = db.Column(db.String(50))
    transactionID = db.Column(db.String(100), unique=True)
    
    user = db.relationship("Users", back_populates="bookings")
    schedule = db.relationship('Schedules', backref=db.backref('bookings', lazy=True))
    bus = db.relationship('Buses', backref=db.backref('bookings', lazy=True))
    route = db.relationship('Routes', backref=db.backref('bookings', lazy=True))

# SeatLayout table to store the seating layout as JSON.
class SeatLayout(db.Model):
    __tablename__ = 'SeatLayout'

    seatLayoutID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    busID = db.Column(db.Integer, db.ForeignKey('Buses.busID'), nullable=False, unique=True)
    seatMap = db.Column(db.JSON)

    bus = db.relationship('Buses', backref=db.backref('seat_layout', uselist=False, lazy=True))

# TokenBlocklist table to store revoked JWT tokens.
class TokenBlocklist(db.Model):
    __tablename__ = 'token_blocklist'
    
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(255), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
