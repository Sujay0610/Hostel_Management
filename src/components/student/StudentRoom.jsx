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
            <div className="room-container">
              <div className="room-info-grid">
                <div className="room-info-card">
                  <div className="room-number">
                    <span className="number">{roomInfo.id}</span>
                    <span className="label">Room Number</span>
                  </div>
                  <div className="room-stats">
                    <div className="stat-item">
                      <span className="value">{roomInfo.room_type}</span>
                      <span className="label">Room Type</span>
                    </div>
                    <div className="stat-item">
                      <span className="value">{roomInfo.capacity}</span>
                      <span className="label">Capacity</span>
                    </div>
                    <div className="stat-item">
                      <span className="value">{roomInfo.current_occupancy}/{roomInfo.capacity}</span>
                      <span className="label">Occupancy</span>
                    </div>
                  </div>
                </div>

                <div className="room-features">
                  <h3>Room Features</h3>
                  <div className="features-grid">
                    {roomInfo.room_type === 'Single' ? (
                      <>
                        <div className="feature-item">
                          <span className="icon">🛏️</span>
                          <span>Single Bed</span>
                        </div>
                        <div className="feature-item">
                          <span className="icon">📚</span>
                          <span>Study Table</span>
                        </div>
                        <div className="feature-item">
                          <span className="icon">👕</span>
                          <span>Wardrobe</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="feature-item">
                          <span className="icon">🛏️</span>
                          <span>Two Beds</span>
                        </div>
                        <div className="feature-item">
                          <span className="icon">📚</span>
                          <span>Two Study Tables</span>
                        </div>
                        <div className="feature-item">
                          <span className="icon">👕</span>
                          <span>Two Wardrobes</span>
                        </div>
                      </>
                    )}
                    <div className="feature-item">
                      <span className="icon">📶</span>
                      <span>Wi-Fi Access</span>
                    </div>
                    <div className="feature-item">
                      <span className="icon">❄️</span>
                      <span>Air Conditioning</span>
                    </div>
                    <div className="feature-item">
                      <span className="icon">🔌</span>
                      <span>Power Outlets</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="room-rules">
                <h3>Room Rules</h3>
                <div className="rules-grid">
                  <div className="rule-item">
                    <span className="icon">🧹</span>
                    <span>Keep the room clean and tidy</span>
                  </div>
                  <div className="rule-item">
                    <span className="icon">🚭</span>
                    <span>No smoking allowed</span>
                  </div>
                  <div className="rule-item">
                    <span className="icon">🌙</span>
                    <span>Quiet hours: 10 PM - 6 AM</span>
                  </div>
                  <div className="rule-item">
                    <span className="icon">👥</span>
                    <span>No unauthorized guests</span>
                  </div>
                  <div className="rule-item">
                    <span className="icon">🔧</span>
                    <span>Report maintenance issues immediately</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-room">
              <h3>No Room Assigned</h3>
              <p>Please contact the hostel administration to get a room assigned.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 