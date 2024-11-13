from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_cors import CORS
import logging
from flask_login import LoginManager, UserMixin, login_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import text
import mysql.connector
import os

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Set up CORS
CORS(app, supports_credentials=True)

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:sujay123@localhost/hostel_management'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key'
app.config['SQLALCHEMY_ECHO'] = True 

# Initialize extensions
db = SQLAlchemy(app)
login_manager = LoginManager(app)

# Model definitions
class Student(db.Model):
    __tablename__ = 'student'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    contact = db.Column(db.String(20), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    complaints = db.relationship('Complaint', backref='student', lazy=True)
    room_assignments = db.relationship('RoomAssignment', backref='student', lazy=True)

class Admin(db.Model):
    __tablename__ = 'admin'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    contact = db.Column(db.String(20), nullable=False)
    reports = db.relationship('Report', backref='admin', lazy=True)

class Room(db.Model):
    __tablename__ = 'room'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    room_type = db.Column(db.String(50), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    availability = db.Column(db.Boolean, default=True)
    current_occupancy = db.Column(db.Integer, default=0)
    assignments = db.relationship('RoomAssignment', backref='room', lazy=True)

    def has_space(self):
        return self.current_occupancy < self.capacity

class RoomAssignment(db.Model):
    __tablename__ = 'room_assignments'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=False)
    active = db.Column(db.Boolean, default=True)
    assigned_date = db.Column(db.DateTime, default=datetime.utcnow)
    unassigned_date = db.Column(db.DateTime, nullable=True)

class Fee(db.Model):
    __tablename__ = 'fees'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default='Unpaid')
    description = db.Column(db.String(200), nullable=True)
    paid_date = db.Column(db.DateTime, nullable=True)
    student = db.relationship('Student', backref=db.backref('fees', lazy=True))

class Complaint(db.Model):
    __tablename__ = 'complaint'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='Open')
    date = db.Column(db.DateTime, default=datetime.utcnow)

class Report(db.Model):
    __tablename__ = 'report'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    report_type = db.Column(db.String(50), nullable=False)
    date_generated = db.Column(db.DateTime, default=datetime.utcnow)
    admin_id = db.Column(db.Integer, db.ForeignKey('admin.id'), nullable=False)

class User(UserMixin, db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=True)

class PaymentHistory(db.Model):
    __tablename__ = 'payment_history'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    fee_id = db.Column(db.Integer, db.ForeignKey('fees.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_date = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ComplaintHistory(db.Model):
    __tablename__ = 'complaint_history'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey('complaint.id'), nullable=False)
    old_status = db.Column(db.String(20), nullable=False)
    new_status = db.Column(db.String(20), nullable=False)
    change_date = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class StudentArchive(db.Model):
    __tablename__ = 'student_archive'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    contact = db.Column(db.String(20), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    deletion_date = db.Column(db.DateTime, nullable=False)
    reason = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Routes
@app.route('/admin/dashboard', methods=['GET'])
def admin_dashboard():
    try:
        total_students = Student.query.count()
        available_rooms = Room.query.filter_by(availability=True).count()
        pending_complaints = Complaint.query.filter_by(status='Open').count()
        unpaid_fees = db.session.query(db.func.sum(Fee.amount))\
            .filter(Fee.status == 'Unpaid')\
            .scalar() or 0
        
        stats = {
            'total_students': total_students,
            'available_rooms': available_rooms,
            'pending_complaints': pending_complaints,
            'unpaid_fees': float(unpaid_fees)
        }
        return jsonify(stats), 200
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/students', methods=['GET', 'POST'])
def handle_students():
    if request.method == 'POST':
        try:
            data = request.json
            new_student = Student(
                name=data['name'],
                contact=data['contact'],
                date_of_birth=datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
            )
            db.session.add(new_student)
            db.session.commit()
            return jsonify({
                "message": "Student added successfully",
                "id": new_student.id
            }), 201
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error adding student: {str(e)}")
            return jsonify({"error": str(e)}), 400
    else:
        try:
            students = Student.query.all()
            student_data = []
            
            for s in students:
                # Get current active room assignment
                current_assignment = RoomAssignment.query.filter_by(
                    student_id=s.id,
                    active=True
                ).first()
                
                # Get room details if there's an active assignment
                room_data = None
                if current_assignment:
                    room = Room.query.get(current_assignment.room_id)
                    room_data = {
                        'id': room.id,
                        'room_type': room.room_type,
                        'capacity': room.capacity,
                        'current_occupancy': room.current_occupancy,
                        'assignment_date': current_assignment.assigned_date.isoformat()
                    }
                
                student_data.append({
                    'id': s.id,
                    'name': s.name,
                    'contact': s.contact,
                    'date_of_birth': s.date_of_birth.isoformat() if s.date_of_birth else None,
                    'room_assignment': room_data
                })
                
            return jsonify(student_data), 200
        except Exception as e:
            logger.error(f"Error fetching students: {str(e)}")
            return jsonify({'error': str(e)}), 500

@app.route('/students/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    try:
        student = Student.query.get_or_404(student_id)
        
        # First, get all room assignments for this student
        room_assignments = RoomAssignment.query.filter_by(student_id=student_id).all()
        
        # Update rooms and delete assignments
        for assignment in room_assignments:
            if assignment.active:
                # Update room occupancy if assignment was active
                room = Room.query.get(assignment.room_id)
                if room:
                    room.current_occupancy = max(0, room.current_occupancy - 1)
                    room.availability = room.current_occupancy < room.capacity
            
            # Delete the assignment
            db.session.delete(assignment)
        
        # Delete associated complaints
        Complaint.query.filter_by(student_id=student_id).delete()
        
        # Delete payment history records first
        PaymentHistory.query.filter_by(student_id=student_id).delete()
        
        # Then delete fees
        Fee.query.filter_by(student_id=student_id).delete()
        
        # Delete associated user account if exists
        User.query.filter_by(student_id=student_id).delete()
        
        # Finally, delete the student
        db.session.delete(student)
        db.session.commit()
        
        return jsonify({"message": "Student deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting student: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/complaints', methods=['GET', 'POST'])
def handle_complaints():
    if request.method == 'POST':
        try:
            data = request.json
            new_complaint = Complaint(
                description=data['description'],
                student_id=data['student_id']
            )
            db.session.add(new_complaint)
            db.session.commit()
            return jsonify({"message": "Complaint added successfully"}), 201
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error adding complaint: {str(e)}")
            return jsonify({"error": str(e)}), 400
    else:
        complaints = Complaint.query.join(Student).all()
        return jsonify([{
            "id": c.id,
            "description": c.description,
            "status": c.status,
            "date": c.date.isoformat(),
            "student_id": c.student_id,
            "student_name": c.student.name
        } for c in complaints]), 200

@app.route('/complaints/<int:complaint_id>', methods=['PUT'])
def update_complaint(complaint_id):
    try:
        complaint = Complaint.query.get_or_404(complaint_id)
        data = request.json
        if 'status' in data:
            complaint.status = data['status']
        db.session.commit()
        return jsonify({"message": "Complaint updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating complaint: {str(e)}")
        return jsonify({"error": str(e)}), 400

@app.route('/fees', methods=['GET', 'POST'])
def handle_fees():
    if request.method == 'POST':
        try:
            data = request.json
            logger.info(f"Received fee data: {data}")  # Add logging
            
            # Validate required fields
            if not all(key in data for key in ['student_id', 'amount', 'due_date']):
                return jsonify({"error": "Missing required fields"}), 400

            # Verify student exists
            student = Student.query.get(data['student_id'])
            if not student:
                return jsonify({"error": "Student not found"}), 404

            new_fee = Fee(
                student_id=data['student_id'],
                amount=float(data['amount']),
                due_date=datetime.strptime(data['due_date'], '%Y-%m-%d').date(),
                description=data.get('description', ''),
                status='Unpaid'
            )
            
            db.session.add(new_fee)
            db.session.commit()
            
            # Return the created fee data
            return jsonify({
                "message": "Fee added successfully",
                "fee": {
                    "id": new_fee.id,
                    "student_id": new_fee.student_id,
                    "amount": float(new_fee.amount),
                    "due_date": new_fee.due_date.isoformat(),
                    "status": new_fee.status,
                    "description": new_fee.description,
                    "student_name": student.name
                }
            }), 201

        except ValueError as e:
            db.session.rollback()
            logger.error(f"Validation error adding fee: {str(e)}")
            return jsonify({"error": "Invalid data format"}), 400
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error adding fee: {str(e)}")
            return jsonify({"error": str(e)}), 500
    else:
        try:
            fees = Fee.query.join(Student).all()
            return jsonify([{
                "id": f.id,
                "amount": float(f.amount),
                "due_date": f.due_date.isoformat(),
                "paid_date": f.paid_date.isoformat() if f.paid_date else None,
                "status": f.status,
                "description": f.description,
                "student_id": f.student_id,
                "student_name": f.student.name
            } for f in fees]), 200
        except Exception as e:
            logger.error(f"Error fetching fees: {str(e)}")
            return jsonify({"error": str(e)}), 500

@app.route('/fees/<int:fee_id>/mark-paid', methods=['PUT'])
def mark_fee_as_paid(fee_id):
    try:
        fee = Fee.query.get_or_404(fee_id)
        
        # Create payment history record
        payment = PaymentHistory(
            fee_id=fee.id,
            student_id=fee.student_id,
            amount=fee.amount,
            payment_date=datetime.utcnow()
        )
        
        # Update fee status
        fee.status = 'Paid'
        fee.paid_date = datetime.utcnow()
        
        db.session.add(payment)
        db.session.commit()
        
        return jsonify({
            "message": "Fee marked as paid",
            "fee": {
                "id": fee.id,
                "status": fee.status,
                "paid_date": fee.paid_date.isoformat()
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error marking fee as paid: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/rooms', methods=['GET', 'POST'])
def handle_rooms():
    if request.method == 'POST':
        try:
            data = request.json
            new_room = Room(
                room_type=data['room_type'],
                capacity=data['capacity'],
                availability=data.get('availability', True)
            )
            db.session.add(new_room)
            db.session.commit()
            return jsonify({"message": "Room added successfully"}), 201
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error adding room: {str(e)}")
            return jsonify({"error": str(e)}), 400
    else:
        try:
            rooms = Room.query.all()
            room_list = []
            for room in rooms:
                # Get current active assignments for this room
                active_assignments = RoomAssignment.query.filter_by(
                    room_id=room.id,
                    active=True
                ).all()
                
                # Get student names if room is occupied
                student_names = []
                for assignment in active_assignments:
                    student = Student.query.get(assignment.student_id)
                    if student:
                        student_names.append(student.name)
                
                room_data = {
                    "id": room.id,
                    "room_type": room.room_type,
                    "capacity": room.capacity,
                    "current_occupancy": room.current_occupancy,
                    "availability": room.availability,
                    "student_names": student_names
                }
                room_list.append(room_data)
            
            return jsonify(room_list), 200
        except Exception as e:
            logger.error(f"Error fetching rooms: {str(e)}")
            return jsonify({"error": str(e)}), 500

@app.route('/rooms/<int:room_id>', methods=['DELETE'])
def delete_room(room_id):
    try:
        room = Room.query.get_or_404(room_id)
        
        # Check if room has any active assignments
        active_assignments = RoomAssignment.query.filter_by(
            room_id=room_id,
            active=True
        ).first()
        
        if active_assignments:
            return jsonify({"error": "Cannot delete room with active assignments"}), 400
            
        db.session.delete(room)
        db.session.commit()
        return jsonify({"message": "Room deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting room: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/payment-history/<int:student_id>', methods=['GET'])
def get_payment_history(student_id):
    try:
        history = PaymentHistory.query.filter_by(student_id=student_id).all()
        return jsonify([{
            'id': h.id,
            'amount': float(h.amount),
            'payment_date': h.payment_date.isoformat(),
            'fee_id': h.fee_id
        } for h in history]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/complaint-history/<int:complaint_id>', methods=['GET'])
def get_complaint_history(complaint_id):
    try:
        history = ComplaintHistory.query.filter_by(complaint_id=complaint_id).all()
        return jsonify([{
            'id': h.id,
            'old_status': h.old_status,
            'new_status': h.new_status,
            'change_date': h.change_date.isoformat()
        } for h in history]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/student-archive', methods=['GET'])
def get_student_archive():
    try:
        archived = StudentArchive.query.all()
        return jsonify([{
            'id': a.id,
            'name': a.name,
            'contact': a.contact,
            'deletion_date': a.deletion_date.isoformat(),
            'reason': a.reason
        } for a in archived]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/admin/create', methods=['POST'])
def create_admin():
    try:
        data = request.json
        
        # Create admin record
        new_admin = Admin(
            name=data['name'],
            contact=data['contact']
        )
        db.session.add(new_admin)
        db.session.flush()  # Get the admin ID before committing
        
        # Create user account for admin
        admin_user = User(
            username=data['username'],
            password=generate_password_hash(data['password']),
            role='admin'
        )
        db.session.add(admin_user)
        db.session.commit()
        
        return jsonify({
            'message': 'Admin created successfully',
            'admin_id': new_admin.id,
            'user_id': admin_user.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

def init_db():
    with app.app_context():
        try:
            # Create database if it doesn't exist
            engine = db.create_engine('mysql+pymysql://root:sujay123@localhost')
            with engine.connect() as conn:
                conn.execute(text("CREATE DATABASE IF NOT EXISTS hostel_management"))
                conn.execute(text("USE hostel_management"))
            
            # Create tables
            db.create_all()
            
            # Check for existing admin
            admin_user = User.query.filter_by(username='admin').first()
            admin = Admin.query.first()
            
            if not admin_user:
                # Create admin record if it doesn't exist
                if not admin:
                    admin = Admin(
                        name='Default Admin',
                        contact='1234567890'
                    )
                    db.session.add(admin)
                    db.session.flush()
                
                # Create admin user account
                admin_user = User(
                    username='admin',
                    password=generate_password_hash('admin123'),
                    role='admin'
                )
                db.session.add(admin_user)
                db.session.commit()
                logger.info('Default admin account created')
                logger.info(f'Admin username: admin, password: admin123')
            
        except Exception as e:
            logger.error(f"Database initialization error: {str(e)}")
            raise e

def init_views():
    try:
        with db.engine.connect() as conn:
            # Student Details View
            conn.execute(text("""
                CREATE OR REPLACE VIEW vw_student_details AS
                SELECT 
                    s.id, s.name, s.contact, s.date_of_birth,
                    r.id as room_id, r.room_type,
                    COUNT(c.id) as complaint_count,
                    SUM(CASE WHEN f.status = 'Unpaid' THEN f.amount ELSE 0 END) as unpaid_fees
                FROM student s
                LEFT JOIN room r ON r.student_id = s.id
                LEFT JOIN complaint c ON c.student_id = s.id
                LEFT JOIN fee f ON f.student_id = s.id
                GROUP BY s.id
            """))

            # Room Occupancy View
            conn.execute(text("""
                CREATE OR REPLACE VIEW vw_room_occupancy AS
                SELECT 
                    r.id, r.room_type, r.capacity, r.availability,
                    s.name as student_name, s.contact as student_contact
                FROM room r
                LEFT JOIN student s ON r.student_id = s.id
            """))
            
            conn.commit()
    except Exception as e:
        logger.error(f"Error creating views: {str(e)}")
        raise e


@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        logger.info(f"Login attempt for username: {data['username']}")
        
        user = User.query.filter_by(username=data['username']).first()
        
        if not user:
            logger.warning(f"User not found: {data['username']}")
            return jsonify({'error': 'Invalid credentials'}), 401
            
        if check_password_hash(user.password, data['password']):
            login_user(user)
            logger.info(f"Successful login for user: {user.username}")
            return jsonify({
                'id': user.id,
                'username': user.username,
                'role': user.role,
                'student_id': user.student_id
            })
        else:
            logger.warning(f"Invalid password for user: {user.username}")
            return jsonify({'error': 'Invalid credentials'}), 401
            
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/signup/student', methods=['POST'])
def signup_student():
    try:
        data = request.json
        
        # Create user with hashed password
        user = User(
            username=data['username'],
            password=generate_password_hash(data['password']),
            role='student',
            student_id=data['student_id']
        )
        
        db.session.add(user)
        db.session.commit()
        
        # Return user data for immediate login
        return jsonify({
            'id': user.id,
            'username': user.username,
            'role': 'student',
            'student_id': user.student_id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Signup error: {str(e)}")
        return jsonify({'error': str(e)}), 400

def init_procedures():
    try:
        with db.engine.connect() as conn:
            # Add Student Procedure
            conn.execute(text("""
                CREATE PROCEDURE IF NOT EXISTS sp_add_student(
                    IN p_name VARCHAR(100),
                    IN p_contact VARCHAR(20),
                    IN p_date_of_birth DATE,
                    IN p_room_id INT
                )
                BEGIN
                    DECLARE new_student_id INT;
                    START TRANSACTION;
                    INSERT INTO student (name, contact, date_of_birth)
                    VALUES (p_name, p_contact, p_date_of_birth);
                    SET new_student_id = LAST_INSERT_ID();
                    IF p_room_id IS NOT NULL THEN
                        UPDATE room 
                        SET student_id = new_student_id,
                            availability = FALSE
                        WHERE id = p_room_id AND availability = TRUE;
                    END IF;
                    COMMIT;
                END
            """))
            
            conn.commit()
    except Exception as e:
        logger.error(f"Error creating procedures: {str(e)}")
        raise e

def init_functions():
    try:
        with db.engine.connect() as conn:
            # Calculate Unpaid Fees Function
            conn.execute(text("""
                CREATE FUNCTION IF NOT EXISTS fn_get_unpaid_fees(p_student_id INT)
                RETURNS DECIMAL(10,2)
                DETERMINISTIC
                BEGIN
                    DECLARE total_unpaid DECIMAL(10,2);
                    SELECT COALESCE(SUM(amount), 0)
                    INTO total_unpaid
                    FROM fee
                    WHERE student_id = p_student_id 
                    AND status = 'Unpaid';
                    RETURN total_unpaid;
                END
            """))
            
            conn.commit()
    except Exception as e:
        logger.error(f"Error creating functions: {str(e)}")
        raise e

def init_triggers():
    try:
        with db.engine.connect() as conn:
            # Create triggers one by one
            triggers = [
                """
                CREATE TRIGGER after_student_room_assignment
                AFTER UPDATE ON room
                FOR EACH ROW
                BEGIN
                    IF NEW.student_id IS NOT NULL THEN
                        UPDATE room SET availability = FALSE WHERE id = NEW.id;
                    ELSE
                        UPDATE room SET availability = TRUE WHERE id = NEW.id;
                    END IF;
                END;
                """,
                """
                CREATE TRIGGER before_fee_payment_update
                BEFORE UPDATE ON fee
                FOR EACH ROW
                BEGIN
                    IF NEW.status = 'Paid' AND OLD.status = 'Unpaid' THEN
                        SET NEW.paid_date = CURRENT_TIMESTAMP;
                        INSERT INTO payment_history (fee_id, student_id, amount, payment_date)
                        VALUES (OLD.id, OLD.student_id, OLD.amount, CURRENT_TIMESTAMP);
                    END IF;
                END;
                """,
                """
                CREATE TRIGGER after_complaint_status_change
                AFTER UPDATE ON complaint
                FOR EACH ROW
                BEGIN
                    IF NEW.status != OLD.status THEN
                        INSERT INTO complaint_history (complaint_id, old_status, new_status, change_date)
                        VALUES (OLD.id, OLD.status, NEW.status, CURRENT_TIMESTAMP);
                    END IF;
                END;
                """,
                """
                CREATE TRIGGER before_student_delete
                BEFORE DELETE ON student
                FOR EACH ROW
                BEGIN
                    UPDATE room SET availability = TRUE, student_id = NULL 
                    WHERE student_id = OLD.id;
                    
                    INSERT INTO student_archive (
                        student_id, name, contact, date_of_birth, 
                        deletion_date, reason
                    )
                    VALUES (
                        OLD.id, OLD.name, OLD.contact, OLD.date_of_birth,
                        CURRENT_TIMESTAMP, 'Student record deleted'
                    );
                END;
                """,
                """
                CREATE TRIGGER before_room_assignment
                BEFORE UPDATE ON room
                FOR EACH ROW
                BEGIN
                    DECLARE current_occupants INT;
                    
                    IF NEW.student_id IS NOT NULL THEN
                        SELECT COUNT(*) INTO current_occupants 
                        FROM room 
                        WHERE room_type = NEW.room_type 
                        AND student_id IS NOT NULL;
                        
                        IF current_occupants >= NEW.capacity THEN
                            SIGNAL SQLSTATE '45000'
                            SET MESSAGE_TEXT = 'Room capacity exceeded';
                        END IF;
                    END IF;
                END;
                """
            ]

            # First drop existing triggers if they exist
            drop_triggers = [
                "DROP TRIGGER IF EXISTS after_student_room_assignment;",
                "DROP TRIGGER IF EXISTS before_fee_payment_update;",
                "DROP TRIGGER IF EXISTS after_complaint_status_change;",
                "DROP TRIGGER IF EXISTS before_student_delete;",
                "DROP TRIGGER IF EXISTS before_room_assignment;"
            ]

            # Execute drops
            for drop_trigger in drop_triggers:
                conn.execute(text(drop_trigger))

            # Execute creates
            for trigger in triggers:
                conn.execute(text(trigger))
            
            conn.commit()
            logger.info("Triggers created successfully")
            
    except Exception as e:
        logger.error(f"Error creating triggers: {str(e)}")
        raise e

def init_history_tables():
    try:
        with db.engine.connect() as conn:
            # Create history tables
            history_tables = [
                """
                CREATE TABLE IF NOT EXISTS payment_history (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    fee_id INT NOT NULL,
                    student_id INT NOT NULL,
                    amount DECIMAL(10,2) NOT NULL,
                    payment_date DATETIME NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (fee_id) REFERENCES fee(id),
                    FOREIGN KEY (student_id) REFERENCES student(id)
                );
                """,
                """
                CREATE TABLE IF NOT EXISTS complaint_history (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    complaint_id INT NOT NULL,
                    old_status VARCHAR(20) NOT NULL,
                    new_status VARCHAR(20) NOT NULL,
                    change_date DATETIME NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (complaint_id) REFERENCES complaint(id)
                );
                """,
                """
                CREATE TABLE IF NOT EXISTS student_archive (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    student_id INT NOT NULL,
                    name VARCHAR(100) NOT NULL,
                    contact VARCHAR(20) NOT NULL,
                    date_of_birth DATE NOT NULL,
                    deletion_date DATETIME NOT NULL,
                    reason VARCHAR(200),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                """
            ]

            # Execute creates
            for table in history_tables:
                conn.execute(text(table))
            
            conn.commit()
            logger.info("History tables created successfully")
            
    except Exception as e:
        logger.error(f"Error creating history tables: {str(e)}")
        raise e

def test_mysql_connection():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='root',  
            password='sujay123' 
        )
        print("Successfully connected to MySQL!")
        connection.close()
    except Exception as e:
        print(f"Error connecting to MySQL: {str(e)}")

@app.route('/student/dashboard', methods=['GET'])
def student_dashboard():
    try:
        # Get user from session or token
        user = User.query.get(request.args.get('user_id'))
        if not user or user.role != 'student':
            return jsonify({"error": "Unauthorized"}), 401

        # Get student information
        student = Student.query.get(user.student_id)
        if not student:
            return jsonify({"error": "Student not found"}), 404

        # Get room information if assigned
        room = None
        room_assignment = RoomAssignment.query.filter_by(student_id=student.id, active=True).first()
        if room_assignment:
            room = Room.query.get(room_assignment.room_id)

        # Get pending fees
        pending_fees = Fee.query.filter_by(student_id=student.id, status='Unpaid').all()

        # Get recent complaints
        recent_complaints = Complaint.query.filter_by(student_id=student.id).order_by(Complaint.date.desc()).limit(5).all()

        return jsonify({
            "student": {
                "id": student.id,
                "name": student.name,
                "contact": student.contact,
                "room": {
                    "id": room.id,
                    "room_type": room.room_type,
                    "capacity": room.capacity
                } if room else None,
                "pending_fees": [{
                    "id": fee.id,
                    "amount": fee.amount,
                    "due_date": fee.due_date.strftime('%Y-%m-%d')
                } for fee in pending_fees],
                "recent_complaints": [{
                    "id": complaint.id,
                    "description": complaint.description,
                    "status": complaint.status,
                    "date": complaint.date.strftime('%Y-%m-%d')
                } for complaint in recent_complaints]
            }
        })
    except Exception as e:
        logger.error(f"Dashboard error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/rooms/<int:room_id>/assign', methods=['PUT'])
def assign_room_to_student(room_id):
    try:
        data = request.get_json()
        student_id = data.get('student_id')
        
        if not student_id:
            return jsonify({'error': 'Student ID is required'}), 400
            
        # Get the room and student
        room = Room.query.get_or_404(room_id)
        student = Student.query.get_or_404(student_id)
        
        # Check if student already has an active assignment
        existing_assignment = RoomAssignment.query.filter_by(
            student_id=student_id,
            active=True
        ).first()
        
        if existing_assignment:
            return jsonify({'error': 'Student already has an active room assignment'}), 400
            
        # Check room capacity
        if room.current_occupancy >= room.capacity:
            return jsonify({'error': 'Room is at full capacity'}), 400
            
        # Create new assignment
        new_assignment = RoomAssignment(
            room_id=room_id,
            student_id=student_id,
            active=True
        )
        
        # Update room occupancy
        room.current_occupancy += 1
        room.availability = room.current_occupancy < room.capacity
        
        db.session.add(new_assignment)
        db.session.commit()
        
        return jsonify({'message': 'Room assigned successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error assigning room: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/rooms/<int:room_id>/unassign', methods=['PUT'])
def unassign_room_from_student(room_id):
    try:
        data = request.get_json()
        student_id = data.get('student_id')
        
        if not student_id:
            return jsonify({'error': 'Student ID is required'}), 400
            
        # Get the active assignment
        assignment = RoomAssignment.query.filter_by(
            room_id=room_id,
            student_id=student_id,
            active=True
        ).first()
        
        if not assignment:
            return jsonify({'error': 'No active assignment found'}), 404
            
        # Just mark the existing assignment as inactive
        assignment.active = False
        assignment.unassigned_date = datetime.utcnow()
        
        # Update room occupancy
        room = Room.query.get_or_404(room_id)
        if room.current_occupancy > 0:  # Safety check
            room.current_occupancy -= 1
        room.availability = True
        
        db.session.commit()
        
        return jsonify({
            'message': 'Room unassigned successfully',
            'assignment': {
                'id': assignment.id,
                'student_id': assignment.student_id,
                'room_id': assignment.room_id,
                'active': assignment.active,
                'unassigned_date': assignment.unassigned_date.isoformat()
            },
            'room': {
                'id': room.id,
                'current_occupancy': room.current_occupancy,
                'availability': room.availability
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error unassigning room: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/students', methods=['GET'])
def get_students():
    try:
        students = Student.query.all()
        student_data = []
        
        for s in students:
            # Get current active room assignment
            current_assignment = RoomAssignment.query.filter_by(
                student_id=s.id,
                active=True
            ).first()
            
            # Get room details if there's an active assignment
            current_room = None
            if current_assignment:
                current_room = Room.query.get(current_assignment.room_id)
            
            student_data.append({
                'id': s.id,
                'name': s.name,
                'contact': s.contact,
                'date_of_birth': s.date_of_birth.isoformat() if s.date_of_birth else None,
                'room_id': current_room.id if current_room else None,
                'room_type': current_room.room_type if current_room else None,
                'room_capacity': current_room.capacity if current_room else None,
                'room_occupancy': current_room.current_occupancy if current_room else None
            })
            
        return jsonify(student_data), 200
    except Exception as e:
        logger.error(f"Error fetching students: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    try:
        test_mysql_connection()
        with app.app_context():
            init_db()
        logger.info("Starting Flask application...")
        app.run(debug=True)
    except Exception as e:
        logger.error(f"Application startup error: {str(e)}")

