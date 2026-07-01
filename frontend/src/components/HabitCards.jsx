import { useState } from 'react'

function HabitCards({
  habits,
  selectedHabitId,
  onSelectHabit,
  onToggleHabit,
  onDeleteHabit,
  onUpdateHabit,
}) {
  const [openSettingsId, setOpenSettingsId] = useState(null)
  const [draftHabit, setDraftHabit] = useState(null)

  const categories = ['General', 'Health & Fitness', 'Wellness', 'Learning', 'Mental Health', 'Sleep', 'Exercise']
  const timeRanges = ['Morgen', 'Nachmittag', 'Abend']

  const openHabitSettings = (habit) => {
    setOpenSettingsId(habit.id)
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
    setDraftHabit(null)
  }

  const saveHabitSettings = (habitId) => {
    if (!draftHabit?.name?.trim()) return

    onUpdateHabit(habitId, {
      name: draftHabit.name.trim(),
      category: draftHabit.category,
      dailyGoal: draftHabit.dailyGoal,
      total: Number(draftHabit.dailyGoal) || 0,
      reminder: draftHabit.reminder,
      timeRange: draftHabit.timeRange,
    })
    closeHabitSettings()
  }

  if (habits.length === 0) {
    return (
      <div className="empty-state">
        <p>Noch keine Habits angelegt.</p>
      </div>
    )
  }

  return (
    <div className="habit-card-list">
      {habits.map((habit) => {
        const isSelected = selectedHabitId === habit.id
        const isSettingsOpen = openSettingsId === habit.id
        const progressValue = habit.total > 0 ? Math.round((habit.completedCount / habit.total) * 100) : habit.isChecked ? 100 : 0

        return (
          <article
            key={habit.id}
            className={`habit-card ${isSelected ? 'selected' : ''}`}
            data-cy={`habit-${habit.id}`}
            onClick={() => onSelectHabit(habit.id)}
          >
            <button
              className={`habit-check ${habit.isChecked ? 'checked' : ''}`}
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onToggleHabit(habit.id)
              }}
              aria-label="Habit als erledigt markieren"
            >
              {habit.isChecked ? '✓' : ''}
            </button>

            <div className="habit-main">
              <div className="habit-title-row">
                <h3 data-cy="habit-name">{habit.name}</h3>
                <span className="habit-category">{habit.category}</span>
                {habit.timeRange && <span className="habit-category muted">{habit.timeRange}</span>}
              </div>
              <div className="habit-progress">
                <span style={{ width: `${progressValue}%` }} />
              </div>
              <div className="habit-meta">
                <span>{habit.streak} day streak</span>
                {habit.total > 0 ? <span>{habit.completedCount}/{habit.total} complete</span> : <span>{habit.isChecked ? 'Done today' : 'Open today'}</span>}
              </div>
            </div>

            <div className="habit-actions" onClick={(event) => event.stopPropagation()}>
              <button className="icon-btn" type="button" onClick={() => onDeleteHabit(habit.id)} aria-label="Habit loeschen">x</button>
              <button
                className="icon-btn"
                type="button"
                onClick={() => (isSettingsOpen ? closeHabitSettings() : openHabitSettings(habit))}
                aria-label="Habit bearbeiten"
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
                  aria-label="Habit bearbeiten"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="popout-field">
                    <label htmlFor={`habit-name-${habit.id}`}>Name des Habits</label>
                    <input
                      id={`habit-name-${habit.id}`}
                      value={draftHabit.name}
                      onChange={(event) => setDraftHabit({ ...draftHabit, name: event.target.value })}
                    />
                  </div>

                  <div className="popout-field">
                    <label htmlFor={`habit-category-${habit.id}`}>Kategorie</label>
                    <select
                      id={`habit-category-${habit.id}`}
                      value={draftHabit.category}
                      onChange={(event) => setDraftHabit({ ...draftHabit, category: event.target.value })}
                    >
                      {categories.map((category) => <option key={category}>{category}</option>)}
                    </select>
                  </div>

                  <div className="popout-field">
                    <label htmlFor={`habit-goal-${habit.id}`}>Ziel pro Tag</label>
                    <input
                      id={`habit-goal-${habit.id}`}
                      inputMode="numeric"
                      value={draftHabit.dailyGoal}
                      onChange={(event) => setDraftHabit({ ...draftHabit, dailyGoal: event.target.value })}
                    />
                  </div>

                  <div className="popout-toggle">
                    <div>
                      <span>Reminder / Benachrichtigung</span>
                      <small>Aktiviert Hinweise fuer dieses Habit.</small>
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
                    <label htmlFor={`habit-time-${habit.id}`}>Zeitbereich</label>
                    <select
                      id={`habit-time-${habit.id}`}
                      value={draftHabit.timeRange}
                      onChange={(event) => setDraftHabit({ ...draftHabit, timeRange: event.target.value })}
                    >
                      {timeRanges.map((range) => <option key={range}>{range}</option>)}
                    </select>
                  </div>

                  <div className="popout-actions">
                    <button className="popout-save" type="button" onClick={() => saveHabitSettings(habit.id)}>Speichern</button>
                    <button className="popout-discard" type="button" onClick={closeHabitSettings}>Verwerfen</button>
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
