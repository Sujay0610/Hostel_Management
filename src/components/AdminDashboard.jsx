import React, { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { Card, CardHeader, CardContent } from './ui/components'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_students: 0,
    available_rooms: 0,
    pending_complaints: 0
  })

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/admin/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  return (
    <div className="admin-dashboard">
      <nav className="admin-nav">
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/rooms">Room Management</Link>
        <Link to="/admin/students">Student Management</Link>
        <Link to="/admin/complaints">Complaints</Link>
        <Link to="/admin/fees">Fee Management</Link>
      </nav>

      <Routes>
        <Route path="/" element={<DashboardOverview stats={stats} />} />
        <Route path="/rooms" element={<RoomManagement />} />
        <Route path="/students" element={<StudentManagement />} />
        <Route path="/complaints" element={<ComplaintManagement />} />
        <Route path="/fees" element={<FeeManagement />} />
      </Routes>
    </div>
  )
}

function DashboardOverview({ stats }) {
  return (
    <Card>
      <CardHeader>Dashboard Overview</CardHeader>
      <CardContent>
        <div className="stats-grid">
          <div className="stat-item">
            <h3>Total Students</h3>
            <p>{stats.total_students}</p>
          </div>
          <div className="stat-item">
            <h3>Available Rooms</h3>
            <p>{stats.available_rooms}</p>
          </div>
          <div className="stat-item">
            <h3>Pending Complaints</h3>
            <p>{stats.pending_complaints}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Placeholder components - you can expand these later
function RoomManagement() {
  return <Card><CardHeader>Room Management</CardHeader></Card>
}

function StudentManagement() {
  return <Card><CardHeader>Student Management</CardHeader></Card>
}

function ComplaintManagement() {
  return <Card><CardHeader>Complaint Management</CardHeader></Card>
}

function FeeManagement() {
  return <Card><CardHeader>Fee Management</CardHeader></Card>
} 