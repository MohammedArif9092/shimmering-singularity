import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import StudentDashboard from './pages/student/Dashboard'
import FacultyDashboard from './pages/faculty/Dashboard'
import AdminDashboard from './pages/admin/Dashboard'
import PlacementDashboard from './pages/placement/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'

function RoleRedirect() {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p>Loading CampusConnect...</p>
      </div>
    )
  }

  if (!profile) return <Navigate to="/login" />

  switch (profile.role) {
    case 'student': return <Navigate to="/student" />
    case 'faculty': return <Navigate to="/faculty" />
    case 'admin': return <Navigate to="/admin" />
    case 'placement_officer': return <Navigate to="/placement" />
    default: return <Navigate to="/login" />
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/student/*" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/faculty/*" element={
            <ProtectedRoute allowedRoles={['faculty']}>
              <FacultyDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/placement/*" element={
            <ProtectedRoute allowedRoles={['placement_officer']}>
              <PlacementDashboard />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
