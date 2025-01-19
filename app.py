from flask import Flask, jsonify, request
from flask_migrate import Migrate
from model import db, Users, Bookings, Buses, Routes, Schedules
from Views.user import user_bp
from Views.buses import Buses_bp
from Views.routes import routes_bp
from Views.bookings import bookings_bp
from Views.Schedules import schedules_bp
from datetime import timedelta

from model import db, TokenBlocklist
from flask_jwt_extended import JWTManager



app =Flask(__name__)

# migration initialization (DATABASE )

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bus.db'
migrate=Migrate(app,db)
db.init_app(app)


# jwt
app.config["JWT_SECRET_KEY"] = "red" 
app.config["JWT_ACCESS_TOKEN_EXPIRES"] =  timedelta(hours=1)
jwt = JWTManager(app)
jwt.init_app(app)

# import all functions in views


app.register_blueprint(user_bp)
app.register_blueprint(Buses_bp)
app.register_blueprint(routes_bp)
app.register_blueprint(bookings_bp)
app.register_blueprint(schedules_bp)


@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload: dict) -> bool:
    jti = jwt_payload["jti"]
    token = db.session.query(TokenBlocklist.id).filter_by(jti=jti).scalar()

    return token is not None