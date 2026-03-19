import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { profile, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p>Verifying access...</p>
      </div>
    )
  }

  if (!isAuthenticated || !profile) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />
  }

  return children
}
