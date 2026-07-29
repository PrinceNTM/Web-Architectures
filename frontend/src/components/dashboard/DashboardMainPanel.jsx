import HabitCards from '../HabitCards.jsx'
import { getCategoryClass, getCategoryStyle } from '../../utils/categoryStyles.js'

function DashboardMainPanel({
  t,
  activeSection,
  activeSectionLabel,
  completedToday,
  habitsCount,
  totalStreaks,
  newHabitInput,
  onNewHabitInputChange,
  onNewHabitKeyDown,
  onAddHabit,
  onToggleSuggestions,
  onOpenCategoryFilter,
  categoryFilterOpen,
  categories,
  pendingCategoryFilters,
  onTogglePendingCategory,
  darkMode,
  onCloseCategoryFilter,
  onClearCategoryFilters,
  onApplyCategoryFilters,
  showSuggestions,
  suggestedHabits,
  onCloseSuggestions,
  onAddSuggestedHabit,
  getCategoryLabel,
  visibleHabits,
  selectedHabitId,
  onSelectHabitId,
  onToggleHabit,
  onDeleteHabit,
  onUpdateHabit,
}) {
  return (
    <main className="main-panel">
      <div className="main-header">
        <div>
          <p className="eyebrow">{t('dashboard.eyebrow')}</p>
          <h1>{activeSection === 'all' || activeSection === 'resources' ? t('dashboard.allHabits') : activeSectionLabel}</h1>
        </div>
        <div className="header-metrics">
          <div>
            <span>{t('dashboard.today')}</span>
            <strong>{completedToday}/{habitsCount}</strong>
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
          onChange={(event) => onNewHabitInputChange(event.target.value)}
          onKeyDown={onNewHabitKeyDown}
        />
        <button className="add-btn" data-cy="add-habit-btn" onClick={onAddHabit} type="button">+</button>
        <button className="browse-btn" onClick={onToggleSuggestions} type="button">{t('dashboard.browseButton')}</button>
        <button className="icon-btn" onClick={onOpenCategoryFilter} type="button" aria-label={t('dashboard.openFilterAria')}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 5h18M6 12h12M10 19h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </section>

      {categoryFilterOpen && (
        <div className="filter-popout-overlay" role="dialog" aria-modal="true" onClick={onCloseCategoryFilter}>
          <div className="filter-popout" onClick={(event) => event.stopPropagation()}>
            <div className="filter-popout-header">
              <h3>{t('dashboard.filterTitle')}</h3>
              <button className="icon-btn" type="button" onClick={onCloseCategoryFilter} aria-label={t('dashboard.closeFilterAria')}>x</button>
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
                    onClick={() => onTogglePendingCategory(category)}
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
              <button className="cancel-btn" type="button" onClick={onClearCategoryFilters}>{t('filter.clear')}</button>
              <button className="save-btn" type="button" onClick={onApplyCategoryFilters}>{t('filter.apply')}</button>
            </div>
          </div>
        </div>
      )}

      {showSuggestions && (
        <div className="suggestions-modal" role="dialog" aria-modal="true">
          <div className="suggestions-card">
            <div className="suggestions-header">
              <h3>{t('browse.title')}</h3>
              <button className="close-btn" onClick={onCloseSuggestions} type="button">{t('browse.close')}</button>
            </div>
            <div className="suggestions-list">
              {suggestedHabits.map((suggestion, index) => (
                <button key={index} className="suggestion-item" onClick={() => onAddSuggestedHabit(suggestion)} type="button">
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
        selectedHabitId={selectedHabitId}
        onSelectHabit={onSelectHabitId}
        onToggleHabit={onToggleHabit}
        onDeleteHabit={onDeleteHabit}
        onUpdateHabit={onUpdateHabit}
        theme={darkMode ? 'dark' : 'light'}
      />
    </main>
  )
}

export default DashboardMainPanel
