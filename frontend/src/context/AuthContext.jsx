import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import client, { setAuthToken } from '../api/client'

const AuthContext = createContext(null)

const STORAGE_KEY = 'fin_ai_token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setAuthToken(token)
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const { data } = await client.get('/api/auth/me')
        if (!cancelled) setUser(data.user)
      } catch {
        if (!cancelled) {
          localStorage.removeItem(STORAGE_KEY)
          setToken(null)
          setUser(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [token])

  const login = useCallback(async (email, password) => {
    const { data } = await client.post('/api/auth/login', { email, password })
    localStorage.setItem(STORAGE_KEY, data.token)
    setAuthToken(data.token)
    setToken(data.token)
    setUser(data.user)
    return data
  }, [])

  const register = useCallback(async (email, password, name) => {
    const { data } = await client.post('/api/auth/register', {
      email,
      password,
      name,
    })
    localStorage.setItem(STORAGE_KEY, data.token)
    setAuthToken(data.token)
    setToken(data.token)
    setUser(data.user)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setAuthToken(null)
    setToken(null)
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (payload) => {
    const { data } = await client.patch('/api/auth/profile', payload)
    setUser(data.user)
    return data
  }, [])

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      isAuthenticated: Boolean(token && user),
    }),
    [token, user, loading, login, register, logout, updateProfile]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
