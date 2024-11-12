import React from 'react'

export const Card = ({ children, className = '' }) => (
  <div className={`card ${className}`}>{children}</div>
)

export const CardHeader = ({ children }) => (
  <div className="card-header">{children}</div>
)

export const CardContent = ({ children }) => (
  <div className="card-content">{children}</div>
)

export const FormGroup = ({ children }) => (
  <div className="form-group">{children}</div>
)

export const Label = ({ children }) => (
  <label>{children}</label>
)

export const Input = (props) => (
  <input className="input" {...props} />
)

export const Button = ({ children, ...props }) => (
  <button className="button" {...props}>{children}</button>
)

export const Table = ({ children }) => (
  <table className="table">{children}</table>
)

export const TextArea = (props) => (
  <textarea className="textarea" {...props} />
)

export const Select = ({ children, ...props }) => (
  <select className="select" {...props}>{children}</select>
)