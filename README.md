# Habit Tracker

A full-stack habit tracking application built with React + Vite (frontend) and Express (backend).

## Features

- Create and manage personal habits (e.g., exercise, reading, drinking water)
- Check off habits daily
- View today's pending habits
- Track performance over time

## Project Structure

```
habit-tracker/
├── frontend/          (React + Vite, Port 5173)
├── backend/           (Express, Port 3000)
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend will be available at `http://localhost:3000`

## API Endpoints

### Habits
- `GET /api/habits` - Get all habits
- `GET /api/habits/:id` - Get a specific habit
- `POST /api/habits` - Create a new habit
- `PUT /api/habits/:id` - Update a habit
- `DELETE /api/habits/:id` - Delete a habit

### Check-ins
- `POST /api/habits/:habitId/checkin` - Check off a habit
- `GET /api/habits/:habitId/checkins` - Get check-ins for a habit

## Contributing

Feel free to fork and submit pull requests!

## License

MIT

## Testing (Studio-Session 06)

Test-Pyramide
| Ebene | Beispiel | Werkzeug |
| --- | --- | --- |
| Unit | Validierungsfunktionen (z.B. Passwort-Check) | Vitest |
| Integration | POST /api/habits legt DB-Eintrag an | Vitest |
| E2E | Login-Flow (Login → Cookie → Weiterleitung) | Cypress |

Kritische Bereiche
- **Authentifizierung / Session-Handling**: Änderungen an Token-Handling, Cookie-Setup oder Middleware können Benutzerzugriff vollständig unterbrechen.
- **Datenmodell / Migrations**: Änderungen am Prisma-Schema oder an Migrations können Datenverlust oder Inkonsistenzen verursachen.

## Real-time Web (Studio-Session 07)
1. Gibt es Daten in eurer App, die sich ändern können, während ein anderer Nutzer die Seite offen hat?
Ja – theoretisch. Wenn zwei Nutzer gleichzeitig eingeloggt sind und einer ein Habit anlegt oder abhakt, sieht der andere es nicht sofort.
2. Müssen Änderungen sofort sichtbar sein – oder reicht ein Reload?
Ja, Änderungen sollten sofort sichtbar sein
3. Ist die Kommunikation einseitig (Server → Client) oder bidirektional (beide senden)?
Bidirektional
4. Wie viele Clients könnten gleichzeitig verbunden sein?
Der Habit-Tracker wird hauptsächlich von mir selbst genutzt, eventuell mit wenigen Testnutzern.
Trefft danach eine begründete Technologieentscheidung:
**Keine Echtzeit nötig.**  
Ich implementiere Polling oder SSE nur als Lernübung und kennzeichne es als „nicht produktiv notwendig“.