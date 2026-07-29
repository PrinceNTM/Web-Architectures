function ProfileEditor({
  t,
  profile,
  notificationsEnabled,
  onProfileChange,
  onNotificationsEnabledChange,
  onSave,
  onCancel,
}) {
  return (
    <div className="app-container profile-page">
      <div className="profile-header">
        <button className="back-btn" onClick={onCancel}>{t('profile.back')}</button>
        <div>
          <p className="eyebrow">{t('profile.account')}</p>
          <h1>{t('profile.title')}</h1>
        </div>
      </div>

      <div className="profile-card">
        <p className="profile-description">
          {t('profile.description')}
        </p>

        <form className="profile-form" onSubmit={onSave}>
          <div className="form-field name-row">
            <div className="name-field">
              <label className="form-label" htmlFor="firstName">{t('profile.firstName')}</label>
              <input
                id="firstName"
                className="form-input"
                data-cy="profile-first-name"
                value={profile.firstName}
                onChange={(event) => onProfileChange({ ...profile, firstName: event.target.value })}
              />
            </div>
            <div className="name-field">
              <label className="form-label" htmlFor="lastName">{t('profile.lastName')}</label>
              <input
                id="lastName"
                className="form-input"
                value={profile.lastName}
                onChange={(event) => onProfileChange({ ...profile, lastName: event.target.value })}
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
              onChange={(event) => onProfileChange({ ...profile, email: event.target.value })}
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
              onChange={(event) => onProfileChange({ ...profile, currentPassword: event.target.value })}
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="language">{t('profile.language')}</label>
            <select
              id="language"
              className="form-input"
                data-cy="profile-language"
              value={profile.language}
              onChange={(event) => onProfileChange({ ...profile, language: event.target.value })}
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
              onChange={(event) => onProfileChange({ ...profile, password: event.target.value })}
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
              onChange={(event) => onProfileChange({ ...profile, confirmPassword: event.target.value })}
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
                onChange={(event) => onProfileChange({ ...profile, twoFactor: event.target.checked })}
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
                onChange={(event) => onNotificationsEnabledChange(event.target.checked)}
              />
              <span className="slider" />
            </label>
          </div>

          <div className="profile-actions">
            <button className="save-btn" type="submit" data-cy="profile-save">{t('profile.save')}</button>
            <button className="cancel-btn" type="button" onClick={onCancel} data-cy="profile-cancel">{t('profile.cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfileEditor
