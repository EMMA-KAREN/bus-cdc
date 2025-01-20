from flask import Flask  #flask is the framework for building web applicaions 
 #-------Flask-Migrate: Manages database migrations, allowing the database schema to be updated with changes over time-----#
from flask_migrate import Migrate 
 #-------Flask-JWT-Extended: A Flask extension for JWT (JSON Web Tokens) authentication
from flask_jwt_extended import JWTManager
from datetime import timedelta
# from sqlalchemy import text
from model import db, TokenBlocklist
from Views.user import user_bp
from Views.buses import Buses_bp
from Views.routes import routes_bp
from Views.bookings import bookings_bp
from Views.Schedules import schedules_bp
from flask_mail import Mail

# Create Flask application
app = Flask(__name__)

# Configurations for Flask-Mail
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = 'emmaculate.mwikali@student.moringaschool.com'  # Replace with your email
app.config['MAIL_PASSWORD'] = 'wsfy gvyl dmtu jrae'        # Replace with your email password or app-specific password
app.config['MAIL_DEFAULT_SENDER'] =app.config ['MAIL_USERNAME']

# Initialize Mail
mail = Mail(app)


# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bus.db'
#-----SQLALCHEMY_TRACK_MODIFICATIONS is disabled to prevent unnecessary overhead.
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
migrate = Migrate(app, db)

# Initialize JWT for authentication and the token expires after one hour
app.config["JWT_SECRET_KEY"] = "red"  
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(app)

# Blueprint registration  to handle different part of the application 
app.register_blueprint(user_bp)
app.register_blueprint(Buses_bp)
app.register_blueprint(routes_bp)
app.register_blueprint(bookings_bp)
app.register_blueprint(schedules_bp)

# JWT token blocklist loader used for log in and out of user 
@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload: dict) -> bool:
    jti = jwt_payload["jti"]
    token = db.session.query(TokenBlocklist.id).filter_by(jti=jti).scalar()
    return token is not None

if __name__ == "__main__":
    app.run(debug=True)
