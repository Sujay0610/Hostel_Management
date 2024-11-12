import React, { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { Card, CardHeader, CardContent } from './ui/components'

export default function StudentPortal({ studentId }) {
  const [studentData, setStudentData] = useState(null)

  useEffect(() => {
    fetchStudentData()
  }, [studentId])

  const fetchStudentData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/student/dashboard/${studentId}`)
      if (response.ok) {
        const data = await response.json()
        setStudentData(data)
      }
    } catch (error) {
      console.error('Error fetching student data:', error)
    }
  }

  return (
    <div className="student-portal">
      <nav className="student-nav">
        <Link to={`/student/${studentId}`}>Dashboard</Link>
        <Link to={`/student/${studentId}/room`}>Room Details</Link>
        <Link to={`/student/${studentId}/fees`}>Fee Payment</Link>
        <Link to={`/student/${studentId}/complaints`}>Complaints</Link>
      </nav>

      <Routes>
        <Route path="/" element={<StudentDashboard data={studentData} />} />
        <Route path="/room" element={<RoomDetails data={studentData?.room} />} />
        <Route path="/fees" element={<FeePayment fees={studentData?.pending_fees} />} />
        <Route path="/complaints" element={<ComplaintManagement complaints={studentData?.complaints} />} />
      </Routes>
    </div>
  )
}

function StudentDashboard({ data }) {
  if (!data) return <div>Loading...</div>

  return (
    <Card>
      <CardHeader>Student Dashboard</CardHeader>
      <CardContent>
        <div className="dashboard-info">
          <h3>Room Information</h3>
          <p>Room Type: {data.room || 'Not Assigned'}</p>

          <h3>Pending Fees</h3>
          <p>Total Due: ${data.pending_fees?.reduce((a, b) => a + b, 0) || 0}</p>

          <h3>Recent Complaints</h3>
          <ul>
            {data.complaints?.map((complaint, index) => (
              <li key={index}>
                {complaint.description} - {complaint.status}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

// Placeholder components - you can expand these later
function RoomDetails({ data }) {
  return (
    <Card>
      <CardHeader>Room Details</CardHeader>
      <CardContent>
        <p>Room Type: {data || 'Not Assigned'}</p>
      </CardContent>
    </Card>
  )
}

function FeePayment({ fees = [] }) {
  return (
    <Card>
      <CardHeader>Fee Payment</CardHeader>
      <CardContent>
        <h3>Pending Fees</h3>
        {fees.map((amount, index) => (
          <div key={index}>
            <p>Amount Due: ${amount}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function ComplaintManagement({ complaints = [] }) {
  return (
    <Card>
      <CardHeader>Complaints</CardHeader>
      <CardContent>
        <h3>Your Complaints</h3>
        {complaints.map((complaint, index) => (
          <div key={index}>
            <p>{complaint.description}</p>
            <p>Status: {complaint.status}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 