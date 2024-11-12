import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent, Button, Table, Input, FormGroup, Label } from '../ui/components'

export default function FeeManagement() {
  const [fees, setFees] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [newFee, setNewFee] = useState({
    student_id: '',
    amount: '',
    due_date: '',
    description: ''
  })
  const [showHistory, setShowHistory] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);

  const fetchFees = async () => {
    try {
      console.log('Fetching fees...'); // Debug log
      
      const response = await fetch('http://localhost:5000/fees', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status); // Debug log
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch fees');
      }

      const data = await response.json();
      console.log('Fetched fees:', data); // Debug log
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }
      
      setFees(data);
    } catch (err) {
      console.error('Error fetching fees:', err);
      setError(err.message || 'Failed to fetch fees');
    }
  };

  useEffect(() => {
    fetchFees()
  }, [])

  const handleAddFee = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:5000/fees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          student_id: parseInt(newFee.student_id),
          amount: parseFloat(newFee.amount),
          due_date: newFee.due_date,
          description: newFee.description
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to add fee')
      }

      await fetchFees() // Refresh the list after adding
      setNewFee({ student_id: '', amount: '', due_date: '', description: '' })
      alert('Fee added successfully')
    } catch (error) {
      console.error('Add error:', error)
      setError(error.message || 'Failed to add fee')
      alert(error.message || 'Failed to add fee')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsPaid = async (feeId) => {
    try {
      const response = await fetch(`http://localhost:5000/fees/${feeId}/mark-paid`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to mark as paid')
      }

      await fetchFees() // Refresh the list after updating
      alert('Fee marked as paid successfully')
    } catch (error) {
      console.error('Update error:', error)
      alert(error.message || 'Failed to mark as paid')
    }
  }

  const fetchPaymentHistory = async (studentId) => {
    try {
      const response = await fetch(`http://localhost:5000/payment-history/${studentId}`);
      const data = await response.json();
      setPaymentHistory(data);
      setShowHistory(true);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  return (
    <div className="fee-management">
      {error && <div className="error-message">{error}</div>}
      
      <Card className="mb-4">
        <CardHeader>Add New Fee</CardHeader>
        <CardContent>
          <form onSubmit={handleAddFee}>
            <FormGroup>
              <Label>Student ID</Label>
              <Input
                type="number"
                value={newFee.student_id}
                onChange={(e) => setNewFee({ ...newFee, student_id: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={newFee.amount}
                onChange={(e) => setNewFee({ ...newFee, amount: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={newFee.due_date}
                onChange={(e) => setNewFee({ ...newFee, due_date: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Description</Label>
              <Input
                type="text"
                value={newFee.description}
                onChange={(e) => setNewFee({ ...newFee, description: e.target.value })}
                required
              />
            </FormGroup>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Fee'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>Fee List</CardHeader>
        <CardContent>
          <Table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee) => (
                <tr key={fee.id}>
                  <td>{fee.student_name}</td>
                  <td>${fee.amount}</td>
                  <td>{new Date(fee.due_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${fee.status.toLowerCase()}`}>
                      {fee.status}
                    </span>
                  </td>
                  <td>{fee.description}</td>
                  <td>
                    <Button onClick={() => fetchPaymentHistory(fee.student_id)}>
                      View History
                    </Button>
                    {fee.status === 'Unpaid' && (
                      <Button
                        onClick={() => handleMarkAsPaid(fee.id)}
                        disabled={loading}
                      >
                        Mark as Paid
                      </Button>
                    )}
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