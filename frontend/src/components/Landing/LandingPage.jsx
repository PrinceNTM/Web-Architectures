import { Link } from 'react-router-dom'
import './LandingPage.css'

const FEATURES = [
  {
    title: 'Daily Routine Tracking',
    text: 'Halte deine taeglichen Gewohnheiten in einem klaren Ablauf fest und behalte den Fokus auf das Wesentliche.',
  },
  {
    title: 'Streak Motivation',
    text: 'Sichtbare Fortschritte und konsistente Serien motivieren dich, dranzubleiben ohne Druck aufzubauen.',
  },
  {
    title: 'Calm UI Design',
    text: 'Ruhige Panels, sanfte Formen und klare Hierarchien reduzieren kognitive Last bei jeder Session.',
  },
  {
    title: 'Smart Categories',
    text: 'Organisiere Habits in sinnvolle Bereiche und finde mit wenigen Klicks genau das, was heute wichtig ist.',
  },
]

const JOURNEY_CARDS = [
  {
    title: 'Morgenroutine leicht gemacht',
    text: 'Kurze, klare Gewohnheiten helfen dir, fokussiert in den Tag zu starten.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3.8" />
        <path d="M12 2.6v2.6M12 18.8v2.6M2.6 12h2.6M18.8 12h2.6M5.5 5.5l1.9 1.9M16.6 16.6l1.9 1.9M5.5 18.5l1.9-1.9M16.6 7.4l1.9-1.9" />
      </svg>
    ),
  },
  {
    title: 'Abendfokus & Ruhe',
    text: 'Beende deinen Tag mit kleinen, ruhigen Routinen, die deinen Kopf entlasten.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.6 3.2a8.8 8.8 0 1 0 6.2 15.1A7.6 7.6 0 1 1 14.6 3.2Z" />
        <circle cx="17.4" cy="7.2" r="1" />
      </svg>
    ),
  },
  {
    title: 'Stressfreie Gewohnheiten',
    text: 'Baue Routinen auf, die sich leicht anfuehlen und ohne Druck funktionieren.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20.4c4.4 0 8-3.6 8-8 0-2.8-1.4-5.2-3.6-6.6-.2 2.1-1.1 4.5-3 6.2-1.9 1.8-4.2 2.7-6.3 3a8 8 0 0 0 4.9 5.4Z" />
        <path d="M8.2 10.5c.2-2.6 1.5-4.8 3.8-6.8" />
      </svg>
    ),
  },
]

function LandingPage() {
  return (
    <main className="landing-page" aria-label="Habit Tracker Landing Page">
      <div className="landing-blobs" aria-hidden="true">
        <span className="blob blob-one" />
        <span className="blob blob-two" />
      </div>

      <section className="landing-hero">
        <p className="landing-kicker">Habit Tracker</p>
        <h1>Build better habits - with calm and clarity.</h1>
        <p className="landing-subtitle">
          Ein ruhiger, moderner Habit Tracker im Stil deiner bestehenden App.
        </p>
        <div className="landing-actions">
          <Link className="landing-btn landing-btn-primary" to="/login">Login</Link>
          <Link className="landing-btn landing-btn-secondary" to="/register">Registrieren</Link>
        </div>
      </section>

      <section className="landing-features" aria-label="Features">
        {FEATURES.map((feature) => (
          <article key={feature.title} className="landing-feature-card">
            <h2>{feature.title}</h2>
            <p>{feature.text}</p>
          </article>
        ))}
      </section>

      <section className="landing-journeys" aria-label="Habit Journey Highlights">
        {JOURNEY_CARDS.map((item) => (
          <article key={item.title} className="landing-journey-card">
            <span className="journey-icon" aria-hidden="true">{item.icon}</span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className="landing-motivation">
        <div className="motivation-blob" aria-hidden="true" />
        <h2>Gute Gewohnheiten entstehen durch Klarheit, nicht durch Stress.</h2>
        <p>
          Kleine, ruhige Entscheidungen jeden Tag bauen nachhaltige Routinen auf.
          Dein Fortschritt darf sich leicht anfuehlen.
        </p>
      </section>

      <section className="landing-cta">
        <h2>Starte heute - ein kleiner Schritt jeden Tag.</h2>
        <div className="landing-actions">
          <Link className="landing-btn landing-btn-primary" to="/login">Login</Link>
          <Link className="landing-btn landing-btn-secondary" to="/register">Registrieren</Link>
        </div>
      </section>
    </main>
  )
}

export default LandingPage
