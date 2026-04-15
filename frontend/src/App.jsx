import { useState } from 'react'
import './App.css'

function App() {
  const [habits, setHabits] = useState([
    { id: 1, name: 'Drink 8 glasses of water', category: 'Health & Fitness', streak: 0, completed: 3, total: 8 },
    { id: 2, name: 'Digital detox hour', category: 'Wellness', streak: 0, completed: true }
  ])

  const [currentView, setCurrentView] = useState('daily')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [newHabitInput, setNewHabitInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

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
    { name: 'Practice gratitude', category: 'Mental Health' }
  ]

  const addHabit = () => {
    if (newHabitInput.trim() === '') return

    const newHabit = {
      id: Date.now(),
      name: newHabitInput,
      category: 'General',
      streak: 0,
      completed: false,
      total: 0
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
    setHabits(habits.filter(habit => habit.id !== id))
  }

  const addSuggestedHabit = (suggestion) => {
    const newHabit = {
      id: Date.now(),
      name: suggestion.name,
      category: suggestion.category,
      streak: 0,
      completed: false,
      total: 0
    }

    setHabits([...habits, newHabit])
    setShowSuggestions(false)
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = i === new Date().getDate() && 
                      currentDate.getMonth() === new Date().getMonth() &&
                      currentDate.getFullYear() === new Date().getFullYear()
      days.push(
        <div key={i} className={`calendar-day ${isToday ? 'today' : ''}`}>
          {i}
        </div>
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

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-left">
          <svg className="logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            {/* D */}
            <line x1="20" y1="20" x2="20" y2="80" stroke="#06b6d4" strokeWidth="7" strokeLinecap="round"/>
            <path d="M 20 20 Q 60 20 60 50 Q 60 80 20 80" fill="none" stroke="#06b6d4" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
            
            {/* Checkmark overlaid on D */}
            <polyline points="32,50 45,63 75,30" fill="none" stroke="#06b6d4" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1>Daily Habits</h1>
        </div>
      </header>

      <div className="tabs">
        <button className={`tab ${currentView === 'daily' ? 'active' : ''}`} onClick={() => setCurrentView('daily')}>Daily View</button>
        <button className={`tab ${currentView === 'calendar' ? 'active' : ''}`} onClick={() => setCurrentView('calendar')}>Calendar View</button>
      </div>

      <div className={`views-container ${currentView === 'calendar' ? 'show-calendar' : ''}`}>
        {/* Daily View */}
        <div className="daily-view">
          <div className="input-section">
            <input 
              type="text" 
              placeholder="Enter a new habit..." 
              className="habit-input" 
              value={newHabitInput}
              onChange={(e) => setNewHabitInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="add-btn" onClick={addHabit}>+</button>
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
              <div key={habit.id} className="habit-card">
                <div className="habit-left">
                  <button className="checkbox" style={{ background: habit.completed ? '#06b6d4' : 'transparent' }}>
                    {habit.completed && '✓'}
                  </button>
                  {habit.total && <span className="progress">{habit.completed}/{habit.total}</span>}
                </div>
                <div className="habit-content">
                  <h3 style={{ color: habit.completed ? '#06b6d4' : 'white' }}>{habit.name}</h3>
                  <div className="habit-meta">
                    <span>Streak: {habit.streak} days</span>
                    <span className="category">{habit.category}</span>
                  </div>
                </div>
                <div className="habit-actions">
                  <button className="edit-btn">✏️</button>
                  <button className="delete-btn" onClick={() => deleteHabit(habit.id)}>🗑️</button>
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

        {/* Calendar View */}
        <div className="calendar-view">
          <div className="calendar-header">
            <button className="month-nav" onClick={prevMonth}>←</button>
            <h2 className="month-title">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <button className="month-nav" onClick={nextMonth}>→</button>
          </div>
          
          <div className="calendar-weekdays">
            <div className="weekday">Sun</div>
            <div className="weekday">Mon</div>
            <div className="weekday">Tue</div>
            <div className="weekday">Wed</div>
            <div className="weekday">Thu</div>
            <div className="weekday">Fri</div>
            <div className="weekday">Sat</div>
          </div>
          
          <div className="calendar-grid">
            {renderCalendar()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
