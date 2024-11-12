import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom'
import { Card, CardHeader, CardContent, Button } from '../ui/components'
import StudentRoom from './StudentRoom'
import StudentFees from './StudentFees'
import StudentComplaints from './StudentComplaints'
import '../../styles/dashboard.css'
import '../../styles/student.css'

function DashboardOverview({ studentInfo }) {
  const totalPendingAmount = studentInfo?.pending_fees?.reduce(
    (sum, fee) => sum + fee.amount, 
    0
  ) || 0

  return (
    <div className="dashboard-overview">
      <h2>Welcome to Your Dashboard</h2>
      <div className="dashboard-stats">
        <Card className="stat-card">
          <CardHeader>Room Information</CardHeader>
          <CardContent>
            {studentInfo?.room ? (
              <>
                <p>Room Number: {studentInfo.room.id}</p>
                <p>Type: {studentInfo.room.room_type}</p>
                <p>Capacity: {studentInfo.room.capacity}</p>
              </>
            ) : (
              <p>No room assigned</p>
            )}
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader>Fee Status</CardHeader>
          <CardContent>
            <p>Pending Fees: {studentInfo?.pending_fees?.length || 0}</p>
            <p>Total Amount Due: ${totalPendingAmount.toFixed(2)}</p>
            {studentInfo?.pending_fees?.length > 0 && (
              <Link to="/student/fees" className="view-all-link">
                View All Fees
              </Link>
            )}
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader>Recent Complaints</CardHeader>
          <CardContent>
            <p>Active Complaints: {studentInfo?.recent_complaints?.filter(c => c.status === 'Open').length || 0}</p>
            <p>Total Complaints: {studentInfo?.recent_complaints?.length || 0}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function StudentDashboard() {
  const [studentInfo, setStudentInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = async () => {
      const user = JSON.parse(localStorage.getItem('user') || 'null')

      if (!user || user.role !== 'student') {
        navigate('/login')
        return
      }

      try {
        const response = await fetch(`http://localhost:5000/student/dashboard?user_id=${user.id}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch dashboard data')
        }

        const data = await response.json()
        setStudentInfo(data.student)
      } catch (err) {
        console.error('Error:', err)
        setError(err.message || 'Unable to connect to server. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('studentId')
    navigate('/login')
  }

  if (loading) return <div className="loading">Loading...</div>
  if (error) return <div className="error-message">{error}</div>

  return (
    <div className="student-dashboard">
      <nav className="dashboard-nav">
        <div className="nav-links">
          <Link to="/student">Dashboard</Link>
          <Link to="/student/room">My Room</Link>
          <Link to="/student/fees">My Fees</Link>
          <Link to="/student/complaints">My Complaints</Link>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </nav>

      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={
            <>
              {studentInfo && (
                <Card className="welcome-card">
                  <CardHeader>Welcome, {studentInfo.name}</CardHeader>
                  <CardContent>
                    <p>Student ID: {studentInfo.id}</p>
                    <p>Contact: {studentInfo.contact}</p>
                  </CardContent>
                </Card>
              )}
              <DashboardOverview studentInfo={studentInfo} />
            </>
          } />
          <Route path="/room" element={<StudentRoom />} />
          <Route path="/fees" element={<StudentFees />} />
          <Route path="/complaints" element={<StudentComplaints />} />
        </Routes>
      </div>
    </div>
  )
} 