import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardContent, Button } from '../ui/components'
import '../../styles/dashboard.css'
import RoomManagement from './RoomManagement'
import StudentManagement from './StudentManagement'
import ComplaintManagement from './ComplaintManagement'
import FeeManagement from './FeeManagement'
import CreateAdmin from './CreateAdmin'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = async () => {
      const user = JSON.parse(localStorage.getItem('user'))
      
      if (!user || user.role !== 'admin') {
        navigate('/login')
        return
      }

      try {
        const response = await fetch('http://localhost:5000/admin/dashboard', {
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Dashboard error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="admin-dashboard">
      <nav className="admin-nav">
        <div className="nav-links">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/rooms">Room Management</Link>
          <Link to="/admin/students">Student Management</Link>
          <Link to="/admin/complaints">Complaints</Link>
          <Link to="/admin/fees">Fee Management</Link>
          <Link to="/admin/create-admin">Create Admin</Link>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
        </div>

        <Routes>
          <Route path="/" element={<DashboardOverview stats={stats} />} />
          <Route path="/rooms" element={<RoomManagement />} />
          <Route path="/students" element={<StudentManagement />} />
          <Route path="/complaints" element={<ComplaintManagement />} />
          <Route path="/fees" element={<FeeManagement />} />
          <Route path="/create-admin" element={<CreateAdmin />} />
        </Routes>
      </div>
    </div>
  )
}

function DashboardOverview({ stats }) {
  if (!stats) return null;
  
  return (
    <div className="overview-container">
      <Card>
        <CardHeader>Dashboard Overview</CardHeader>
        <CardContent>
          <div className="stats-grid">
            <div className="stat-item">
              <h3>Total Students</h3>
              <p>{stats?.total_students || 0}</p>
            </div>
            <div className="stat-item">
              <h3>Available Rooms</h3>
              <p>{stats?.available_rooms || 0}</p>
            </div>
            <div className="stat-item">
              <h3>Pending Complaints</h3>
              <p>{stats?.pending_complaints || 0}</p>
            </div>
            <div className="stat-item">
              <h3>Unpaid Fees</h3>
              <p>${stats?.unpaid_fees?.toLocaleString() || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 