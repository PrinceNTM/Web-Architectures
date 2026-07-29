import { useI18n } from '../i18n/index.js'

function Sidebar({
  profile,
  avatarInitials,
  darkMode,
  onToggleDarkMode,
  onOpenProfile,
  onLogout,
  activeSection,
  onSectionChange,
}) {
  const { t, getSectionLabel } = useI18n()
  const profileName = `${profile.firstName} ${profile.lastName}`.trim() || t('sidebar.defaultProfileName')

  const primaryItems = [
    { id: 'all', hint: t('sidebar.overviewHint') },
    { id: 'Morgen', hint: t('sidebar.timeRangeHint') },
    { id: 'Nachmittag', hint: t('sidebar.timeRangeHint') },
    { id: 'Abend', hint: t('sidebar.timeRangeHint') },
    { id: 'resources', hint: t('sidebar.supportHint') },
  ]

  return (
    <aside className="app-sidebar" aria-label={t('sidebar.mainNavAria')}>
      <div className="sidebar-profile">
        <div className="profile-avatar" aria-hidden="true">{avatarInitials}</div>
        <div className="profile-copy">
          <p className="profile-name">{profileName}</p>
          <p className="profile-email">{profile.email}</p>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label={t('sidebar.habitAreasAria')}>
        {primaryItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-link ${activeSection === item.id ? 'active' : ''}`}
            type="button"
            onClick={() => onSectionChange(item.id)}
          >
            <span>{getSectionLabel(item.id)}</span>
            <small>{item.hint}</small>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-theme-toggle">
          <div>
            <span>{t('sidebar.themeTitle')}</span>
            <small>{darkMode ? t('sidebar.darkMode') : t('sidebar.lightMode')}</small>
          </div>
          <label className="compact-switch" aria-label={t('sidebar.toggleThemeAria')}>
            <input type="checkbox" checked={darkMode} onChange={onToggleDarkMode} />
            <span className="slider" />
          </label>
        </div>

        <div className="sidebar-divider" />

        <button className="sidebar-link utility" type="button" onClick={onOpenProfile}>
          <span>{t('sidebar.editProfile')}</span>
        </button>

        <button className="sidebar-link utility logout" type="button" onClick={onLogout}>
          <span>{t('sidebar.logout')}</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
