import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api.js'
import { normalizeUser, writeStoredUser } from '../utils/profileStorage.js'

function Login({ setUser }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await authAPI.login({ email, password })
      if (response?.data) {
        const nextUser = normalizeUser(response.data)
        writeStoredUser(nextUser)
        setUser(nextUser)
        navigate('/')
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        setError('E-Mail oder Passwort ungültig.')
      } else {
        setError('Fehler beim Einloggen. Bitte versuche es erneut.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Login</h1>
          <p>Bitte melde dich an, um fortzufahren.</p>
        </div>

        {error && <div className="error-message" data-cy="error-message">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label" htmlFor="login-email">E-Mail-Adresse</label>
            <input
              id="login-email"
              data-cy="login-email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="login-password">Passwort</label>
            <input
              id="login-password"
              data-cy="login-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="login-btn" data-cy="login-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Anmelden...' : 'Anmelden'}
          </button>
        </form>

        <p className="login-footer">
          Noch kein Konto? <Link to="/register">Registrieren</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
