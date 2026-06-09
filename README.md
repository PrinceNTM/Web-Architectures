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

### Iteration 1 – Lern- und Vergleichsphase
- Ziel war es, die Frage zu klären, ob Echtzeit-Updates für den Habit-Tracker sinnvoll sind.
- Für die erste Iteration wurde ein einfaches Server-Sent-Events-Modell betrachtet und prototypisch vorbereitet.
- Vorteile: leicht verständlich und gut für einseitige Nachrichten vom Server an den Client.
- Nachteil: Für bidirektionale Live-Updates war die Lösung weniger passend als gewünscht.

### Iteration 2 – Socket.IO für echte Live-Updates
- Ziel ist es, Änderungen an Habits sofort an andere offene Browser-Clients weiterzugeben.
- Das Backend lauscht auf das Event `new-task` und sendet es mit `socket.broadcast.emit(...)` an alle anderen verbundenen Clients.
- Das Frontend sendet nach dem Anlegen eines neuen Habits zusätzlich ein Socket.IO-Event an den Server und hört auf dasselbe Event, um die Liste sofort zu aktualisieren.
- Ergebnis: Neue Einträge erscheinen ohne Reload direkt in anderen offenen Tabs oder Fenstern.

### Technische Entscheidung
- Für diese Anwendung ist eine echte Echtzeit-Integration sinnvoll, weil Updates sofort sichtbar sein sollen.
- Deshalb wird Socket.IO verwendet, weil es sich sowohl für einfache Broadcasts als auch für spätere bidirektionale Erweiterungen eignet.

## Technologieentscheidung: SSE vs. WebSockets

In der Gegenüberstellung von SSE und WebSockets zeigt sich, dass SSE eine einseitige Kommunikation vom Server zum Client ermöglicht, während WebSockets bidirektional funktionieren und damit den Austausch in beide Richtungen erlauben. Die Implementierung von SSE ist im Vergleich deutlich weniger komplex, während WebSockets einen mittleren Aufwand erfordern. Beim Verbindungsabbruch stellt SSE automatisch eine neue Verbindung her, da dies vom Browser übernommen wird, wohingegen WebSockets bzw. socket.io ein manuelles oder vom Framework gesteuertes Reconnect-Verhalten benötigen. Für mein Projekt wären grundsätzlich sowohl SSE als auch WebSockets geeignet, da beide die notwendigen Aktualisierungen abbilden könnten.

SSE wäre für einfache, einseitige Aktualisierungen ausreichend, aber für einen Habit-Tracker mit sofort sichtbaren Live-Updates ist WebSockets die flexiblere Wahl. Die aktuelle Implementierung nutzt Socket.IO, weil sie bidirektionale Kommunikation und einfache Broadcast-Mechanik direkt unterstützt.

Wenn der Server neu startet, verlieren verbundene Clients ihre aktive Socket-Verbindung. In der aktuellen Implementierung bricht die Verbindung dann ab, und die App zeigt bis zur nächsten Neu-Initialisierung bzw. erneuten Interaktion keine Live-Updates mehr. Ein Reconnect-Mechanismus ist daher sinnvoll, wenn die Verbindung stabil bleiben soll.

## „Welche Teile meiner App würden langfristig von Echtzeit-Kommunikation profitieren, welche nicht? Wo wäre Polling (z.B. alle 5 Sekunden ein GET) die ehrlichere Lösung? Begründe anhand meines konkreten Codes."

Echtzeit‑Kommunikation wäre in meinem Projekt vor allem für die Habit‑Liste und Check‑ins sinnvoll, da mehrere offene Clients hier von sofort sichtbaren Änderungen profitieren könnten. Bereiche wie Authentifizierung oder Detailabfragen benötigen dagegen keine Live‑Verbindung und funktionieren als klassische Request/Response‑Vorgänge. Für die meisten Anwendungsfälle ist Polling die einfachere und passendere Lösung, da mein Backend überwiegend als CRUD‑API aufgebaut ist. Ich stimme der Einschätzung zu.
