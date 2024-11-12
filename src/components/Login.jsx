import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardHeader, CardContent, Input, Button, FormGroup, Label } from './ui/components'
import '../styles/login.css'

export default function Login() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password
        }),
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Store user info with proper MySQL fields
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        username: data.username,
        role: data.role,
        student_id: data.student_id // for student users
      }))
      
      // Navigate based on role
      if (data.role === 'admin') {
        navigate('/admin')
      } else if (data.role === 'student') {
        navigate('/student')
      }

    } catch (err) {
      console.error('Login error:', err)
      setError(err.message)
    }
  }

  return (
    <div className="login-container">
      <Card>
        <CardHeader>Login to Hostel Management System</CardHeader>
        <CardContent>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label className="required">Username</Label>
              <Input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({
                  ...credentials,
                  username: e.target.value
                })}
                placeholder=""
                required
              />
            </FormGroup>
            <FormGroup>
              <Label className="required">Password</Label>
              <Input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({
                  ...credentials,
                  password: e.target.value
                })}
                placeholder=""
                required
              />
            </FormGroup>
            <Button type="submit">
              Login
            </Button>
          </form>
          <div className="auth-links">
            <p>
              New student? <Link to="/signup/student">Sign up here</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}