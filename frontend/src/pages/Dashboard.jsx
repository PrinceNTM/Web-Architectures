import { useState, useEffect } from 'react'
import { authAPI } from '../services/api.js'

function Dashboard({ onLogout }) {
  const [habits, setHabits] = useState([
    { id: 1, name: 'Drink 8 glasses of water', category: 'Health & Fitness', streak: 0, completedCount: 3, total: 8, isChecked: false },
    { id: 2, name: 'Digital detox hour', category: 'Wellness', streak: 0, completedCount: 0, total: 0, isChecked: false }
  ])
  const [currentView, setCurrentView] = useState('daily')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [newHabitInput, setNewHabitInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const initialProfile = {
    firstName: 'Nina',
    lastName: 'Doe',
    language: 'Deutsch',
    email: 'nina@example.com',
    password: '',
    confirmPassword: '',
    twoFactor: false,
  }
  const [savedProfile, setSavedProfile] = useState(initialProfile)
  const [profile, setProfile] = useState(initialProfile)
  const [lastSavedEmail, setLastSavedEmail] = useState(initialProfile.email)
  const [notification, setNotification] = useState('')
  const [showNotification, setShowNotification] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [editingHabitId, setEditingHabitId] = useState(null)
  const [editedHabitName, setEditedHabitName] = useState('')

  useEffect(() => {
    document.body.classList.toggle('light-mode', !darkMode)
  }, [darkMode])

  useEffect(() => {
    if (!showNotification) return
    const timer = setTimeout(() => setShowNotification(false), 4200)
    return () => clearTimeout(timer)
  }, [showNotification])

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev)
  }

  const resetProfileDraft = () => {
    setProfile(savedProfile)
  }

  const handleSaveProfile = (e) => {
    e.preventDefault()
    setSavedProfile({ ...profile, confirmPassword: '' })
    setProfile({ ...profile, confirmPassword: '' })

    if (profile.email !== lastSavedEmail) {
      setNotification(`Eine Bestätigungsemail wurde an ${profile.email} gesendet.`)
      setShowNotification(true)
      setLastSavedEmail(profile.email)
    }

    setCurrentPage('dashboard')
  }

  const handleCancelProfile = () => {
    resetProfileDraft()
    setCurrentPage('dashboard')
  }

  const handleLogout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout failed', error)
    } finally {
      onLogout()
      setShowSettings(false)
    }
  }

  const getAvatarInitials = () => {
    const first = profile.firstName?.trim()?.[0] ?? ''
    const last = profile.lastName?.trim()?.[0] ?? ''
    const initials = `${first}${last}`.toUpperCase()
    return initials || 'ND'
  }

  const suggestedHabits = [
    { name: 'Morning exercise', category: 'Health & Fitness' },
    { name: 'Read for 30 minutes', category: 'Learning' },
    { name: 'Meditate', category: 'Wellness' },
    { name: 'Drink 8 glasses of water', category: 'Health & Fitness' },
    { name: 'Journal', category: 'Mental Health' },
    { name: 'Early sleep (by 10 PM)', category: 'Sleep' },
    { name: 'No social media after 8 PM', category: 'Wellness' },
    { name: 'Take vitamins', category: 'Health & Fitness' },
    { name: 'Walk 10,000 steps', category: 'Exercise' },
    { name: 'Practice gratitude', category: 'Mental Health' },
  ]

  const addHabit = () => {
    if (newHabitInput.trim() === '') return

    const newHabit = {
      id: Date.now(),
      name: newHabitInput,
      category: 'General',
      streak: 0,
      completedCount: 0,
      total: 0,
      isChecked: false,
    }

    setHabits([...habits, newHabit])
    setNewHabitInput('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addHabit()
    }
  }

  const deleteHabit = (id) => {
    setHabits(habits.filter((habit) => habit.id !== id))
  }

  const handleEditHabit = (habit) => {
    setEditingHabitId(habit.id)
    setEditedHabitName(habit.name)
  }

  const handleSaveHabit = (id) => {
    if (editedHabitName.trim() === '') {
      alert('Habit name cannot be empty')
      return
    }
    setHabits(habits.map((habit) => (habit.id === id ? { ...habit, name: editedHabitName } : habit)))
    setEditingHabitId(null)
    setEditedHabitName('')
  }

  const handleCancelEdit = () => {
    setEditingHabitId(null)
  }

  const handleToggleCheckbox = (id) => {
    setHabits(habits.map((habit) => (habit.id === id ? { ...habit, isChecked: !habit.isChecked } : habit)))
  }

  const addSuggestedHabit = (suggestion) => {
    const newHabit = {
      id: Date.now(),
      name: suggestion.name,
      category: suggestion.category,
      streak: 0,
      completedCount: 0,
      total: 0,
      isChecked: false,
    }

    setHabits([...habits, newHabit])
    setShowSuggestions(false)
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return (day + 6) % 7
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const isToday =
        i === new Date().getDate() &&
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear()
      days.push(
        <div key={i} className={`calendar-day ${isToday ? 'today' : ''}`}>
          {i}
        </div>,
      )
    }

    return days
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  if (currentPage === 'profile') {
    return (
      <div className="app-container profile-page">
        <div className="profile-header">
          <button className="back-btn" onClick={handleCancelProfile}>← Zurück</button>
          <div>
            <h1>Profil bearbeiten</h1>
          </div>
        </div>

        <div className="profile-card">
          <p className="profile-description">
            Passe hier deinen Namen, Sprache, E-Mail und Passwort an. Aktiviere zusätzlich die Zwei-Faktor-Authentifizierung,
            um dein Konto für zukünftige Logins extra zu schützen.
          </p>

          <form className="profile-form" onSubmit={handleSaveProfile}>
            <div className="form-field name-row">
              <div className="name-field">
                <label className="form-label" htmlFor="firstName">Vorname</label>
                <input
                  id="firstName"
                  className="form-input"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                />
              </div>
              <div className="name-field">
                <label className="form-label" htmlFor="lastName">Nachname</label>
                <input
                  id="lastName"
                  className="form-input"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="email">E-Mail-Adresse</label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="language">Sprache</label>
              <select
                id="language"
                className="form-input"
                value={profile.language}
                onChange={(e) => setProfile({ ...profile, language: e.target.value })}
              >
                <option>Deutsch</option>
                <option>English</option>
                <option>Français</option>
              </select>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="password">Passwort</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Neues Passwort eingeben"
                value={profile.password}
                onChange={(e) => setProfile({ ...profile, password: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="confirmPassword">Neues Passwort bestätigen</label>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                placeholder="Passwort erneut eingeben"
                value={profile.confirmPassword}
                onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
              />
            </div>

            <div className="form-field toggle-row">
              <div>
                <label className="form-label">Zwei-Faktor-Authentifizierung</label>
                <p className="toggle-description">Schütze dein Konto zusätzlich für zukünftige Logins.</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={profile.twoFactor}
                  onChange={(e) => setProfile({ ...profile, twoFactor: e.target.checked })}
                />
                <span className="slider" />
              </label>
            </div>

            <div className="profile-actions">
              <button className="save-btn" type="submit">Speichern</button>
              <button className="cancel-btn" type="button" onClick={handleCancelProfile}>Abbrechen</button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      {showNotification && (
        <div className="notification-popup" role="status">
          {notification}
        </div>
      )}
      <header className="header">
        <div className="header-left">
          <svg className="logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <line x1="20" y1="20" x2="20" y2="80" stroke="#06b6d4" strokeWidth="7" strokeLinecap="round" />
            <path d="M 20 20 Q 60 20 60 50 Q 60 80 20 80" fill="none" stroke="#06b6d4" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="32,50 45,63 75,30" fill="none" stroke="#06b6d4" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1>Daily Habits</h1>
        </div>
        <div className="header-right">
          <div className="mode-switch">
            <span className="mode-label">{darkMode ? 'Dark' : 'Light'}</span>
            <label className="dark-switch">
              <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
              <span className="slider" />
            </label>
          </div>

          <button className="avatar-btn" aria-label="Profil" onClick={() => setShowSettings(!showSettings)}>
            <span>{getAvatarInitials()}</span>
          </button>

          {showSettings && (
            <div className="settings-menu">
              <button
                className="settings-menu-item"
                onClick={() => {
                  resetProfileDraft()
                  setCurrentPage('profile')
                  setShowSettings(false)
                }}
              >
                Profil bearbeiten
              </button>
              <div className="settings-menu-item notifications-toggle">
                <span>Benachrichtigungen</span>
                <label className="notifications-switch">
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  />
                  <span className="slider" />
                </label>
              </div>
              <button className="settings-menu-item" onClick={handleLogout}>Abmelden</button>
            </div>
          )}
        </div>
      </header>

      <div className="tabs">
        <button className={`tab ${currentView === 'daily' ? 'active' : ''}`} onClick={() => setCurrentView('daily')}>Tagesansicht</button>
        <button className={`tab ${currentView === 'calendar' ? 'active' : ''}`} onClick={() => setCurrentView('calendar')}>Kalenderansicht</button>
      </div>

      <div className={`views-container ${currentView === 'calendar' ? 'show-calendar' : ''}`}>
        <div className="daily-view">
          <div className="input-section">
            <input
              type="text"
              placeholder="Enter a new habit..."
              className="habit-input"
              data-cy="new-habit-input"
              value={newHabitInput}
              onChange={(e) => setNewHabitInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="add-btn" data-cy="add-habit-btn" onClick={addHabit}>+</button>
            <button className="browse-btn" onClick={() => setShowSuggestions(!showSuggestions)}>Browse</button>
          </div>

          {showSuggestions && (
            <div className="suggestions-modal">
              <div className="suggestions-header">
                <h3>Suggested Habits</h3>
                <button className="close-btn" onClick={() => setShowSuggestions(false)}>✕</button>
              </div>
              <div className="suggestions-list">
                {suggestedHabits.map((suggestion, index) => (
                  <div key={index} className="suggestion-item" onClick={() => addSuggestedHabit(suggestion)}>
                    <div className="suggestion-content">
                      <p className="suggestion-name">{suggestion.name}</p>
                      <span className="suggestion-category">{suggestion.category}</span>
                    </div>
                    <span className="add-icon">+</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="habits-list">
            {habits.map((habit) => (
              <div key={habit.id} className="habit-card" data-cy={`habit-${habit.id}`}>
                <div className="habit-left">
                  <button
                    className="checkbox"
                    style={{ background: habit.isChecked ? '#06b6d4' : 'transparent' }}
                    onClick={() => handleToggleCheckbox(habit.id)}
                    aria-label="Mark as complete"
                  >
                    {habit.isChecked && '✓'}
                  </button>
                  {habit.total > 0 && <span className="progress">{habit.completedCount}/{habit.total}</span>}
                </div>
                <div className="habit-content">
                  {editingHabitId === habit.id ? (
                    <input
                      type="text"
                      className="edit-habit-input"
                      value={editedHabitName}
                      onChange={(e) => setEditedHabitName(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <>
                      <h3 data-cy="habit-name" style={{ color: habit.completed ? '#06b6d4' : 'white' }}>{habit.name}</h3>
                      <div className="habit-meta">
                        <span>Streak: {habit.streak} days</span>
                        <span className="category">{habit.category}</span>
                      </div>
                    </>
                  )}
                </div>
                <div className="habit-actions">
                  {editingHabitId === habit.id ? (
                    <>
                      <button className="save-btn" onClick={() => handleSaveHabit(habit.id)} title="Speichern">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <polyline points="16 3 20 7 9 18" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button className="cancel-btn" onClick={handleCancelEdit} title="Abbrechen">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="#e2e8f0" strokeWidth="2" />
                          <path d="M8 12h8M12 8v8" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="edit-btn" onClick={() => handleEditHabit(habit)} aria-label="Bearbeiten">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 19.5C4 20.3284 4.67157 21 5.5 21H18.5C19.3284 21 20 20.3284 20 19.5V7.5C20 6.67157 19.3284 6 18.5 6H15.5L14 4.5H5.5C4.67157 4.5 4 5.17157 4 6V19.5Z" stroke="#e2e8f0" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M8.5 15.5L15 9L16.5 10.5L10 17L8.5 17.5L8.5 15.5Z" fill="#e2e8f0" />
                          <path d="M15.25 8.75L16.25 9.75" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                      <button className="delete-btn" aria-label="Löschen" onClick={() => deleteHabit(habit.id)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 7H18" stroke="#e2e8f0" strokeWidth="1.8" strokeLinecap="round" />
                          <path d="M9 7V5.5C9 4.67157 9.67157 4 10.5 4H13.5C14.3284 4 15 4.67157 15 5.5V7" stroke="#e2e8f0" strokeWidth="1.8" strokeLinecap="round" />
                          <path d="M7 7L7.5 19.5C7.5 20.3284 8.17157 21 9 21H15C15.8284 21 16.5 20.3284 16.5 19.5L17 7" stroke="#e2e8f0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M10 11V17" stroke="#e2e8f0" strokeWidth="1.8" strokeLinecap="round" />
                          <path d="M14 11V17" stroke="#e2e8f0" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <section className="summary">
            <h2>Progress Summary</h2>
            <div className="summary-grid">
              <div className="summary-card">
                <p className="label">Completed Today</p>
                <p className="value">1/2</p>
              </div>
              <div className="summary-card">
                <p className="label">Total Streaks</p>
                <p className="value">0</p>
              </div>
            </div>
          </section>
        </div>

        <div className="calendar-view">
          <div className="calendar-header">
            <button className="month-nav" onClick={prevMonth}>←</button>
            <h2 className="month-title">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <button className="month-nav" onClick={nextMonth}>→</button>
          </div>

          <div className="calendar-weekdays">
            <div className="weekday">Mo</div>
            <div className="weekday">Di</div>
            <div className="weekday">Mi</div>
            <div className="weekday">Do</div>
            <div className="weekday">Fr</div>
            <div className="weekday">Sa</div>
            <div className="weekday">So</div>
          </div>

          <div className="calendar-grid">{renderCalendar()}</div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
