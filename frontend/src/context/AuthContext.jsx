import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, API_URL } from '../supabaseClient'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('access_token'))

  useEffect(() => {
    // Check for existing session
    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user)
          setToken(session.access_token)
          localStorage.setItem('access_token', session.access_token)
          await fetchProfile(session.access_token)
        } else {
          setUser(null)
          setProfile(null)
          setToken(null)
          localStorage.removeItem('access_token')
        }
        setLoading(false)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  async function checkSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
        setToken(session.access_token)
        localStorage.setItem('access_token', session.access_token)
        await fetchProfile(session.access_token)
      }
    } catch (err) {
      console.error('Session check error:', err)
    }
    setLoading(false)
  }

  async function fetchProfile(accessToken) {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      }
    } catch (err) {
      // Profile fetch may fail if backend isn't running — use Supabase data
      console.warn('Could not fetch profile from API, using local data')
    }
  }

  async function login(email, password) {
    // ---------------------------------------------------------
    // DEMO MOCK: Bypass actual backend auth for easy demonstration
    // ---------------------------------------------------------
    let role = 'student'
    if (email.includes('admin')) role = 'admin'
    else if (email.includes('faculty')) role = 'faculty'
    else if (email.includes('placement')) role = 'placement_officer'
    
    const mockUser = {
      id: 'mock-user-id',
      email: email,
      name: email.split('@')[0].toUpperCase(),
      role: role
    }
    
    setUser(mockUser)
    setProfile(mockUser)
    setToken('mock-jwt-token')
    localStorage.setItem('access_token', 'mock-jwt-token')
    
    return { user: mockUser, access_token: 'mock-jwt-token' }
  }

  async function register(name, email, password, role, departmentId, year) {
    // ---------------------------------------------------------
    // DEMO MOCK: Bypass actual backend auth
    // ---------------------------------------------------------
    const mockUser = {
      id: 'mock-user-id',
      email: email,
      name: name,
      role: role
    }
    
    setUser(mockUser)
    setProfile(mockUser)
    setToken('mock-jwt-token')
    localStorage.setItem('access_token', 'mock-jwt-token')
    
    return { user: mockUser, access_token: 'mock-jwt-token' }
  }

  async function logout() {
    setUser(null)
    setProfile(null)
    setToken(null)
    localStorage.removeItem('access_token')
  }

  // Helper for authenticated API calls
  async function apiFetch(endpoint, options = {}) {
    // For demo purposes, if it's the chatbot we can forward it, or just use the UI fallback
    // We'll try fetching the real backend, if it fails, throw an error to trigger UI fallbacks
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
      }
      const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers })
      if (!res.ok) {
        throw new Error('Request failed')
      }
      return await res.json()
    } catch (err) {
      console.warn(`[DEMO MODE] API call to ${endpoint} failed, relying on UI fallbacks.`)
      throw new Error('Demo mode expected failure')
    }
  }

  const value = {
    user,
    profile: profile || user,
    loading,
    token,
    login,
    register,
    logout,
    apiFetch,
    isAuthenticated: !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
