from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from datetime import datetime
metadata = MetaData()

db=SQLAlchemy(metadata=metadata)


class Users(db.Model):
    __tablename__ = 'Users'

    userID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    firstName = db.Column(db.String(50), nullable=False)
    lastName= db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    phoneNumber= db.Column(db.String(20))
    address = db.Column(db.Text)
    dateOfBirth= db.Column(db.Date)
    gender = db.Column(db.Enum('Male', 'Female', 'Other'))
    profilePicture= db.Column(db.Text) 

    bookings = db.relationship('Bookings', backref='user', lazy=True)

class Buses(db.Model):
    __tablename__ = 'Buses'

    busID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    busName = db.Column(db.String(50), nullable=False)
    busType = db.Column(db.Enum('AC Sleeper', 'Non-AC Seater', 'AC Seater', 'Luxury'), nullable=False)
    capacity= db.Column(db.Integer, nullable=False)
    operator= db.Column(db.String(100), nullable=False)
    registrationNumber = db.Column(db.String(20), unique=True)
    amenities = db.Column(db.Text)

class Routes(db.Model):
    __tablename__ = 'Routes'

    routeID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    origin= db.Column(db.String(100), nullable=False)
    destination= db.Column(db.String(100), nullable=False)
    distance= db.Column(db.Float)
    estimatedDuration= db.Column(db.Integer) # Store duration in minutes

class Schedules(db.Model):
    __tablename__ = 'Schedules'

    scheduleID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    busID= db.Column(db.Integer, db.ForeignKey('Buses.busID'), nullable=False)
    routeID = db.Column(db.Integer, db.ForeignKey('Routes.routeID'), nullable=False)
    departureTime = db.Column(db.DateTime, nullable=False)
    arrivalTime = db.Column(db.DateTime, nullable=False)
    fare = db.Column(db.Float, nullable=False)
    daysOfOperation= db.Column(db.String) # Store as a comma-separated string (e.g., "Monday,Tuesday,Wednesday")

    bus = db.relationship('Buses', backref=db.backref('schedules', lazy=True))
    route = db.relationship('Routes', backref=db.backref('schedules', lazy=True))

class Bookings(db.Model):
    __tablename__ = 'Bookings'

    bookingID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    userID = db.Column(db.Integer, db.ForeignKey('Users.userID'), nullable=False)
    scheduleID = db.Column(db.Integer, db.ForeignKey('Schedules.scheduleID'), nullable=False)
    seatNumbers= db.Column(db.Text) 
    bookingDate= db.Column(db.DateTime)
    totalPrice = db.Column(db.Float, nullable=False)
    status= db.Column(db.Enum('Confirmed', 'Cancelled', 'Pending', 'Completed'), default='Pending')
    paymentStatus= db.Column(db.Enum('Paid', 'Unpaid'), default='Unpaid')
    paymentGateway= db.Column(db.String(50))
    transactionID= db.Column(db.String(100))

    user = db.relationship('Users', backref=db.backref('bookings', lazy=True))
    schedule = db.relationship('Schedules', backref=db.backref('bookings', lazy=True))
    bus = db.relationship('Buses', backref='bookings', lazy=True)
    route = db.relationship('Routes', backref='bookings', lazy=True)

class SeatLayout(db.Model):
    __tablename__ = 'SeatLayout'

    seatLayoutID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    busID = db.Column(db.Integer, db.ForeignKey('Buses.busID'), nullable=False, unique=True)  # Ensure one-to-one with `unique=True`
    seatMap = db.Column(db.JSON)

    bus = db.relationship('Buses', backref=db.backref('seat_layout', uselist=False, lazy=True))  # `uselist=False` enforces one-to-one relationship

class TokenBlocklist(db.Model):
    __tablename__ = 'token_blocklist'
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(255), unique=True, nullable=False)  # JWT ID (jti)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)