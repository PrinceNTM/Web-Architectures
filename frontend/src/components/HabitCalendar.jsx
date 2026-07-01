function HabitCalendar({ habit, currentDate, completedDays, onPrevMonth, onNextMonth }) {
  const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDay = (new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() + 6) % 7
  const today = new Date()
  const completedSet = new Set(completedDays)
  const cells = []

  for (let index = 0; index < firstDay; index += 1) {
    cells.push(<div key={`empty-${index}`} className="calendar-day empty" />)
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const isToday =
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    const isCompleted = completedSet.has(day)

    cells.push(
      <div
        key={day}
        className={`calendar-day ${isToday ? 'today' : ''} ${isCompleted ? 'completed' : ''}`}
      >
        {day}
      </div>,
    )
  }

  const monthlyAverage = daysInMonth > 0 ? Math.round((completedSet.size / daysInMonth) * 100) : 0

  return (
    <aside className="detail-panel" aria-label="Habit Details und Kalender">
      <div className="detail-header">
        <div>
          <p className="eyebrow">Detail</p>
          <h2>{habit?.name || 'Habit auswaehlen'}</h2>
        </div>
        <span className="detail-pill">{habit?.category || 'Overview'}</span>
      </div>

      <div className="detail-stats">
        <div>
          <span>Streak</span>
          <strong>{habit?.streak ?? 0}</strong>
        </div>
        <div>
          <span>Monat</span>
          <strong>{monthlyAverage}%</strong>
        </div>
      </div>

      <div className="calendar-shell">
        <div className="calendar-header">
          <button className="month-nav" type="button" onClick={onPrevMonth} aria-label="Vorheriger Monat">‹</button>
          <h3 className="month-title">
            {currentDate.toLocaleString('de-DE', { month: 'long', year: 'numeric' })}
          </h3>
          <button className="month-nav" type="button" onClick={onNextMonth} aria-label="Naechster Monat">›</button>
        </div>

        <div className="calendar-weekdays">
          {weekdays.map((weekday) => <div key={weekday} className="weekday">{weekday}</div>)}
        </div>

        <div className="calendar-grid">{cells}</div>
      </div>

      <div className="calendar-summary">
        <div>
          <span>Erledigte Tage</span>
          <strong>{completedSet.size}</strong>
        </div>
        <div>
          <span>Durchschnitt pro Monat</span>
          <strong>{monthlyAverage}%</strong>
        </div>
      </div>
    </aside>
  )
}

export default HabitCalendar
