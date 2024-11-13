import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent, Button, Table, Input, FormGroup, Label } from '../ui/components'

export default function StudentManagement() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [newStudent, setNewStudent] = useState({
    student_id: '',
    name: '',
    contact: '',
    date_of_birth: ''
  })
  const [showArchive, setShowArchive] = useState(false);
  const [archivedStudents, setArchivedStudents] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState('')
  const [selectedRooms, setSelectedRooms] = useState({});

  const fetchStudents = async () => {
    try {
      console.log('Fetching students...'); // Debug log
      
      const response = await fetch('http://localhost:5000/students', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('Fetch response status:', response.status); // Debug log
      
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      console.log('Fetched students:', data); // Debug log
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to fetch students');
    }
  }

  const fetchAvailableRooms = async () => {
    try {
      const response = await fetch('http://localhost:5000/rooms')
      const data = await response.json()
      const available = data.filter(room => room.availability)
      setAvailableRooms(available)
    } catch (error) {
      console.error('Error fetching rooms:', error)
    }
  }

  useEffect(() => {
    fetchStudents()
    fetchAvailableRooms()
  }, [])

  const handleDeleteStudent = async (studentId) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Attempting to delete student ${studentId}`); // Debug log
      
      const response = await fetch(`http://localhost:5000/students/${studentId}`, {
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
        throw new Error(data.error || data.message || 'Failed to delete student');
      }
      
      await fetchStudents();
      alert('Student deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      setError(error.message);
      alert(`Failed to delete student: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  const handleAddStudent = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:5000/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newStudent)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to add student')
      }

      alert('Student added successfully')
      setNewStudent({ 
        student_id: '', 
        name: '', 
        contact: '', 
        date_of_birth: '' 
      })
      fetchStudents()
    } catch (error) {
      console.error('Add error:', error)
      setError(error.message || 'Failed to add student')
      alert(error.message || 'Failed to add student')
    } finally {
      setLoading(false)
    }
  }

  const fetchArchivedStudents = async () => {
    try {
      const response = await fetch('http://localhost:5000/student-archive');
      const data = await response.json();
      setArchivedStudents(data);
    } catch (error) {
      console.error('Error fetching archived students:', error);
    }
  };

  const handleAssignRoom = async (studentId, roomId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/rooms/${roomId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          student_id: studentId
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to assign room');
      }

      // Clear the selected room for this student
      setSelectedRooms(prev => {
        const updated = { ...prev };
        delete updated[studentId];
        return updated;
      });

      // Fetch updated data
      await fetchStudents();
      await fetchAvailableRooms();

      alert('Room assigned successfully');
    } catch (error) {
      console.error('Room assignment error:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignRoom = async (studentId, roomId) => {
    if (!roomId) {
      console.error('No room ID provided for unassignment');
      alert('Error: Room ID is missing');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/rooms/${roomId}/unassign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          student_id: studentId
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to unassign room');
      }

      await fetchStudents();
      await fetchAvailableRooms();
      
      alert('Room unassigned successfully');
    } catch (error) {
      console.error('Room unassignment error:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-management">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <Card className="mb-4">
        <CardHeader>Add New Student</CardHeader>
        <CardContent>
          <form onSubmit={handleAddStudent}>
            <FormGroup>
              <Label>Student ID</Label>
              <Input
                value={newStudent.student_id}
                onChange={(e) => setNewStudent({ ...newStudent, student_id: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Name</Label>
              <Input
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Contact</Label>
              <Input
                value={newStudent.contact}
                onChange={(e) => setNewStudent({ ...newStudent, contact: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={newStudent.date_of_birth}
                onChange={(e) => setNewStudent({ ...newStudent, date_of_birth: e.target.value })}
                required
              />
            </FormGroup>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Student'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>Student List</CardHeader>
        <CardContent>
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Room Assignment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.contact}</td>
                  <td>
                    <div className="room-actions">
                      <div className="room-info">
                        {student.room_assignment ? (
                          <div className="room-details">
                            Room {student.room_assignment.id} ({student.room_assignment.room_type})
                            <span className="occupancy-info">
                              ({student.room_assignment.current_occupancy}/{student.room_assignment.capacity})
                            </span>
                            <div className="assignment-date">
                              Assigned: {new Date(student.room_assignment.assignment_date).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <span className="no-room">Not assigned</span>
                        )}
                      </div>
                      
                      <div className="room-controls">
                        <select
                          value={selectedRooms[student.id] || ''}
                          onChange={(e) => setSelectedRooms({
                            ...selectedRooms,
                            [student.id]: e.target.value
                          })}
                          disabled={loading || student.room_assignment}
                          className="room-select"
                        >
                          <option value="">Select Room</option>
                          {availableRooms.map(room => (
                            <option key={room.id} value={room.id}>
                              Room {room.id} ({room.room_type}) - {room.current_occupancy}/{room.capacity}
                            </option>
                          ))}
                        </select>
                        
                        <div className="button-group">
                          <Button
                            onClick={() => handleAssignRoom(student.id, selectedRooms[student.id])}
                            disabled={!selectedRooms[student.id] || loading || student.room_assignment}
                            className="assign-button"
                          >
                            Assign
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => handleUnassignRoom(student.id, student.room_assignment?.id)}
                            disabled={loading || !student.room_assignment}
                            className="unassign-button"
                          >
                            Unassign
                          </Button>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Button 
                      variant="destructive"
                      onClick={() => handleDeleteStudent(student.id)}
                      disabled={loading}
                      className="delete-button"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>

      

      {showArchive && (
        <Card>
          <CardHeader>Archived Students</CardHeader>
          <CardContent>
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Deletion Date</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {archivedStudents.map(student => (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>{student.contact}</td>
                    <td>{new Date(student.deletion_date).toLocaleString()}</td>
                    <td>{student.reason}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 