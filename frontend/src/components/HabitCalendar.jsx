import { getCategoryStyle } from '../utils/categoryStyles.js'
import { useI18n } from '../i18n/index.js'

function HabitCalendar({ habit, currentDate, completedDays, onPrevMonth, onNextMonth, theme = 'light' }) {
  const { t, getCategoryLabel, getDateLocale, getHabitNameLabel } = useI18n()
  const weekdays = t('calendar.weekdays', {}, [])
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
    <aside className="detail-panel" aria-label={t('calendar.aria')}>
      <div className="detail-header">
        <div>
          <p className="eyebrow">{t('calendar.eyebrow')}</p>
          <h2>{habit?.name ? getHabitNameLabel(habit.name) : t('calendar.selectHabit')}</h2>
        </div>
        <span className="detail-pill" style={getCategoryStyle(habit?.category, theme)}>{habit?.category ? getCategoryLabel(habit.category) : t('calendar.overview')}</span>
      </div>

      <div className="detail-stats">
        <div>
          <span>{t('calendar.streak')}</span>
          <strong>{habit?.streak ?? 0}</strong>
        </div>
        <div>
          <span>{t('calendar.month')}</span>
          <strong>{monthlyAverage}%</strong>
        </div>
      </div>

      <div className="calendar-shell">
        <div className="calendar-header">
          <button className="month-nav" type="button" onClick={onPrevMonth} aria-label={t('calendar.prevMonthAria')}>‹</button>
          <h3 className="month-title">
            {currentDate.toLocaleString(getDateLocale(), { month: 'long', year: 'numeric' })}
          </h3>
          <button className="month-nav" type="button" onClick={onNextMonth} aria-label={t('calendar.nextMonthAria')}>›</button>
        </div>

        <div className="calendar-weekdays">
          {weekdays.map((weekday) => <div key={weekday} className="weekday">{weekday}</div>)}
        </div>

        <div className="calendar-grid">{cells}</div>
      </div>

      <div className="calendar-summary">
        <div>
          <span>{t('calendar.completedDays')}</span>
          <strong>{completedSet.size}</strong>
        </div>
        <div>
          <span>{t('calendar.monthlyAverage')}</span>
          <strong>{monthlyAverage}%</strong>
        </div>
      </div>
    </aside>
  )
}

export default HabitCalendar
