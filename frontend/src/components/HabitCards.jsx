import { useState, useEffect, useRef } from 'react'
import { getCategoryClass, getCategoryStyle } from '../utils/categoryStyles'
import { useI18n } from '../i18n/index.js'

function HabitCards({
  habits,
  selectedHabitId,
  onSelectHabit,
  onToggleHabit,
  onDeleteHabit,
  onUpdateHabit,
  theme = 'light',
}) {
  const { t, getCategoryLabel, getTimeRangeLabel, getHabitNameLabel } = useI18n()
  const [openSettingsId, setOpenSettingsId] = useState(null)
  const [draftHabit, setDraftHabit] = useState(null)
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const categories = [
    'General',
    'Health & Fitness',
    'Wellness',
    'Learning',
    'Mental Health',
    'Sleep',
    'Exercise',
    'Work',
    'Daily Routine',
  ]
  const timeRanges = ['Morgen', 'Nachmittag', 'Abend']

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false)
      }
    }
    if (categoryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [categoryDropdownOpen])

  const openHabitSettings = (habit) => {
    setOpenSettingsId(habit.id)
    setCategoryDropdownOpen(false)
    setDraftHabit({
      name: habit.name || '',
      category: habit.category || 'General',
      dailyGoal: habit.dailyGoal || habit.total || '',
      reminder: Boolean(habit.reminder),
      timeRange: habit.timeRange || 'Morgen',
    })
  }

  const closeHabitSettings = () => {
    setOpenSettingsId(null)
    setCategoryDropdownOpen(false)
    setDraftHabit(null)
  }

  const saveHabitSettings = (habitId) => {
    if (!draftHabit?.name?.trim()) return

    onUpdateHabit(habitId, {
      name: draftHabit.name.trim(),
      category: draftHabit.category,
      targetPerDay: Number(draftHabit.dailyGoal) || 0,
      reminder: draftHabit.reminder,
      timeOfDay: draftHabit.timeRange,
    })
    closeHabitSettings()
  }

  if (habits.length === 0) {
    return (
      <div className="empty-state">
        <p>{t('habitCard.empty')}</p>
      </div>
    )
  }

  return (
    <div className="habit-card-list">
      {habits.map((habit) => {
        const isSelected = selectedHabitId === habit.id
        const isSettingsOpen = openSettingsId === habit.id
        const progressValue = habit.total > 0 ? Math.round((habit.completedCount / habit.total) * 100) : habit.isChecked ? 100 : 0
        const activeCategory = isSettingsOpen && draftHabit ? draftHabit.category : habit.category

        return (
          <article
            key={habit.id}
            className={`habit-card ${getCategoryClass(activeCategory)} ${isSelected ? 'selected' : ''}`}
            style={getCategoryStyle(activeCategory, theme)}
            data-cy={`habit-${habit.id}`}
            onClick={() => onSelectHabit(habit.id)}
          >
            <button
              className={`habit-check ${habit.isChecked ? 'checked' : ''}`}
              type="button"
              data-cy={`habit-check-${habit.id}`}
              onClick={(event) => {
                event.stopPropagation()
                onToggleHabit(habit.id)
              }}
              aria-label={t('habitCard.markDoneAria')}
            >
              {habit.isChecked ? '✓' : ''}
            </button>

            <div className="habit-main">
              <div className="habit-title-row">
                <h3 data-cy="habit-name">{getHabitNameLabel(habit.name)}</h3>
                <span className="habit-category">{getCategoryLabel(habit.category)}</span>
                {habit.timeRange && <span className="habit-category muted">{getTimeRangeLabel(habit.timeRange)}</span>}
              </div>
              <div className="habit-progress">
                <span style={{ width: `${progressValue}%` }} />
              </div>
              <div className="habit-meta">
                <span>{t('habitCard.dayStreak', { count: habit.streak })}</span>
                {habit.total > 0
                  ? <span>{t('habitCard.complete', { done: habit.completedCount, total: habit.total })}</span>
                  : <span>{habit.isChecked ? t('habitCard.doneToday') : t('habitCard.openToday')}</span>}
              </div>
            </div>

            <div className="habit-actions" onClick={(event) => event.stopPropagation()}>
              <button className="icon-btn" type="button" data-cy={`habit-delete-${habit.id}`} onClick={() => onDeleteHabit(habit.id)} aria-label={t('habitCard.deleteAria')}>x</button>
              <button
                className="icon-btn"
                type="button"
                data-cy={`habit-edit-${habit.id}`}
                onClick={() => (isSettingsOpen ? closeHabitSettings() : openHabitSettings(habit))}
                aria-label={t('habitCard.editAria')}
                aria-expanded={isSettingsOpen}
              >
                <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
                  <path d="M19.4 15a8 8 0 0 0 .1-1l2-1.5-2-3.5-2.4 1a7.8 7.8 0 0 0-1.7-1L15 6.5h-4L10.6 9a7.8 7.8 0 0 0-1.7 1L6.5 9l-2 3.5 2 1.5a8 8 0 0 0 .1 2l-2 1.5 2 3.5 2.4-1a7.8 7.8 0 0 0 1.7 1l.4 2.5h4l.4-2.5a7.8 7.8 0 0 0 1.7-1l2.4 1 2-3.5L19.4 15Z" />
                </svg>
              </button>

            </div>

            {isSettingsOpen && draftHabit && (
              <div className="habit-popout-overlay" role="presentation" onClick={closeHabitSettings}>
                <div
                  className="habit-popout"
                  role="dialog"
                  aria-modal="true"
                  aria-label={t('habitCard.editDialogAria')}
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="popout-field">
                    <label htmlFor={`habit-name-${habit.id}`}>{t('habitCard.nameLabel')}</label>
                    <input
                      id={`habit-name-${habit.id}`}
                      value={draftHabit.name}
                      onChange={(event) => setDraftHabit({ ...draftHabit, name: event.target.value })}
                    />
                  </div>

                  <div className="popout-field">
                    <label htmlFor={`habit-category-${habit.id}`}>{t('habitCard.categoryLabel')}</label>
                    <div className="custom-dropdown" ref={dropdownRef} id={`habit-category-${habit.id}-container`}>
                      <button
                        type="button"
                        className={`dropdown-trigger ${getCategoryClass(draftHabit.category)}`}
                        style={getCategoryStyle(draftHabit.category, theme)}
                        onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                        aria-expanded={categoryDropdownOpen}
                      >
                        <span className="dropdown-trigger-label">{getCategoryLabel(draftHabit.category)}</span>
                        <span className="dropdown-arrow">▼</span>
                      </button>

                      {categoryDropdownOpen && (
                        <div className="dropdown-options-list">
                          {categories.map((category) => {
                            const isSelected = draftHabit.category === category
                            return (
                              <button
                                key={category}
                                type="button"
                                className={`dropdown-option ${isSelected ? 'active' : ''} ${getCategoryClass(category)}`}
                                style={getCategoryStyle(category, theme)}
                                onClick={() => {
                                  setDraftHabit({ ...draftHabit, category })
                                  setCategoryDropdownOpen(false)
                                }}
                              >
                                <span className="dropdown-option-label">{getCategoryLabel(category)}</span>
                                <span className={`dropdown-option-check ${isSelected ? 'active' : ''}`} aria-hidden="true">
                                  {isSelected ? '✓' : ''}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="popout-field">
                    <label htmlFor={`habit-goal-${habit.id}`}>{t('habitCard.dailyGoalLabel')}</label>
                    <input
                      id={`habit-goal-${habit.id}`}
                      inputMode="numeric"
                      value={draftHabit.dailyGoal}
                      onChange={(event) => setDraftHabit({ ...draftHabit, dailyGoal: event.target.value })}
                    />
                  </div>

                  <div className="popout-toggle">
                    <div>
                      <span>{t('habitCard.reminderLabel')}</span>
                      <small>{t('habitCard.reminderHint')}</small>
                    </div>
                    <label className="compact-switch">
                      <input
                        type="checkbox"
                        checked={draftHabit.reminder}
                        onChange={(event) => setDraftHabit({ ...draftHabit, reminder: event.target.checked })}
                      />
                      <span className="slider" />
                    </label>
                  </div>

                  <div className="popout-field">
                    <label htmlFor={`habit-time-${habit.id}`}>{t('habitCard.timeRangeLabel')}</label>
                    <select
                      id={`habit-time-${habit.id}`}
                      value={draftHabit.timeRange}
                      onChange={(event) => setDraftHabit({ ...draftHabit, timeRange: event.target.value })}
                    >
                      {timeRanges.map((range) => <option key={range} value={range}>{getTimeRangeLabel(range)}</option>)}
                    </select>
                  </div>

                  <div className="popout-actions">
                    <button className="popout-save" type="button" data-cy="habit-popout-save" onClick={() => saveHabitSettings(habit.id)}>{t('habitCard.save')}</button>
                    <button className="popout-discard" type="button" onClick={closeHabitSettings}>{t('habitCard.discard')}</button>
                  </div>
                </div>
              </div>
            )}
          </article>
        )
      })}
    </div>
  )
}

export default HabitCards
