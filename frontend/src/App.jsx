import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import LandingPage from './components/Landing/LandingPage.jsx'
import { authAPI } from './services/api.js'
import { normalizeUser, readStoredUser, writeStoredUser, clearStoredUser } from './utils/profileStorage.js'

function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await authAPI.getProfile()
        const nextUser = normalizeUser(response.data)
        writeStoredUser(nextUser)
        setUser(nextUser)
      } catch (error) {
        const storedUser = readStoredUser()
        setUser(storedUser || null)
      } finally {
        setAuthLoading(false)
      }
    }

    checkSession()
  }, [])

  if (authLoading) {
    return <div className="loading-screen">Authentifizierung wird geprüft...</div>
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login setUser={setUser} />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" replace /> : <Register />}
      />
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />}
      />
      <Route
        path="/dashboard"
        element={
          user
            ? <Dashboard onLogout={() => { clearStoredUser(); setUser(null) }} user={user} onUserChange={setUser} />
            : <Navigate to="/" replace state={{ from: location }} />
        }
      />
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} replace />} />
    </Routes>
  )
}

export default App
