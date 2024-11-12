import React, { useEffect } from 'react'

export default function TestConnection() {
  useEffect(() => {
    const testBackend = async () => {
      try {
        const response = await fetch('http://localhost:5000/test', {
          credentials: 'include'
        })
        const data = await response.json()
        console.log('Backend test response:', data)
      } catch (error) {
        console.error('Backend connection test failed:', error)
      }
    }
    testBackend()
  }, [])

  return null
} 