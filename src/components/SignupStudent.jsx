import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardHeader, CardContent, Input, Button, FormGroup, Label } from './ui/components'
import '../styles/auth.css'

export default function SignupStudent() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    contact: '',
    date_of_birth: ''
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log('Creating student record...')
      // First create student record
      const studentResponse = await fetch('http://localhost:5000/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          contact: formData.contact,
          date_of_birth: formData.date_of_birth
        })
      })

      const studentData = await studentResponse.json()
      console.log('Student creation response:', studentData)
      
      if (!studentResponse.ok) {
        throw new Error(studentData.error || 'Failed to create student record')
      }

      console.log('Creating user account...')
      // Then create user account
      const userResponse = await fetch('http://localhost:5000/signup/student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          student_id: studentData.id
        })
      })

      const userData = await userResponse.json()
      console.log('User creation response:', userData)

      if (!userResponse.ok) {
        throw new Error(userData.error || 'Failed to create user account')
      }

      // Store user data
      const userInfo = {
        id: userData.id,
        username: userData.username,
        role: 'student',
        student_id: studentData.id
      }
      console.log('Storing user info:', userInfo)
      localStorage.setItem('user', JSON.stringify(userInfo))
      
      navigate('/student')
    } catch (err) {
      console.error('Signup error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signup-container">
      <Card className="signup-card">
        <CardHeader>Student Registration</CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Username</Label>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
              />
            </FormGroup>

            <FormGroup>
              <Label>Password</Label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </FormGroup>

            <FormGroup>
              <Label>Full Name</Label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Contact Number</Label>
              <Input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit phone number"
              />
            </FormGroup>

            <FormGroup>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </FormGroup>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="submit-button"
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </Button>

            <div className="auth-links">
              <Link to="/login">Already have an account? Login here</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 