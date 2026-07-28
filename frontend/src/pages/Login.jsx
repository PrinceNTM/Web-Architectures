import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api.js'
import { normalizeUser, writeStoredUser } from '../utils/profileStorage.js'

function Login({ setUser }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

  const getProviderUrl = (provider) => `${API_BASE.replace(/\/$/, '')}/auth/${provider}`

  const handleSocialLogin = (provider) => {
    window.location.href = getProviderUrl(provider)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!acceptedTerms) {
      setError('Bitte akzeptiere AGB und Datenschutz, um fortzufahren.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await authAPI.login({ email, password })
      if (response?.data) {
        const nextUser = normalizeUser(response.data)
        writeStoredUser(nextUser)
        setUser(nextUser)
        navigate('/dashboard')
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
    <div className="login-page login-page-headspace">
      <div className="login-shell">
        <aside className="login-ambient" aria-hidden="true">
          <span className="ambient-blob ambient-blob-main" />
          <span className="ambient-blob ambient-blob-soft" />
          <p className="ambient-eyebrow">Welcome back</p>
          <h2>Fokussiert einloggen. Ruhig weitermachen.</h2>
          <p>
            Ein klarer Einstieg in deine Gewohnheiten - ohne Ablenkung,
            mit einem Layout, das Ruhe und Fokus unterstuetzt.
          </p>
        </aside>

        <section className="login-card">
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

            <label className="policy-check" htmlFor="terms-consent">
              <input
                id="terms-consent"
                data-cy="terms-consent"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
              />
              <span>Ich akzeptiere AGB und Datenschutz.</span>
            </label>

            <button className="login-btn" data-cy="login-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Anmelden...' : 'Anmelden'}
            </button>
          </form>

          <div className="social-divider" role="presentation">
            <span>oder mit</span>
          </div>

          <div className="social-login-grid">
            <button className="social-btn" type="button" onClick={() => handleSocialLogin('google')}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 4.2a7.8 7.8 0 0 1 5.4 2.1l-2.2 2.2A4.6 4.6 0 0 0 12 7.2 4.8 4.8 0 0 0 7.5 10c-.8 1.6-.8 2.4 0 4A4.8 4.8 0 0 0 12 16.8c1.5 0 2.6-.4 3.4-1.2.5-.5.8-1.2.9-2.1H12v-3h7.2c.1.5.2 1 .2 1.7 0 2-.7 3.8-2 5.1A7.4 7.4 0 0 1 12 19.8c-3.6 0-6.7-2-8.3-5A8 8 0 0 1 3 12a8 8 0 0 1 .7-2.8c1.6-3 4.7-5 8.3-5Z" />
              </svg>
              <span>Google</span>
            </button>
            <button className="social-btn" type="button" onClick={() => handleSocialLogin('facebook')}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M13.2 8.3h2.5V5.1h-2.5c-2.5 0-4.2 1.7-4.2 4.3v2H6.7v3.1H9v5.4h3.3v-5.4h2.8l.5-3.1h-3.3v-1.8c0-.8.3-1.3.9-1.3Z" />
              </svg>
              <span>Facebook</span>
            </button>
          </div>

          <p className="login-footer">
            Noch kein Konto? <Link to="/register">Registrieren</Link>
          </p>
        </section>
      </div>
    </div>
  )
}

export default Login
