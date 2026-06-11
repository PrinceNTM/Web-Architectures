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

## Studio Session 08

### Analyse der potenziellen Events
Die App ist aktuell vor allem ein persönlicher Habit-Tracker. Es gibt keine echte Multi-User-Kollaboration, daher sind die relevanten "anderen Nutzer" in erster Linie weitere offene Sessions desselben Accounts oder ein theoretischer gemeinsamer Feed.

| Event in meiner App | Notification sinnvoll? | Typ | Kanal | Begründung |
| --- | --- | --- | --- | --- |

| Neues Habit erstellen | Nein | Product | keiner | Die Erstellung wird direkt im UI bestätigt und bei aktiven Sessions live synchronisiert. Externe E-Mail/Push wäre hier Overhead. 

| Habit abhaken | Nein | Product | keiner | Check-ins sind eigenständige Nutzungsaktionen; sie brauchen keine externe Benachrichtigung, solange der Nutzer aktiv in der App ist.

| E-Mail-Adresse ändern / Profilaktualisierung | Ja | Transactional | E-Mail | Bei Änderung der Account-E-Mail ist eine Bestätigungs- oder Sicherheits-Mail der richtige Kanal.

### Leitfragen

1. Gibt es Events, bei denen der Nutzer sofort reagieren muss oder es reicht, wenn eine Mail später gelesen wird?
- Für den Habit-Tracker selbst gibt es keine echten Notfall-Events. Gewohnheiten anlegen, editieren, löschen oder abhaken sind in der App selbst direkt sichtbar und benötigen keine sofortige externe Reaktion. Daher ist bei diesen Produkt-Events eine externe Notification nicht zwingend. Eine E-Mail ist hier nicht notwendig; ein später lesbares Update reicht, wenn überhaupt.
- Ein Account-/E-Mail-Sicherheits-Event wie E-Mail-Änderung sollte dagegen sofort geprüft werden können. Das ist ein klassischer Transactional-Use-Case.

2. Gibt es Marketing-Content, der ein Opt-in braucht?
- Ja. Jede Form von Marketing- oder Werbe-Message (z. B. Newsletter, Produkt-Tipps, Engagement-Boosts) braucht ein separates Opt-in. Die aktuelle App hat keinen Marketing-Flow; sie sollte bei E-Mails auf rein transaktionale und sicherheitsrelevante Inhalte beschränkt bleiben.

3. Wie viele Events würden realistisch pro Stunde Notifications auslösen?
- Bei normaler Nutzung sind das sehr wenige. Ein einzelner Nutzer erstellt typischerweise 0–1 neue Habits pro Stunde und führt höchstens wenige Check-ins durch. Realistisch sollten externe Notifications für diese App auf 0–3 pro Stunde begrenzt bleiben, um keinen Spam zu erzeugen.
- Falls mehrere Sessions desselben Accounts offen sind, können interne Realtime-Events auf 1–2 pro Stunde kommen, aber das bleibt browserintern und ist keine externe E-Mail-/Push-Flut.

### Kanalentscheidung für zwei konkrete Events

- E-Mail-Adressänderung: Kanal = E-Mail. Das ist ein typischer Transactional-Event, bei dem eine Bestätigung bzw. Sicherheitsmeldung sinnvoll ist. Eine Push-Nachricht wäre hier sekundär, der Standard ist E-Mail.
- Neues Habit erstellen: Kanal = keiner. Die App aktualisiert diese Aktion direkt im UI und über Socket/SSE für andere Sessions. E-Mail oder Web Push wären für diesen Produkt-Event unnötig und würden eher stören.

### Fazit
Die aktuell relevante Notification-Architektur für die App sollte sich auf interne Realtime-Synchronisation konzentrieren. Externe E-Mail-Benachrichtigungen sind nur bei Account-/Sicherheits-Events angebracht. Web Push ist für den derzeitigen Funktionsumfang nicht notwendig, außer wenn später echte Erinnerungen oder abwesenheitsbasierte Motivation hinzugefügt werden.

## Prompt-Iterationen

### Iteration 1 – Basis-Implementierung
In der ersten Version wurde eine einfache E-Mail-Benachrichtigung für das Event „Habit wurde erstellt“ umgesetzt. Dazu gehörten:
- ein eigenes React-Email-Template für die Mail
- eine Backend-Funktion für den Mailversand
- asynchroner Versand, damit der HTTP-Request nicht blockiert
- Fehlerbehandlung mit try/catch
- Nutzung eines API-Keys aus der .env-Datei
- Integration im Habit-Erstellungs-Flow des Backends

### Iteration 2 – Präzisierungen und UX-Verbesserungen
Im zweiten Prompt wurde die Mail weiter verbessert, damit sie klarer, persönlicher und nutzbarer wirkt. Ziel war vor allem, die Mail nicht nur technisch korrekt, sondern auch besser im Produktkontext zu platzieren. Verbesserungen waren:
- das Template war zu generisch → jetzt deutlich strukturierter aufgebaut
- ein Deep-Link zum konkreten Habit fehlte → jetzt enthalten
- ein CTA-Button „View in App“ wurde ergänzt
- die Betreffzeile wurde verbessert zu „Neues Habit erstellt: <Name>“
- ein kurzer Einleitungstext erklärt nun, warum der Nutzer diese Mail erhält
- optionales Branding wurde als Erweiterung mitgedacht

## Template-Check

Analyse des aktuellen Templates in [backend/src/emails/templates/HabitCreatedEmail.js](backend/src/emails/templates/HabitCreatedEmail.js) und [backend/src/emails/sendHabitCreatedEmail.js](backend/src/emails/sendHabitCreatedEmail.js):

- Infos ohne Login: Ja. Der Mail-Body enthält den Habit-Namen, das Erstellungsdatum und einen direkten CTA, sodass der Nutzer den Kontext auch ohne Login versteht.
- Direkter Deep Link: Ja. Der Button führt auf die betroffene Habit-Ansicht über /habit/:id und nicht nur auf die Startseite.
- Betreff klar und unter 50 Zeichen: Teilweise. Der Betreff ist klar, aber durch den dynamischen Habit-Namen kann er bei längeren Namen schnell über 50 Zeichen hinausgehen.
- Notification-Body unter 120 Zeichen: Ja. Der aktuelle Einleitungstext ist knapp formuliert und liegt unterhalb der 120-Zeichen-Grenze.

Verbesserungsvorschläge für Iteration 2:
- Betreff auf einen kurzen, festen Prefix reduzieren, z. B. „Neues Habit erstellt“ oder „Habit erstellt“.
- Bei langen Habit-Namen den Namen im Body kurz wiederholen, aber die Message bewusst knapp halten.
- Optional kann der CTA-Text noch expliziter werden, z. B. „Zum Habit öffnen“.

## Erfolgskriterien-Check (Studio Session 08)

1. Notification-Analyse für mindestens zwei Events dokumentiert – Erfüllt
- Die README enthält eine Analyse für mehrere Events mit Typ, Kanal und Begründung.

2. Transactional E-Mail für mindestens ein Event funktioniert – Erfüllt
- Das Template enthält Habit-Name, Erstellungsdatum und einen direkten Deep Link zur Habit-Ansicht über `/habit/:id`.

3. Mailversand läuft asynchron über eine Queue, nicht synchron im Request-Handler – Nicht erfüllt
- Aktuell wird der Versand direkt im Request-Handler über `void sendHabitCreatedEmail(...)` gestartet. Es gibt noch keine Queue- oder Worker-Schicht.
- Vorschlag: BullMQ mit Redis oder ein einfaches Background-Worker-Modul einführen.

4. API-Key in .env, nicht im Code – Erfüllt
- Der Resend-Schlüssel wird aus `backend/.env` über `RESEND_API_KEY` geladen.

5. Zwei Prompt-Iterationen dokumentiert – Erfüllt
- Die README enthält sowohl eine Basis-Iteration als auch eine zweite Iteration mit UX- und Strukturverbesserungen.

6. Git-Commit vorhanden, .env nicht im Commit – Nicht erfüllt
- Es liegen Repository-Commits vor, aber aktuell gibt es keine Schutzregel für `.env` im Repository-Setup.
- Vorschlag: `.env` in `.gitignore` ergänzen und zusätzlich eine `.env.example` anlegen.

