import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import API_URL from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include' })
      const data = await res.json()
      setUser(data.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMe() }, [fetchMe])

  const login = async (identifier, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: identifier, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    await fetchMe()
    return data
  }

  const register = async (username, email, password) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    return data
  }

  const logout = async () => {
    await fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' })
    setUser(null)
  }

  const verifyEmail = async (email, code) => {
    const res = await fetch(`${API_URL}/api/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, code }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    return data
  }

  const resendVerification = async (email) => {
    const res = await fetch(`${API_URL}/api/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    return data
  }

  const resetPassword = async (email) => {
    const res = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    return data
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, resetPassword, verifyEmail, resendVerification, refetch: fetchMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
export { API_URL }
