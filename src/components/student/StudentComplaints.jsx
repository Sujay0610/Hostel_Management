import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent, Button, Table, Input, FormGroup, Label } from '../ui/components'

export default function StudentComplaints() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newComplaint, setNewComplaint] = useState('')
  const studentId = localStorage.getItem('studentId') // Get from auth context in production

  const fetchComplaints = async () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    
    try {
      const response = await fetch(
        `http://localhost:5000/complaints?student_id=${user.student_id}`,
        {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (!response.ok) throw new Error('Failed to fetch complaints')
      const data = await response.json()
      setComplaints(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComplaints()
  }, [studentId])

  const handleSubmitComplaint = async (e) => {
    e.preventDefault()
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    
    try {
      const response = await fetch('http://localhost:5000/complaints', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student_id: user.student_id,
          description: newComplaint
        })
      })

      if (!response.ok) throw new Error('Failed to submit complaint')
      
      alert('Complaint submitted successfully')
      setNewComplaint('')
      fetchComplaints()
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div className="error-message">{error}</div>

  return (
    <div>
      <Card className="mb-4">
        <CardHeader>Submit New Complaint</CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitComplaint}>
            <FormGroup>
              <Label>Description</Label>
              <Input
                as="textarea"
                value={newComplaint}
                onChange={(e) => setNewComplaint(e.target.value)}
                required
              />
            </FormGroup>
            <Button type="submit">Submit Complaint</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>My Complaints</CardHeader>
        <CardContent>
          <Table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(complaint => (
                <tr key={complaint.id}>
                  <td>{complaint.description}</td>
                  <td>
                    <span className={`status-badge ${complaint.status.toLowerCase()}`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td>{new Date(complaint.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 