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
  const profileName = `${profile.firstName} ${profile.lastName}`.trim() || 'Daily Habits'

  const primaryItems = [
    { id: 'all', label: 'Alle Habits', hint: 'Uebersicht' },
    { id: 'Morgen', label: 'Morgen', hint: 'Zeitbereich' },
    { id: 'Nachmittag', label: 'Nachmittag', hint: 'Zeitbereich' },
    { id: 'Abend', label: 'Abend', hint: 'Zeitbereich' },
    { id: 'resources', label: 'Ressourcen / Hilfe', hint: 'Support' },
  ]

  return (
    <aside className="app-sidebar" aria-label="Hauptnavigation">
      <div className="sidebar-profile">
        <div className="profile-avatar" aria-hidden="true">{avatarInitials}</div>
        <div className="profile-copy">
          <p className="profile-name">{profileName}</p>
          <p className="profile-email">{profile.email}</p>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Habit Bereiche">
        {primaryItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-link ${activeSection === item.id ? 'active' : ''}`}
            type="button"
            onClick={() => onSectionChange(item.id)}
          >
            <span>{item.label}</span>
            <small>{item.hint}</small>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-theme-toggle">
          <div>
            <span>Light / Dark</span>
            <small>{darkMode ? 'Dark Mode' : 'Light Mode'}</small>
          </div>
          <label className="compact-switch" aria-label="Light Dark Mode umschalten">
            <input type="checkbox" checked={darkMode} onChange={onToggleDarkMode} />
            <span className="slider" />
          </label>
        </div>

        <div className="sidebar-divider" />

        <button className="sidebar-link utility" type="button" onClick={onOpenProfile}>
          <span>Profil bearbeiten</span>
        </button>

        <button className="sidebar-link utility logout" type="button" onClick={onLogout}>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
