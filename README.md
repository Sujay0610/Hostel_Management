# 🏢 Hostel Management System

> A modern web-based solution for efficient hostel administration and enhanced student experience.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Python](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![Flask](https://img.shields.io/badge/Flask-2.0+-orange.svg)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-18.0+-61dafb.svg)](https://reactjs.org/)

## ✨ Features

### 👥 User Management
- **Multi-role Authentication** - Separate portals for students and administrators
- **Secure Access** - Password hashing and session management
- **Profile Management** - User profile updates and management

### 🎓 Student Features
- **Room Allocation** - View and request room assignments
- **Fee Management** - Track and pay hostel fees
- **Complaint System** - Submit and track complaints
- **Dashboard** - Personal dashboard with important notifications

### 🏗 Admin Capabilities
- **Student Management** - Register, update, and manage student records
- **Room Management** - Manage room types, assignments, and availability
- **Fee Administration** - Set fee structures and track payments
- **Complaint Handling** - Process and resolve student complaints
- **Analytics Dashboard** - Overview of hostel operations

## 🛠 Tech Stack

### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - ORM for database operations
- **MySQL** - Primary database
- **JWT** - Authentication and authorization
- **Flask-CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI development
- **Vite** - Build tooling
- **Material-UI** - Component library
- **Axios** - HTTP client
- **React Router** - Navigation management

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 14+
- MySQL

### Installation

1. **Clone Repository**
   ```bash
   git clone https://github.com/Sujay0610/Hostel_Management.git
   cd Hostel_Management
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python app.py
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Database Configuration**
   ```bash
   mysql -u root -p
   CREATE DATABASE hostel_management;
   ```

## 📝 Environment Setup

Create `.env` in backend directory:

env
FLASK_APP=app.py
FLASK_ENV=development
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_HOST=localhost
DB_NAME=hostel_management
SECRET_KEY=your_secret_key


## 🔗 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | User login |
| POST | `/signup/student` | Student registration |

### Student Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/students` | List students |
| POST | `/students` | Add student |
| DELETE | `/students/:id` | Remove student |

### Room Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rooms` | List rooms |
| POST | `/rooms` | Add room |
| PUT | `/rooms/:id/assign` | Assign room |

## 🤝 Contributing

1. Fork repository
2. Create feature branch
   ```bash
   git checkout -b feature/YourFeature
   ```
3. Commit changes
   ```bash
   git commit -m 'Add YourFeature'
   ```
4. Push to branch
   ```bash
   git push origin feature/YourFeature
   ```
5. Open pull request

## 📄 License

[MIT](https://choosealicense.com/licenses/mit/)

## 👥 Team

- **Sujay** - *Project Lead* - [@Sujay0610](https://github.com/Sujay0610)

## 📞 Contact

Sujay - [@sujay](https://twitter.com/sujay) - sujay@example.com

Project Link: [https://github.com/Sujay0610/Hostel_Management](https://github.com/Sujay0610/Hostel_Management)

---
<p align="center">Made with ❤️ by Sujay</p>
