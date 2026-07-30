# DOKUMENTATION

## 1. Projektkontext
Der Habit Tracker ist eine Full-Stack-Anwendung mit React/Vite im Frontend und Express/Prisma im Backend.

## 2. Architekturentscheidungen

### Entscheidung A: Vite SPA statt Next.js
- Entscheidung: React SPA mit Vite.
- Begründung: Das Produkt ist ein authentifiziertes Dashboard ohne SEO-Anforderung. Der Mehrwert von SSR ist gering, der Betriebsaufwand von Next.js hoeher.
- Alternative: Next.js mit Server Components.
- Warum verworfen: Hoehere Komplexitaet bei Routing, Hydration und Betriebsmodell ohne klaren Produktnutzen.

### Entscheidung B: Prisma + SQLite statt In-Memory
- Entscheidung: Persistenz mit Prisma auf SQLite.
- Begründung: Dauerhafte Speicherung, lokale Developer Experience, einfache Migrationen.
- Alternative: In-Memory, Redis, S3.
- Warum verworfen: In-Memory ist nicht persistent; Redis ist fuer den Use Case nicht primaer; S3 ist ungeeignet fuer relationale Kernobjekte.

### Entscheidung C: Service Layer im Backend
- Entscheidung: Business-Logik in Services, Controller bleiben duenn.
- Begründung: Bessere Testbarkeit, klare Verantwortlichkeiten, geringere Kopplung an Express.
- Alternative: Direkte Prisma-Queries im Controller.
- Warum verworfen: Schlechter testbar, schwerer wartbar, hoehere Fehleranfaelligkeit bei Wachstum.

### Entscheidung D: Realtime mit Socket.IO
- Entscheidung: Socket.IO fuer bidirektionale Kommunikation.
- Begründung: Sofortige Sichtbarkeit von Habit-Aenderungen in parallelen Sessions.
- Alternative: SSE/Polling.
- Warum verworfen: SSE nur unidirektional; Polling ist einfacher, aber weniger reaktiv.

## 3. Modulschnitt
- Frontend: UI, Routing, API-Client, lokale Fallback-Storage-Helfer.
- Backend: Route Layer, Controller Layer, Service Layer, Prisma-Persistenz.
- Querschnitt: Auth (JWT/Cookies), CORS, E-Mail Queue, Realtime-Broadcast.

## 4. Teststrategie
- Backend: Vitest (Unit/Service/Auth-Sad-Path).
- Frontend: Vitest fuer Utility-Tests.
- E2E: Cypress fuer kritische User-Pfade (Login, Habit-Erstellung, Sad Paths).
- Coverage: Vitest-Coverage mit Schwellenwert 80% konfiguriert.

## 5. Betrieb und Start
- One-Command-Start lokal: `npm run dev` im Repository-Root.
- One-Command-Test lokal: `npm test` im Repository-Root.
- One-Command-Coverage: `npm run test:coverage` im Repository-Root.

## 6. Retrospektive
Was wir heute anders machen wuerden:
- Frueher eine konsolidierte Root-Orchestrierung fuer Start/Test einfuehren.
- E2E und Unit-Tests frueher als feste CI-Gates etablieren.
- UI-Designsystem frueher formalisieren (Tokens, Komponentenrichtlinien, Accessibility-Checklisten).
- Doppelstrukturen im Repository frueh bereinigen, damit nur ein aktiver Codepfad existiert.

Wesentliche Learnings:
- Sicherheits-Haertungen koennen direkte Auswirkungen auf UX (z. B. CSP) haben und muessen frueh mit UI-Checks gekoppelt werden.
- Branch-Coverage erfordert gezielte Fehlerpfad-Tests; reine Happy-Path-Tests reichen nicht fuer belastbare Qualitaet.
- Ein zentraler Root-Workflow reduziert Abgaberisiken deutlich (gleiche Pipeline fuer Start, Test und Coverage).

