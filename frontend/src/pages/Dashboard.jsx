import { useState, useEffect, useCallback } from 'react'
import { authAPI, habitAPI } from '../services/api.js'
import { socket } from '../services/socket.js'
import HabitCalendar from '../components/HabitCalendar.jsx'
import HabitCards from '../components/HabitCards.jsx'
import RealtimeUpdates from '../components/RealtimeUpdates.jsx'
import Sidebar from '../components/Sidebar.jsx'
import { normalizeUser, readStoredUser, writeStoredUser } from '../utils/profileStorage.js'
import { buildHabitUpdatePayload, normalizeHabits, readStoredHabits, writeStoredHabits } from '../utils/habitStorage.js'
import { getCategoryClass, getCategoryStyle } from '../utils/categoryStyles.js'
import { mapProfileLanguageToLocale, useI18n } from '../i18n/index.js'

function Dashboard({ onLogout, user, onUserChange }) {
  const { t, setLocale, getSectionLabel, getCategoryLabel } = useI18n()
  const [habits, setHabits] = useState(() => readStoredHabits())
  const [currentDate, setCurrentDate] = useState(new Date())
  const [newHabitInput, setNewHabitInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [activeSection, setActiveSection] = useState('all')
  const [selectedHabitId, setSelectedHabitId] = useState(1)
  const initialProfile = {
    firstName: '',
    lastName: '',
    language: 'Deutsch',
    email: '',
    currentPassword: '',
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
  const [categoryFilterOpen, setCategoryFilterOpen] = useState(false)
  const [categoryFilters, setCategoryFilters] = useState([])
  const [pendingCategoryFilters, setPendingCategoryFilters] = useState([])

  const categories = ['General', 'Health & Fitness', 'Wellness', 'Learning', 'Mental Health', 'Sleep', 'Exercise', 'Work', 'Daily Routine']

  useEffect(() => {
    document.body.classList.toggle('light-mode', !darkMode)
  }, [darkMode])

  useEffect(() => {
    const storedProfile = readStoredUser()
    const sourceProfile = normalizeUser(user || storedProfile || {})
    if (sourceProfile.email || sourceProfile.firstName || sourceProfile.lastName) {
      const hydratedProfile = {
        ...initialProfile,
        ...sourceProfile,
        password: '',
        confirmPassword: '',
      }
      setSavedProfile(hydratedProfile)
      setProfile(hydratedProfile)
      setLastSavedEmail(hydratedProfile.email)
    }
  }, [user])

  useEffect(() => {
    if (!showNotification) return
    const timer = setTimeout(() => setShowNotification(false), 4200)
    return () => clearTimeout(timer)
  }, [showNotification])

  useEffect(() => {
    const resetDailyCheckins = async () => {
      if (!user?.id) return
      const today = new Date().toISOString().split('T')[0]
      const lastResetDate = window.localStorage.getItem('habit-tracker-last-reset-date')
      if (lastResetDate === today) return

      try {
        await habitAPI.resetCheckins(today)
        const refreshed = await Promise.all(habits.map(async (habit) => {
          const checkins = await habitAPI.getCheckins(habit.id)
          return {
            ...habit,
            checkinDates: checkins.data.map((entry) => entry.date),
            isChecked: false,
          }
        }))
        setHabits(refreshed)
        writeStoredHabits(refreshed)
      } catch (error) {
        console.error(t('dashboard.resetCheckinsError'), error)
      } finally {
        window.localStorage.setItem('habit-tracker-last-reset-date', today)
      }
    }

    resetDailyCheckins()
  }, [user, habits])

  useEffect(() => {
    const loadHabits = async () => {
      if (!user?.id) return
      try {
        const response = await habitAPI.getAll()
        const nextHabits = normalizeHabits(response.data)
        const hydratedHabits = await Promise.all(nextHabits.map(async (habit) => {
          try {
            const checkinsResponse = await habitAPI.getCheckins(habit.id)
            const checkinDates = checkinsResponse.data.map((entry) => entry.date)
            const today = new Date().toISOString().split('T')[0]
            return {
              ...habit,
              checkinDates,
              isChecked: checkinDates.includes(today),
            }
          } catch (error) {
            return habit
          }
        }))
        setHabits(hydratedHabits)
        writeStoredHabits(hydratedHabits)
      } catch (error) {
        console.error(t('dashboard.loadHabitsError'), error)
        const fallbackHabits = readStoredHabits()
        if (fallbackHabits.length > 0) {
          setHabits(fallbackHabits)
        }
      }
    }

    loadHabits()
  }, [user])

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
    setNotification(t('dashboard.notificationNewHabit', { name: newHabit.name }))
    setShowNotification(true)
  }, [t])

  const resetProfileDraft = () => {
    setProfile(savedProfile)
  }

  const openCategoryFilter = () => {
    setPendingCategoryFilters(categoryFilters)
    setCategoryFilterOpen(true)
  }

  const togglePendingCategory = (category) => {
    setPendingCategoryFilters((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category],
    )
  }

  const applyCategoryFilters = () => {
    setCategoryFilters(pendingCategoryFilters)
    setCategoryFilterOpen(false)
  }

  const clearCategoryFilters = () => {
    setPendingCategoryFilters([])
    setCategoryFilters([])
  }

  const closeCategoryFilter = () => {
    setCategoryFilterOpen(false)
  }

  const handleSaveProfile = async (event) => {
    event.preventDefault()

    const nextProfile = {
      ...profile,
      password: '',
      confirmPassword: '',
    }

    try {
      const response = await authAPI.updateProfile({
        firstName: nextProfile.firstName,
        lastName: nextProfile.lastName,
        email: nextProfile.email,
        language: nextProfile.language,
        currentPassword: nextProfile.currentPassword,
      })

      const persistedUser = normalizeUser(response.data)
      writeStoredUser(persistedUser)
      onUserChange?.(persistedUser)
      setLocale(mapProfileLanguageToLocale(persistedUser.language))
      setSavedProfile({ ...nextProfile, ...persistedUser, currentPassword: '' })
      setProfile({ ...nextProfile, ...persistedUser, currentPassword: '' })
      setLastSavedEmail(persistedUser.email)

      if (persistedUser.email !== lastSavedEmail) {
        setNotification(t('dashboard.emailChangeNotice', { email: persistedUser.email }))
        setShowNotification(true)
      }
    } catch (error) {
      console.error('Profil konnte nicht gespeichert werden', error)
      const fallbackUser = normalizeUser({ ...savedProfile, ...profile, email: profile.email, firstName: profile.firstName, lastName: profile.lastName, language: profile.language })
      writeStoredUser(fallbackUser)
      onUserChange?.(fallbackUser)
      setLocale(mapProfileLanguageToLocale(fallbackUser.language))
      setSavedProfile({ ...nextProfile, ...fallbackUser, currentPassword: '' })
      setProfile({ ...nextProfile, ...fallbackUser, currentPassword: '' })
      setNotification(t('dashboard.profileSaveErrorLocal'))
      setShowNotification(true)
    } finally {
      setCurrentPage('dashboard')
    }
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
    const first = (profile.firstName || savedProfile.firstName)?.trim()?.[0] ?? ''
    const last = (profile.lastName || savedProfile.lastName)?.trim()?.[0] ?? ''
    const initials = `${first}${last}`.toUpperCase()
    return initials || 'ND'
  }

  const suggestedHabits = t('browse.suggestions', {}, [])

  const addHabit = async () => {
    if (newHabitInput.trim() === '') return

    try {
      const response = await habitAPI.create({
        name: newHabitInput,
        category: 'General',
      })

      const newHabit = response.data
      const normalizedHabit = normalizeHabits([newHabit])[0]
      const nextHabits = [...habits, normalizedHabit]

      setHabits(nextHabits)
      writeStoredHabits(nextHabits)
      setSelectedHabitId(normalizedHabit.id)
      socket.emit('new-task', {
        id: newHabit.id,
        name: newHabit.name,
        category: newHabit.category || 'General',
      })
      setNewHabitInput('')
    } catch (error) {
      console.error(t('dashboard.habitCreateError'), error)
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
      const nextHabits = [...habits, fallbackHabit]
      setHabits(nextHabits)
      writeStoredHabits(nextHabits)
      setSelectedHabitId(fallbackHabit.id)
      setNewHabitInput('')
    }
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      addHabit()
    }
  }

  const deleteHabit = async (id) => {
    try {
      await habitAPI.delete(id)
      const nextHabits = habits.filter((habit) => habit.id !== id)
      setHabits(nextHabits)
      writeStoredHabits(nextHabits)
    } catch (error) {
      console.error(t('dashboard.habitDeleteError'), error)
    }
  }

  const handleEditHabit = (habit) => {
    setSelectedHabitId(habit.id)
    setEditingHabitId(habit.id)
    setEditedHabitName(habit.name)
  }

  const handleSaveHabit = (id) => {
    if (editedHabitName.trim() === '') {
      alert(t('validation.habitNameEmpty'))
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

  const handleUpdateHabit = async (id, updates) => {
    try {
      const payload = buildHabitUpdatePayload(updates)
      const response = await habitAPI.update(id, payload)
      const updatedHabit = normalizeHabits([response.data])[0]
      const nextHabits = habits.map((habit) => (habit.id === id ? updatedHabit : habit))
      setHabits(nextHabits)
      writeStoredHabits(nextHabits)
      setSelectedHabitId(id)
    } catch (error) {
      console.error(t('dashboard.habitUpdateError'), error)
    }
  }

  const handleToggleCheckbox = async (id) => {
    const habit = habits.find((entry) => entry.id === id)
    if (!habit) return

    const today = new Date().toISOString().split('T')[0]
    const nextChecked = !habit.isChecked

    try {
      if (nextChecked) {
        await habitAPI.checkOff(id, today)
      } else {
        await habitAPI.uncheck(id, today)
      }

      const refreshed = await habitAPI.getCheckins(id)
      const checkinDates = new Set(refreshed.data.map((entry) => entry.date))

      const nextHabits = habits.map((entry) => {
        if (entry.id !== id) return entry
        const isCheckedToday = checkinDates.has(today)
        return {
          ...entry,
          isChecked: isCheckedToday,
          completedCount: isCheckedToday ? Math.max(entry.completedCount, 1) : Math.max(0, entry.completedCount - 1),
          streak: entry.streak,
          checkinDates: Array.from(checkinDates),
        }
      })

      setHabits(nextHabits)
      writeStoredHabits(nextHabits)
      setSelectedHabitId(id)
    } catch (error) {
      console.error(t('dashboard.checkinError'), error)
    }
  }

  const addSuggestedHabit = async (suggestion) => {
    try {
      const response = await habitAPI.create({
        name: suggestion.name,
        category: suggestion.category,
        targetPerDay: 1,
        reminder: false,
        timeOfDay: suggestion.timeRange || 'Morgen',
      })

      const createdHabit = normalizeHabits([response.data])[0]
      const nextHabits = [...habits, createdHabit]
      setHabits(nextHabits)
      writeStoredHabits(nextHabits)
      setSelectedHabitId(createdHabit.id)
      setShowSuggestions(false)
    } catch (error) {
      console.error(t('dashboard.suggestedHabitSaveError'), error)
    }
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const visibleHabits = (() => {
    const sectionFiltered = activeSection === 'all'
      ? habits
      : ['Morgen', 'Nachmittag', 'Abend'].includes(activeSection)
        ? habits.filter((habit) => habit.timeRange === activeSection)
        : habits

    if (categoryFilters.length === 0) {
      return sectionFiltered
    }

    return sectionFiltered.filter((habit) => categoryFilters.includes(habit.category))
  })()

  const selectedHabit = visibleHabits.find((habit) => habit.id === selectedHabitId) || visibleHabits[0] || habits[0]
  const activeSectionLabel = getSectionLabel(activeSection)
  const completedDays = selectedHabit ? buildCompletedDays(selectedHabit, currentDate) : []
  const completedToday = habits.filter((habit) => habit.isChecked).length
  const totalStreaks = habits.reduce((sum, habit) => sum + habit.streak, 0)

  if (currentPage === 'profile') {
    return (
      <div className="app-container profile-page">
        <div className="profile-header">
          <button className="back-btn" onClick={handleCancelProfile}>{t('profile.back')}</button>
          <div>
            <p className="eyebrow">{t('profile.account')}</p>
            <h1>{t('profile.title')}</h1>
          </div>
        </div>

        <div className="profile-card">
          <p className="profile-description">
            {t('profile.description')}
          </p>

          <form className="profile-form" onSubmit={handleSaveProfile}>
            <div className="form-field name-row">
              <div className="name-field">
                <label className="form-label" htmlFor="firstName">{t('profile.firstName')}</label>
                <input
                  id="firstName"
                  className="form-input"
                  value={profile.firstName}
                  onChange={(event) => setProfile({ ...profile, firstName: event.target.value })}
                />
              </div>
              <div className="name-field">
                <label className="form-label" htmlFor="lastName">{t('profile.lastName')}</label>
                <input
                  id="lastName"
                  className="form-input"
                  value={profile.lastName}
                  onChange={(event) => setProfile({ ...profile, lastName: event.target.value })}
                />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="email">{t('profile.email')}</label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={profile.email}
                onChange={(event) => setProfile({ ...profile, email: event.target.value })}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="currentPassword">{t('profile.currentPassword')}</label>
              <input
                id="currentPassword"
                type="password"
                className="form-input"
                placeholder={t('profile.currentPasswordPlaceholder')}
                value={profile.currentPassword}
                onChange={(event) => setProfile({ ...profile, currentPassword: event.target.value })}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="language">{t('profile.language')}</label>
              <select
                id="language"
                className="form-input"
                value={profile.language}
                onChange={(event) => setProfile({ ...profile, language: event.target.value })}
              >
                <option value="Deutsch">Deutsch</option>
                <option value="English">English</option>
              </select>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="password">{t('profile.password')}</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder={t('profile.newPasswordPlaceholder')}
                value={profile.password}
                onChange={(event) => setProfile({ ...profile, password: event.target.value })}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="confirmPassword">{t('profile.confirmPassword')}</label>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                placeholder={t('profile.confirmPasswordPlaceholder')}
                value={profile.confirmPassword}
                onChange={(event) => setProfile({ ...profile, confirmPassword: event.target.value })}
              />
            </div>

            <div className="form-field toggle-row">
              <div>
                <label className="form-label">{t('profile.twoFactor')}</label>
                <p className="toggle-description">{t('profile.twoFactorDescription')}</p>
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
                <label className="form-label">{t('profile.notifications')}</label>
                <p className="toggle-description">{t('profile.notificationsDescription')}</p>
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
              <button className="save-btn" type="submit">{t('profile.save')}</button>
              <button className="cancel-btn" type="button" onClick={handleCancelProfile}>{t('profile.cancel')}</button>
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
              <p className="eyebrow">{t('dashboard.eyebrow')}</p>
              <h1>{activeSection === 'all' || activeSection === 'resources' ? t('dashboard.allHabits') : activeSectionLabel}</h1>
            </div>
            <div className="header-metrics">
              <div>
                <span>{t('dashboard.today')}</span>
                <strong>{completedToday}/{habits.length}</strong>
              </div>
              <div>
                <span>{t('dashboard.streaks')}</span>
                <strong>{totalStreaks}</strong>
              </div>
            </div>
          </div>

          <section className="composer-panel" aria-label={t('dashboard.composerAria')}>
            <input
              id="new-habit-input"
              type="text"
              placeholder={t('dashboard.newHabitPlaceholder')}
              className="habit-input"
              data-cy="new-habit-input"
              value={newHabitInput}
              onChange={(event) => setNewHabitInput(event.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button className="add-btn" data-cy="add-habit-btn" onClick={addHabit} type="button">+</button>
            <button className="browse-btn" onClick={() => setShowSuggestions((prev) => !prev)} type="button">{t('dashboard.browseButton')}</button>
            <button className="icon-btn" onClick={openCategoryFilter} type="button" aria-label={t('dashboard.openFilterAria')}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 5h18M6 12h12M10 19h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </section>

          {categoryFilterOpen && (
            <div className="filter-popout-overlay" role="dialog" aria-modal="true" onClick={closeCategoryFilter}>
              <div className="filter-popout" onClick={(event) => event.stopPropagation()}>
                <div className="filter-popout-header">
                  <h3>{t('dashboard.filterTitle')}</h3>
                  <button className="icon-btn" type="button" onClick={closeCategoryFilter} aria-label={t('dashboard.closeFilterAria')}>×</button>
                </div>
                <div className="filter-list">
                  {categories.map((category) => {
                    const active = pendingCategoryFilters.includes(category)
                    return (
                      <button
                        key={category}
                        type="button"
                        className={`filter-item ${active ? 'active' : ''} ${getCategoryClass(category)}`}
                        style={getCategoryStyle(category, darkMode ? 'dark' : 'light')}
                        onClick={() => togglePendingCategory(category)}
                      >
                        <span className="filter-item-label">{getCategoryLabel(category)}</span>
                        <span className={`filter-item-check ${active ? 'active' : ''}`} aria-hidden="true">
                          {active ? '✓' : ''}
                        </span>
                      </button>
                    )
                  })}
                </div>
                <div className="filter-popout-actions">
                  <button className="cancel-btn" type="button" onClick={clearCategoryFilters}>{t('filter.clear')}</button>
                  <button className="save-btn" type="button" onClick={applyCategoryFilters}>{t('filter.apply')}</button>
                </div>
              </div>
            </div>
          )}

          {showSuggestions && (
            <div className="suggestions-modal" role="dialog" aria-modal="true">
              <div className="suggestions-card">
                <div className="suggestions-header">
                  <h3>{t('browse.title')}</h3>
                  <button className="close-btn" onClick={() => setShowSuggestions(false)} type="button">{t('browse.close')}</button>
                </div>
                <div className="suggestions-list">
                  {suggestedHabits.map((suggestion, index) => (
                    <button key={index} className="suggestion-item" onClick={() => addSuggestedHabit(suggestion)} type="button">
                      <span>
                        <strong>{suggestion.name}</strong>
                        <small>{getCategoryLabel(suggestion.category)}</small>
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
            theme={darkMode ? 'dark' : 'light'}
          />
        </main>

        <HabitCalendar
          habit={selectedHabit}
          currentDate={currentDate}
          completedDays={completedDays}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
          theme={darkMode ? 'dark' : 'light'}
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
