import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'student', year: '1'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await register(form.name, form.email, form.password, form.role, null, form.year)
      const role = data.user?.role
      switch (role) {
        case 'student': navigate('/student'); break
        case 'faculty': navigate('/faculty'); break
        case 'admin': navigate('/admin'); break
        case 'placement_officer': navigate('/placement'); break
        default: navigate('/')
      }
    } catch (err) {
      setError(err.message || 'Registration failed.')
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card slide-up">
        <div className="logo">
          <div className="logo-icon">CC</div>
          <h1>CampusConnect</h1>
          <p>Create your account</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              id="name" name="name" type="text" className="form-input"
              placeholder="John Doe" value={form.name}
              onChange={handleChange} required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email" name="email" type="email" className="form-input"
              placeholder="you@university.edu" value={form.email}
              onChange={handleChange} required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password" name="password" type="password" className="form-input"
              placeholder="Min 6 characters" value={form.password}
              onChange={handleChange} required minLength={6}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role">Role</label>
            <select id="role" name="role" className="form-select" value={form.role} onChange={handleChange}>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
              <option value="placement_officer">Placement Officer</option>
            </select>
          </div>

          {form.role === 'student' && (
            <div className="form-group">
              <label className="form-label" htmlFor="year">Year</label>
              <select id="year" name="year" className="form-select" value={form.year} onChange={handleChange}>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  )
}
