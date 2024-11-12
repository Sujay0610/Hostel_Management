import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from '../ui/components'
import '../../styles/student.css'

export default function StudentRoom() {
  const [roomInfo, setRoomInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRoomInfo = async () => {
      const user = JSON.parse(localStorage.getItem('user') || 'null')
      
      try {
        const response = await fetch(
          `http://localhost:5000/rooms?student_id=${user.student_id}`,
          {
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        )

        if (!response.ok) throw new Error('Failed to fetch room information')
        const data = await response.json()
        setRoomInfo(data[0])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRoomInfo()
  }, [])

  if (loading) return <div className="loading">Loading...</div>
  if (error) return <div className="error-message">{error}</div>

  return (
    <div className="student-room">
      <Card>
        <CardHeader>My Room Details</CardHeader>
        <CardContent>
          {roomInfo ? (
            <div className="room-details">
              <div className="detail-item">
                <span className="label">Room Number:</span>
                <span className="value">{roomInfo.id}</span>
              </div>
              <div className="detail-item">
                <span className="label">Room Type:</span>
                <span className="value">{roomInfo.room_type}</span>
              </div>
              <div className="detail-item">
                <span className="label">Capacity:</span>
                <span className="value">{roomInfo.capacity}</span>
              </div>
              <div className="room-features">
                <h3>Room Features</h3>
                <ul>
                  {roomInfo.room_type === 'Single' && (
                    <>
                      <li>Private Room</li>
                      <li>Single Bed</li>
                      <li>Study Table</li>
                      <li>Wardrobe</li>
                    </>
                  )}
                  {roomInfo.room_type === 'Double' && (
                    <>
                      <li>Shared Room</li>
                      <li>Two Beds</li>
                      <li>Two Study Tables</li>
                      <li>Two Wardrobes</li>
                    </>
                  )}
                  <li>Wi-Fi Access</li>
                  <li>Air Conditioning</li>
                  <li>Power Outlets</li>
                </ul>
              </div>
              <div className="room-rules">
                <h3>Room Rules</h3>
                <ul>
                  <li>Keep the room clean and tidy</li>
                  <li>No smoking allowed</li>
                  <li>Quiet hours: 10 PM - 6 AM</li>
                  <li>No unauthorized guests</li>
                  <li>Report any maintenance issues immediately</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="no-room">
              <p>No room assigned yet. Please contact the hostel administration.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 