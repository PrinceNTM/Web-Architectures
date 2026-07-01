import { useState, useEffect, useCallback } from 'react'
import { authAPI, habitAPI } from '../services/api.js'
import { socket } from '../services/socket.js'
import HabitCalendar from '../components/HabitCalendar.jsx'
import HabitCards from '../components/HabitCards.jsx'
import RealtimeUpdates from '../components/RealtimeUpdates.jsx'
import Sidebar from '../components/Sidebar.jsx'

function Dashboard({ onLogout }) {
  const [habits, setHabits] = useState([
    { id: 1, name: 'Drink 8 glasses of water', category: 'Health & Fitness', streak: 0, completedCount: 3, total: 8, isChecked: false, timeRange: 'Morgen' },
    { id: 2, name: 'Digital detox hour', category: 'Wellness', streak: 0, completedCount: 0, total: 0, isChecked: false, timeRange: 'Abend' },
  ])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [newHabitInput, setNewHabitInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [activeSection, setActiveSection] = useState('all')
  const [selectedHabitId, setSelectedHabitId] = useState(1)
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

  useEffect(() => {
    if (habits.length === 0) {
      setSelectedHabitId(null)
      return
    }

    if (!habits.some((habit) => habit.id === selectedHabitId)) {
      setSelectedHabitId(habits[0].id)
    }
  }, [habits, selectedHabitId])

  const handleRealtimeHabit = useCallback((payload) => {
    const newHabit = {
      id: payload.id,
      name: payload.name,
      category: payload.category || 'General',
      streak: 0,
      completedCount: 0,
      total: 0,
      isChecked: false,
      timeRange: payload.timeRange || 'Morgen',
    }

    setHabits((prevHabits) =>
      prevHabits.some((habit) => habit.id === newHabit.id)
        ? prevHabits
        : [...prevHabits, newHabit],
    )
    setNotification(`Neue Gewohnheit "${newHabit.name}" wurde erstellt!`)
    setShowNotification(true)
  }, [])

  const resetProfileDraft = () => {
    setProfile(savedProfile)
  }

  const handleSaveProfile = (event) => {
    event.preventDefault()
    setSavedProfile({ ...profile, confirmPassword: '' })
    setProfile({ ...profile, confirmPassword: '' })

    if (profile.email !== lastSavedEmail) {
      setNotification(`Eine Bestaetigungsemail wurde an ${profile.email} gesendet.`)
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

  const addHabit = async () => {
    if (newHabitInput.trim() === '') return

    try {
      const response = await habitAPI.create({
        name: newHabitInput,
        category: 'General',
      })

      const newHabit = response.data
      const normalizedHabit = {
        ...newHabit,
        streak: 0,
        completedCount: 0,
        total: 0,
        isChecked: false,
        timeRange: newHabit.timeRange || 'Morgen',
      }

      setHabits((prevHabits) => [...prevHabits, normalizedHabit])
      setSelectedHabitId(normalizedHabit.id)
      socket.emit('new-task', {
        id: newHabit.id,
        name: newHabit.name,
        category: newHabit.category || 'General',
      })
      setNewHabitInput('')
    } catch (error) {
      console.error('Fehler beim Erstellen der Habit:', error)
      const fallbackHabit = {
        id: Date.now(),
        name: newHabitInput,
        category: 'General',
        streak: 0,
        completedCount: 0,
        total: 0,
        isChecked: false,
        timeRange: 'Morgen',
      }
      setHabits((prevHabits) => [...prevHabits, fallbackHabit])
      setSelectedHabitId(fallbackHabit.id)
      setNewHabitInput('')
    }
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      addHabit()
    }
  }

  const deleteHabit = (id) => {
    setHabits((prevHabits) => prevHabits.filter((habit) => habit.id !== id))
  }

  const handleEditHabit = (habit) => {
    setSelectedHabitId(habit.id)
    setEditingHabitId(habit.id)
    setEditedHabitName(habit.name)
  }

  const handleSaveHabit = (id) => {
    if (editedHabitName.trim() === '') {
      alert('Habit name cannot be empty')
      return
    }
    setHabits((prevHabits) => prevHabits.map((habit) => (habit.id === id ? { ...habit, name: editedHabitName } : habit)))
    setEditingHabitId(null)
    setEditedHabitName('')
  }

  const handleCancelEdit = () => {
    setEditingHabitId(null)
    setEditedHabitName('')
  }

  const handleUpdateHabit = (id, updates) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) => (habit.id === id ? { ...habit, ...updates } : habit)),
    )
  }

  const handleToggleCheckbox = (id) => {
    setSelectedHabitId(id)
    setHabits((prevHabits) =>
      prevHabits.map((habit) => {
        if (habit.id !== id) return habit
        const nextChecked = !habit.isChecked
        const nextCompletedCount = Math.max(0, habit.completedCount + (nextChecked ? 1 : -1))

        return {
          ...habit,
          isChecked: nextChecked,
          completedCount: habit.total > 0 ? Math.min(habit.total, nextCompletedCount) : nextCompletedCount,
          streak: nextChecked ? habit.streak + 1 : Math.max(0, habit.streak - 1),
        }
      }),
    )
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
      timeRange: suggestion.timeRange || 'Morgen',
    }

    setHabits((prevHabits) => [...prevHabits, newHabit])
    setSelectedHabitId(newHabit.id)
    setShowSuggestions(false)
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const visibleHabits = activeSection === 'all'
    ? habits
    : ['Morgen', 'Nachmittag', 'Abend'].includes(activeSection)
      ? habits.filter((habit) => habit.timeRange === activeSection)
      : habits
  const selectedHabit = visibleHabits.find((habit) => habit.id === selectedHabitId) || visibleHabits[0] || habits[0]
  const completedDays = selectedHabit ? buildCompletedDays(selectedHabit, currentDate) : []
  const completedToday = habits.filter((habit) => habit.isChecked).length
  const totalStreaks = habits.reduce((sum, habit) => sum + habit.streak, 0)

  if (currentPage === 'profile') {
    return (
      <div className="app-container profile-page">
        <div className="profile-header">
          <button className="back-btn" onClick={handleCancelProfile}>Zurueck</button>
          <div>
            <p className="eyebrow">Account</p>
            <h1>Profil bearbeiten</h1>
          </div>
        </div>

        <div className="profile-card">
          <p className="profile-description">
            Passe hier deinen Namen, Sprache, E-Mail und Passwort an. Aktiviere zusaetzlich die Zwei-Faktor-Authentifizierung,
            um dein Konto fuer zukuenftige Logins extra zu schuetzen.
          </p>

          <form className="profile-form" onSubmit={handleSaveProfile}>
            <div className="form-field name-row">
              <div className="name-field">
                <label className="form-label" htmlFor="firstName">Vorname</label>
                <input
                  id="firstName"
                  className="form-input"
                  value={profile.firstName}
                  onChange={(event) => setProfile({ ...profile, firstName: event.target.value })}
                />
              </div>
              <div className="name-field">
                <label className="form-label" htmlFor="lastName">Nachname</label>
                <input
                  id="lastName"
                  className="form-input"
                  value={profile.lastName}
                  onChange={(event) => setProfile({ ...profile, lastName: event.target.value })}
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
                onChange={(event) => setProfile({ ...profile, email: event.target.value })}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="language">Sprache</label>
              <select
                id="language"
                className="form-input"
                value={profile.language}
                onChange={(event) => setProfile({ ...profile, language: event.target.value })}
              >
                <option>Deutsch</option>
                <option>English</option>
                <option>Francais</option>
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
                onChange={(event) => setProfile({ ...profile, password: event.target.value })}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="confirmPassword">Neues Passwort bestaetigen</label>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                placeholder="Passwort erneut eingeben"
                value={profile.confirmPassword}
                onChange={(event) => setProfile({ ...profile, confirmPassword: event.target.value })}
              />
            </div>

            <div className="form-field toggle-row">
              <div>
                <label className="form-label">Zwei-Faktor-Authentifizierung</label>
                <p className="toggle-description">Schuetze dein Konto zusaetzlich fuer zukuenftige Logins.</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={profile.twoFactor}
                  onChange={(event) => setProfile({ ...profile, twoFactor: event.target.checked })}
                />
                <span className="slider" />
              </label>
            </div>

            <div className="form-field toggle-row profile-subsetting">
              <div>
                <label className="form-label">Benachrichtigungen</label>
                <p className="toggle-description">Erhalte Hinweise, wenn neue Gewohnheiten oder Updates eintreffen.</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(event) => setNotificationsEnabled(event.target.checked)}
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
    <>
      <RealtimeUpdates onNewHabit={handleRealtimeHabit} />
      <div className="app-shell">
        {showNotification && notificationsEnabled && (
          <div className="notification-popup" role="status">
            {notification}
          </div>
        )}

        <Sidebar
          profile={profile}
          avatarInitials={getAvatarInitials()}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((prev) => !prev)}
          onOpenProfile={() => {
            resetProfileDraft()
            setCurrentPage('profile')
          }}
          onLogout={handleLogout}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <main className="main-panel">
          <div className="main-header">
            <div>
              <p className="eyebrow">Daily Habits</p>
              <h1>{activeSection === 'all' || activeSection === 'resources' ? 'Alle Habits' : activeSection}</h1>
            </div>
            <div className="header-metrics">
              <div>
                <span>Heute</span>
                <strong>{completedToday}/{habits.length}</strong>
              </div>
              <div>
                <span>Streaks</span>
                <strong>{totalStreaks}</strong>
              </div>
            </div>
          </div>

          <section className="composer-panel" aria-label="Habit erstellen">
            <input
              id="new-habit-input"
              type="text"
              placeholder="Enter a new habit..."
              className="habit-input"
              data-cy="new-habit-input"
              value={newHabitInput}
              onChange={(event) => setNewHabitInput(event.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button className="add-btn" data-cy="add-habit-btn" onClick={addHabit} type="button">+</button>
            <button className="browse-btn" onClick={() => setShowSuggestions((prev) => !prev)} type="button">Browse</button>
          </section>

          {showSuggestions && (
            <div className="suggestions-modal" role="dialog" aria-modal="true">
              <div className="suggestions-card">
                <div className="suggestions-header">
                  <h3>Suggested Habits</h3>
                  <button className="close-btn" onClick={() => setShowSuggestions(false)} type="button">x</button>
                </div>
                <div className="suggestions-list">
                  {suggestedHabits.map((suggestion, index) => (
                    <button key={index} className="suggestion-item" onClick={() => addSuggestedHabit(suggestion)} type="button">
                      <span>
                        <strong>{suggestion.name}</strong>
                        <small>{suggestion.category}</small>
                      </span>
                      <b>+</b>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <HabitCards
            habits={visibleHabits}
            selectedHabitId={selectedHabit?.id}
            onSelectHabit={setSelectedHabitId}
            onToggleHabit={handleToggleCheckbox}
            onDeleteHabit={deleteHabit}
            onUpdateHabit={handleUpdateHabit}
          />
        </main>

        <HabitCalendar
          habit={selectedHabit}
          currentDate={currentDate}
          completedDays={completedDays}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
        />
      </div>
    </>
  )
}

function buildCompletedDays(habit, date) {
  const today = new Date()
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const count = Math.min(daysInMonth, Math.max(0, habit.completedCount || 0))
  const days = new Set()

  for (let index = 0; index < count; index += 1) {
    days.add(((habit.id + index * 3) % daysInMonth) + 1)
  }

  if (
    habit.isChecked &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  ) {
    days.add(today.getDate())
  }

  return Array.from(days)
}

export default Dashboard
