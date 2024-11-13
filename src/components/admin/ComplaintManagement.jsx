import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent, Button, Table, Input, FormGroup, Label } from '../ui/components'

export default function ComplaintManagement() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [newComplaint, setNewComplaint] = useState({
    student_id: '',
    description: '',
    status: 'Open'
  })
  const [statusHistory, setStatusHistory] = useState({});

  const fetchComplaints = async () => {
    try {
      console.log('Fetching complaints...'); // Debug log
      
      const response = await fetch('http://localhost:5000/complaints', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('Response status:', response.status); // Debug log
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch complaints');
      }

      const data = await response.json();
      console.log('Fetched complaints:', data); // Debug log
      setComplaints(data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError(err.message || 'Failed to fetch complaints');
    }
  };

  useEffect(() => {
    fetchComplaints()
  }, [])

  const handleAddComplaint = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          student_id: parseInt(newComplaint.student_id),
          description: newComplaint.description
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add complaint');
      }

      await fetchComplaints(); // Refresh the list after adding
      setNewComplaint({ student_id: '', description: '', status: 'Open' });
      alert('Complaint added successfully');
    } catch (error) {
      console.error('Add error:', error);
      setError(error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      console.log(`Updating complaint ${complaintId} to ${newStatus}`); // Debug log
      
      const response = await fetch(`http://localhost:5000/complaints/${complaintId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      console.log('Response status:', response.status); // Debug log
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update status');
      }

      await fetchComplaints(); // Refresh the list after updating
      alert(`Complaint ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Update error:', error);
      alert(error.message || 'Failed to update status');
    }
  };

  const fetchStatusHistory = async (complaintId) => {
    try {
      const response = await fetch(`http://localhost:5000/complaint-history/${complaintId}`);
      const data = await response.json();
      setStatusHistory(prev => ({...prev, [complaintId]: data}));
    } catch (error) {
      console.error('Error fetching status history:', error);
    }
  };

  return (
    <div className="complaint-management">
      {error && <div className="error-message">{error}</div>}
      
      <Card className="mb-4">
        <CardHeader>Add New Complaint</CardHeader>
        <CardContent>
          <form onSubmit={handleAddComplaint}>
            <FormGroup>
              <Label>Student ID</Label>
              <Input
                type="number"
                value={newComplaint.student_id}
                onChange={(e) => setNewComplaint({ ...newComplaint, student_id: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Description</Label>
              <Input
                as="textarea"
                value={newComplaint.description}
                onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                required
              />
            </FormGroup>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Complaint'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>Complaints List</CardHeader>
        <CardContent>
          <Table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((complaint) => (
                <tr key={complaint.id}>
                  <td>{complaint.student_name}</td>
                  <td>{complaint.description}</td>
                  <td>
                    <span className={`status-badge ${complaint.status.toLowerCase()}`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td>{new Date(complaint.created_at).toLocaleDateString()}</td>
                  <td>
                    {complaint.status === 'Open' && (
                      <div className="button-group">
                        <Button
                          className="success"
                          onClick={() => handleStatusUpdate(complaint.id, 'Resolved')}
                        >
                          Resolve
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleStatusUpdate(complaint.id, 'Rejected')}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="status-history">
                      {statusHistory[complaint.id] && (
                        <div className="history-timeline">
                          {statusHistory[complaint.id].map(history => (
                            <div key={history.id} className="history-item">
                              <span>{new Date(history.change_date).toLocaleString()}</span>
                              <span>{history.old_status} → {history.new_status}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 