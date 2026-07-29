import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './LandingPage.css'

const COPY = {
  de: {
    brand: 'Daily Habits',
    navHow: 'So funktionierts',
    navPricing: 'Preise',
    navFaq: 'FAQ',
    navLogin: 'Anmelden',
    cta: 'Jetzt starten',
    headerKicker: 'Kostenlos - keine Kreditkarte erforderlich',
    headline: 'Gewohnheiten, die wirklich bleiben.',
    subheadline:
      'Daily Habits hilft Selbstständigen, Teams und Routinen-Liebhabern dabei, den Tag klar zu starten, dranzubleiben und Fortschritt ohne Druck sichtbar zu machen.',
    proofLabel: 'Vertraut von Menschen, die klare Routinen wollen',
    proofStats: [
      { value: '12k+', label: 'aktive Nutzer' },
      { value: '93%', label: 'bleiben nach 30 Tagen dran' },
      { value: '4.9/5', label: 'durchschnittliches Feedback' },
    ],
    logos: ['Flow', 'Nord Studio', 'Morrow', 'Peak', 'Atlas'],
    quote:
      'Ich sehe in 10 Sekunden, was heute wichtig ist. Genau deshalb nutze ich es jeden Morgen.',
    quoteName: 'Lena Fischer',
    quoteRole: 'Product Lead, Berlin',
    howTitle: 'So funktionierts',
    howItems: [
      'Eintragen, was dir wirklich hilft - ohne unnötige Felder.',
      'Täglich abhaken und Fortschritt sofort sehen.',
      'Mit Streaks, Kategorien und ruhiger Übersicht dranbleiben.',
    ],
    pricingTitle: 'Preise',
    pricingBadge: 'Kostenlos',
    pricingText: 'Ein Plan. Alle Kernfunktionen. Kein Formular, keine Kreditkarte, kein Abo-Druck.',
    faqTitle: 'FAQ',
    faqs: [
      {
        q: 'Ist Daily Habits wirklich kostenlos?',
        a: 'Ja. Der Einstieg ist kostenlos und ohne Kreditkarte möglich.',
      },
      {
        q: 'Wie schnell kann ich starten?',
        a: 'In unter einer Minute. Konto anlegen, anmelden, Gewohnheit hinzufügen.',
      },
      {
        q: 'Bleiben meine Daten geschützt?',
        a: 'Ja. Die Session läuft über sichere HttpOnly Cookies.',
      },
    ],
    footerNote: 'Kostenlos - keine Kreditkarte erforderlich',
    testimonialLabel: 'Kundenstimme',
    footerColumns: [
      {
        title: 'Daily Habits - entdecken',
        links: ['Jetzt starten', 'Features', 'Vorteile', 'Für Studierende', 'Für Teams', 'Geschenk-Code einlösen'],
      },
      {
        title: 'Inhalte',
        links: ['Habit-Tracking', 'Morgenroutine', 'Abendroutine', 'Fokus & Produktivität', 'Motivation', 'Routinen für Anfänger'],
      },
      {
        title: 'Über uns',
        links: ['Über Daily Habits', 'Vision & Mission', 'Team', 'Presse', 'Karriere', 'Sitemap'],
      },
      {
        title: 'Support',
        links: ['Hilfe-Center', 'Kontakt', 'Sicherheit', 'Datenschutz', 'Accessibility', 'Cookie-Richtlinie'],
      },
    ],
    footerDownloads: [
      {
        src: '/assets/app-store-badge.svg',
        alt: 'Download on the App Store',
      },
      {
        src: '/assets/google-play-badge.svg',
        alt: 'Get it on Google Play',
      },
    ],
    footerSocial: ['E-Mail', 'Twitter', 'Facebook'],
    footerLegal: ['Privacy Policy', 'Terms & Conditions', 'Copyright © 2026 Daily Habits. All Rights Reserved.'],
  },
  en: {
    brand: 'Daily Habits',
    navHow: 'How it works',
    navPricing: 'Pricing',
    navFaq: 'FAQ',
    navLogin: 'Sign in',
    cta: 'Get started',
    headerKicker: 'Free - no credit card required',
    headline: 'Habits that actually stick.',
    subheadline:
      'Daily Habits helps founders, teams, and routine builders start the day with clarity, stay consistent, and make progress visible without pressure.',
    proofLabel: 'Trusted by people who want calmer routines',
    proofStats: [
      { value: '12k+', label: 'active users' },
      { value: '93%', label: 'still active after 30 days' },
      { value: '4.9/5', label: 'average feedback' },
    ],
    logos: ['Flow', 'Nord Studio', 'Morrow', 'Peak', 'Atlas'],
    quote:
      'I can see what matters today in 10 seconds. That is why I use it every morning.',
    quoteName: 'Lena Fischer',
    quoteRole: 'Product Lead, Berlin',
    howTitle: 'How it works',
    howItems: [
      'Add what really helps you - no extra fields.',
      'Check off habits daily and see progress instantly.',
      'Stay consistent with streaks, categories, and a calm overview.',
    ],
    pricingTitle: 'Pricing',
    pricingBadge: 'Free',
    pricingText: 'One plan. All core features. No form, no credit card, no subscription pressure.',
    faqTitle: 'FAQ',
    faqs: [
      {
        q: 'Is Daily Habits really free?',
        a: 'Yes. You can start for free without a credit card.',
      },
      {
        q: 'How fast can I start?',
        a: 'In under a minute. Create your account, sign in, and add a habit.',
      },
      {
        q: 'Are my data protected?',
        a: 'Yes. Sessions use secure HttpOnly cookies.',
      },
    ],
    footerNote: 'Free - no credit card required',
    testimonialLabel: 'Testimonial',
    footerColumns: [
      {
        title: 'Daily Habits - discover',
        links: ['Get started', 'Features', 'Benefits', 'For students', 'For teams', 'Redeem gift code'],
      },
      {
        title: 'Content',
        links: ['Habit tracking', 'Morning routine', 'Evening routine', 'Focus & productivity', 'Motivation', 'Routines for beginners'],
      },
      {
        title: 'About us',
        links: ['About Daily Habits', 'Vision & mission', 'Team', 'Press', 'Careers', 'Sitemap'],
      },
      {
        title: 'Support',
        links: ['Help center', 'Contact', 'Security', 'Privacy', 'Accessibility', 'Cookie policy'],
      },
    ],
    footerDownloads: [
      {
        src: '/assets/app-store-badge.svg',
        alt: 'Download on the App Store',
      },
      {
        src: '/assets/google-play-badge.svg',
        alt: 'Get it on Google Play',
      },
    ],
    footerSocial: ['E-Mail', 'Twitter', 'Facebook'],
    footerLegal: ['Privacy Policy', 'Terms & Conditions', 'Copyright © 2026 Daily Habits. All Rights Reserved.'],
  },
}

function LandingPage() {
  const [language, setLanguage] = useState('de')
  const [openFaq, setOpenFaq] = useState(0)

  const copy = useMemo(() => COPY[language], [language])

  return (
    <main className="landing-page" aria-label="Daily Habits Landing Page">
      <header className="landing-header">
        <Link to="/" className="landing-brand" aria-label="Daily Habits Home">
          <span className="brand-mark" aria-hidden="true">◉</span>
          <span>{copy.brand}</span>
        </Link>

        <nav className="landing-nav" aria-label="Landing page navigation">
          <a href="#how-it-works">{copy.navHow}</a>
          <a href="#pricing">{copy.navPricing}</a>
          <a href="#faq">{copy.navFaq}</a>
          <Link to="/login">{copy.navLogin}</Link>
        </nav>

        <div className="landing-header-actions">
          <div className="language-switch" role="group" aria-label="Language switch">
            <button type="button" className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>EN</button>
            <button type="button" className={language === 'de' ? 'active' : ''} onClick={() => setLanguage('de')}>DE</button>
          </div>
          <Link className="landing-cta-button" to="/register">{copy.cta}</Link>
        </div>
      </header>

      <section className="hero-grid">
        <div className="hero-copy">
          <p className="hero-kicker">{copy.headerKicker}</p>
          <h1>{copy.headline}</h1>
          <p className="hero-subheadline">{copy.subheadline}</p>

          <div className="hero-actions">
            <Link className="landing-cta-button landing-cta-button-primary" to="/register">
              {copy.cta}
            </Link>
            <p className="hero-friction">{copy.headerKicker}</p>
          </div>

          <div className="hero-social-proof" aria-label="Social proof">
            <div className="proof-label-row">
              <span className="proof-dot" aria-hidden="true" />
              <span>{copy.proofLabel}</span>
            </div>

            <div className="logo-row" aria-label="Partner logos">
              {copy.logos.map((logo) => (
                <span key={logo} className="logo-pill">{logo}</span>
              ))}
            </div>

            <div className="stat-grid">
              {copy.proofStats.map((stat) => (
                <article key={stat.label} className="stat-card">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </article>
              ))}
            </div>
          </div>
        </div>

        <aside className="hero-panel" aria-label="Product preview">
          <div className="preview-topline">
            <span className="preview-dot preview-dot-live" />
            <span>Today</span>
            <span className="preview-chip">{copy.pricingBadge}</span>
          </div>

          <div className="preview-card preview-card-main">
            <p className="preview-caption">Morning focus</p>
            <h2>Water, read, move.</h2>
            <ul>
              <li>Drink 8 glasses of water</li>
              <li>Read for 30 minutes</li>
              <li>Walk 10,000 steps</li>
            </ul>
          </div>

          <div className="preview-row">
            <div className="preview-card preview-card-mini">
              <span>{copy.testimonialLabel}</span>
              <p>“{copy.quote}”</p>
              <strong>{copy.quoteName}</strong>
              <small>{copy.quoteRole}</small>
            </div>
            <div className="preview-card preview-card-mini accent">
              <span>Streak</span>
              <strong>21 days</strong>
              <p>Consistency without pressure.</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="content-section" id="how-it-works">
        <div className="section-heading">
          <p className="section-kicker">{copy.howTitle}</p>
          <h2>Nutzen zuerst. Dann erst die Details.</h2>
        </div>
        <div className="steps-grid">
          {copy.howItems.map((item, index) => (
            <article key={item} className="step-card">
              <span className="step-number">0{index + 1}</span>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section pricing-section" id="pricing">
        <div className="section-heading">
          <p className="section-kicker">{copy.pricingTitle}</p>
          <h2>Ein Einstieg, der keine Reibung erzeugt.</h2>
        </div>
        <div className="pricing-card">
          <div>
            <p className="pricing-badge">{copy.pricingBadge}</p>
            <h3>Alles, was du brauchst, um loszulegen.</h3>
          </div>
          <p>{copy.pricingText}</p>
          <Link className="landing-cta-button landing-cta-button-primary" to="/register">
            {copy.cta}
          </Link>
        </div>
      </section>

      <section className="content-section faq-section" id="faq">
        <div className="section-heading">
          <p className="section-kicker">{copy.faqTitle}</p>
          <h2>Kurze Antworten auf die wichtigsten Fragen.</h2>
        </div>
        <div className="faq-list">
          {copy.faqs.map((item, index) => {
            const isOpen = openFaq === index
            return (
              <button
                key={item.q}
                type="button"
                className={`faq-item ${isOpen ? 'open' : ''}`}
                onClick={() => setOpenFaq(isOpen ? -1 : index)}
              >
                <span>{item.q}</span>
                <p>{item.a}</p>
              </button>
            )
          })}
        </div>
      </section>

      <footer className="landing-footer" aria-label="Landing page footer">
        <div className="landing-footer-inner">
          <div className="footer-grid">
            <div className="footer-brand-block">
              <p className="footer-kicker">{copy.brand}</p>
              <h2>Ruhig strukturiert. Klar lesbar. Sofort navigierbar.</h2>
              <p className="footer-note">
                {copy.footerNote}
              </p>
            </div>

            <div className="footer-columns">
              {copy.footerColumns.map((column) => (
                <section key={column.title} className="footer-column">
                  <h3>{column.title}</h3>
                  <ul>
                    {column.links.map((link) => (
                      <li key={link}>
                        <a href="#footer" onClick={(event) => event.preventDefault()}>{link}</a>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}

              <section className="footer-column footer-column-downloads">
                <h3>App herunterladen</h3>
                <div className="store-badges">
                  {copy.footerDownloads.map((badge) => (
                    <a key={badge.alt} href="#footer" onClick={(event) => event.preventDefault()} className="store-badge" aria-label={badge.alt}>
                      <img src={badge.src} alt={badge.alt} className="store-badge-image" />
                    </a>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <div className="footer-social-row" aria-label="Social links">
            {copy.footerSocial.map((item) => (
              <a key={item} href="#footer" onClick={(event) => event.preventDefault()} className="social-icon" aria-label={item}>
                {item === 'E-Mail' || item === 'Email' ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4V6zm2 2v.5l6 4 6-4V8H6zm12 8V10.3l-6 4-6-4V16h12z" /></svg>
                ) : item === 'Twitter' ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.9 7.6c.01.17.01.35.01.52 0 5.35-4.07 11.52-11.52 11.52-2.29 0-4.42-.67-6.21-1.82.32.04.63.05.96.05 1.9 0 3.65-.64 5.04-1.73-1.78-.03-3.28-1.2-3.8-2.79.25.04.5.06.76.06.37 0 .74-.05 1.09-.14-1.86-.37-3.25-2.01-3.25-3.98v-.05c.55.31 1.18.5 1.85.52-1.1-.74-1.82-2.02-1.82-3.46 0-.76.2-1.47.56-2.08 2.01 2.46 5.01 4.08 8.39 4.25-.07-.3-.1-.61-.1-.93 0-2.25 1.82-4.08 4.08-4.08 1.17 0 2.23.5 2.97 1.29.93-.18 1.8-.52 2.59-.98-.31.97-.97 1.79-1.83 2.31.84-.1 1.64-.32 2.38-.64-.55.84-1.24 1.58-2.03 2.18z" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.9 11.5h2.7l.4-2.8h-3.1V7.2c0-.8.2-1.4 1.4-1.4h1.8V3.3c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v1.3H7.1v2.8h2.6V20h4.2v-8.5z" /></svg>
                )}
              </a>
            ))}
          </div>

          <div className="footer-legal-row" aria-label="Legal links">
            <a href="#footer" onClick={(event) => event.preventDefault()}>Privacy Policy</a>
            <a href="#footer" onClick={(event) => event.preventDefault()}>Terms & Conditions</a>
            <span>Copyright © 2026 Daily Habits. All Rights Reserved.</span>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default LandingPage
