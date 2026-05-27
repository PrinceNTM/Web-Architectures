import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api.js'

function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.')
      return
    }

    setIsSubmitting(true)

    try {
      await authAPI.register({ email, password })
      setSuccess('Registrierung erfolgreich. Bitte melde dich an.')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      if (err?.response?.status === 409) {
        setError('E-Mail bereits vergeben.')
      } else {
        setError('Fehler bei der Registrierung. Bitte versuche es erneut.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Registrieren</h1>
          <p>Erstelle ein neues Konto.</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label" htmlFor="register-email">E-Mail-Adresse</label>
            <input
              id="register-email"
              data-cy="register-email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="register-password">Passwort</label>
            <input
              id="register-password"
              data-cy="register-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="register-confirm-password">Passwort bestätigen</label>
            <input
              id="register-confirm-password"
              data-cy="register-confirm-password"
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button className="login-btn" data-cy="register-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Registrieren...' : 'Registrieren'}
          </button>
        </form>

        <p className="login-footer">
          Bereits ein Konto? <Link to="/login">Anmelden</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
