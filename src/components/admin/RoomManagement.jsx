import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent, Button, Input, FormGroup, Label } from '../ui/components'
import '../../styles/rooms.css'

export default function RoomManagement() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newRoom, setNewRoom] = useState({
    room_type: '',
    capacity: '',
    availability: true
  })
  const [showAddForm, setShowAddForm] = useState(false)

  // Fetch rooms
  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/rooms', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch rooms');
      }

      const data = await response.json();
      setRooms(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add new room
  const handleAddRoom = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:5000/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          room_type: newRoom.room_type,
          capacity: parseInt(newRoom.capacity),
          availability: newRoom.availability
        })
      })

      if (!response.ok) {
        throw new Error('Failed to add room')
      }

      // Reset form and fetch updated rooms
      setNewRoom({ room_type: '', capacity: '', availability: true })
      setShowAddForm(false)
      await fetchRooms()
    } catch (err) {
      console.error('Error:', err)
      setError(err.message)
    }
  }

  // Delete room
  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) {
      return;
    }

    try {
      console.log(`Attempting to delete room ${roomId}`); // Debug log
      
      const response = await fetch(`http://localhost:5000/rooms/${roomId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      console.log('Response status:', response.status); // Debug log
      
      const data = await response.json();
      console.log('Response data:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to delete room');
      }

      await fetchRooms();
      alert('Room deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message);
      alert(`Failed to delete room: ${err.message}`);
    }
  };

  if (loading) return <div>Loading...</div>
  if (error) return <div className="error-message">{error}</div>

  return (
    <div className="room-management">
      <Card>
        <CardHeader>
          <div className="header-with-button">
            <h2>Room Management</h2>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? 'Cancel' : 'Add New Room'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <form onSubmit={handleAddRoom} className="add-room-form">
              <FormGroup>
                <Label>Room Type</Label>
                <Input
                  type="text"
                  value={newRoom.room_type}
                  onChange={(e) => setNewRoom({
                    ...newRoom,
                    room_type: e.target.value
                  })}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Capacity</Label>
                <Input
                  type="number"
                  value={newRoom.capacity}
                  onChange={(e) => setNewRoom({
                    ...newRoom,
                    capacity: e.target.value
                  })}
                  required
                  min="1"
                />
              </FormGroup>
              <FormGroup>
                <Label>Availability</Label>
                <Input
                  type="checkbox"
                  checked={newRoom.availability}
                  onChange={(e) => setNewRoom({
                    ...newRoom,
                    availability: e.target.checked
                  })}
                />
              </FormGroup>
              <Button type="submit">Add Room</Button>
            </form>
          )}

          <div className="rooms-grid">
            {rooms.map(room => (
              <Card key={room.id} className="room-card">
                <CardContent>
                  <h3>Room {room.id}</h3>
                  <p>Type: {room.room_type}</p>
                  <p>Capacity: {room.capacity}</p>
                  <p>Current Occupancy: {room.current_occupancy}/{room.capacity}</p>
                  <div className={`status-badge ${room.availability ? 'available' : 'occupied'}`}>
                    {room.availability ? 'Available' : 'Occupied'}
                  </div>
                  {room.student_names.length > 0 && (
                    <p>Occupied by: {room.student_names.join(', ')}</p>
                  )}
                  <Button 
                    onClick={() => handleDeleteRoom(room.id)}
                    disabled={!room.availability}
                    className="delete-button"
                  >
                    Delete Room
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 