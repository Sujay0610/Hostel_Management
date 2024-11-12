import React, { useState } from 'react'
import { Card, CardHeader, CardContent, Button } from '../ui/components'

export default function FeePayment({ fees }) {
  const [selectedFee, setSelectedFee] = useState(null)

  const handlePayment = async (feeId) => {
    try {
      const response = await fetch(`http://localhost:5000/fees/${feeId}/mark-paid`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      })
      if (!response.ok) throw new Error('Payment failed')
      // Trigger refresh callback from parent
    } catch (error) {
      console.error('Payment error:', error)
    }
  }

  return (
    <Card>
      <CardHeader>Fee Payment</CardHeader>
      <CardContent>
        <div className="fee-list">
          {fees?.map(fee => (
            <div key={fee.id} className="fee-item">
              <h4>Fee Type: {fee.type}</h4>
              <p>Amount: ${fee.amount}</p>
              <p>Due Date: {new Date(fee.dueDate).toLocaleDateString()}</p>
              <Button onClick={() => handlePayment(fee.id)}>
                Pay Now
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 