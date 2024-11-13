import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent, Button, Table } from '../ui/components'
import '../../styles/student.css'

export default function StudentFees() {
  const [fees, setFees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)

  const fetchFees = async () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    
    try {
      const response = await fetch(
        `http://localhost:5000/fees?student_id=${user.student_id}`,
        {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (!response.ok) throw new Error('Failed to fetch fees')
      const data = await response.json()
      setFees(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFees()
  }, [])

  const handlePayFee = async (feeId) => {
    setProcessing(true)
    try {
      const response = await fetch(`http://localhost:5000/fees/${feeId}/mark-paid`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to process payment')
      await fetchFees()
      alert('Payment successful')
    } catch (err) {
      alert(err.message)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <div className="loading">Loading fees...</div>
  if (error) return <div className="error-message">{error}</div>

  return (
    <div className="fees-container">
      <Card className="summary-card mb-4">
        <CardHeader>Fee Summary</CardHeader>
        <CardContent>
          <div className="fee-summary">
            <div className="summary-item">
              <span>Total Pending Fees:</span>
              <span>₹{fees.reduce((sum, fee) => sum + fee.amount, 0).toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span>Number of Unpaid Fees:</span>
              <span>{fees.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>Fee Details</CardHeader>
        <CardContent>
          {fees.length === 0 ? (
            <div className="no-fees">No pending fees</div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Fee ID</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fees.map(fee => (
                  <tr key={fee.id}>
                    <td>#{fee.id}</td>
                    <td>₹{fee.amount.toFixed(2)}</td>
                    <td>{new Date(fee.due_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${fee.status.toLowerCase()}`}>
                        {fee.status}
                      </span>
                    </td>
                    <td>
                      {fee.status === 'Unpaid' && (
                        <Button 
                          className="pay-button"
                          onClick={() => handlePayFee(fee.id)}
                          disabled={processing}
                        >
                          {processing ? 'Processing...' : 'Pay Now'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 