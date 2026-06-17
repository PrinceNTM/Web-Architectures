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

## Async Messaging (Studio Session 08)

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

## Bestandsaufnahme (Studio Session 9)

### Architektur-Check & Verantwortlichkeiten
- **`server.js`**: Zentrales Setup und Middleware-Orchestrierung. Sauber getrennt.
- **`src/routes/`**: Verantwortlich für das API-Routing. Aktuell delegieren diese direkt an Controller.
- **`src/controllers/habitController.js`**: Hauptverantwortlich für Habit- und Check-in-Logik.

### Identifizierte Optimierungspotenziale
1. **Geschäftslogik-Leak**: In `habitController.js` (v.a. beim Erstellen von Habits) ist die Logik für Side-Effects (E-Mail-Versand) direkt im Handler implementiert. Ziel: Auslagerung in eine Service-Schicht (`HabitService`).
2. **Domain-Leak**: Der `habitController` greift direkt auf die `Entry`-Tabelle zu, um Check-ins zu verarbeiten. Fachlich sollte dies über einen dedizierten `Entry`-Bereich (Service/Model) gelöst werden, um die Entkopplung zu wahren.
3. **Dünne Controller**: Die Handler enthalten aktuell noch direkte Prisma-Queries. Dies erschwert Unit-Tests ohne Datenbank-Mocking.

### Strategie
Einführung eines **Service-Layers** zwischen Controllern und Prisma-Client, um fachliche Validierungen und Cross-Domain-Operationen zentral zu kapseln.

## Bounded Contexts (Studio Session 9)

### Identifizierte Domänen
- **Habit Definition Context**: Verantwortlich für die Verwaltung der Habit-Stammdaten (`Habit`, `Category`). Definiert die Struktur dessen, was getrackt wird.
- **Tracking Context**: Verantwortlich für die Erfassung der täglichen Fortschritte (`Entry`, `Check-in`). Nutzt die `habitId` als Fremdschlüssel, enthält aber die Logik für zeitbasierte Auswertungen.
- **Identity & Access Context**: Verwaltet Nutzeridentitäten und Autorisierung (Tokens, SSE-Tokens). Stellt sicher, dass Daten nach Ownern getrennt bleiben.

### Interaktion & Datenfluss
Der *Tracking Context* bezieht Definitionen aus dem *Habit Context* über IDs. Bei Statusänderungen (z. B. neues Habit) informiert der *Habit Context* asynchrone Services (wie den Mail-Dienst), um Side-Effects außerhalb der Kern-CRUD-Logik auszuführen.

## Service Layer (Studio Session 9)

### Refactorte Handler

- **Handler 1: POST /api/habits**
  - **Entfernte Logik**: Validierung der Pflichtfelder (Name) und die direkte Interaktion mit dem Prisma-Client zur Erstellung von Datensätzen.
  - **Service-Funktion**: `createHabit(data, userId)` in `habits.service.js`.
  - **Verteilung**: Der Controller extrahiert Daten aus `req.body`, der Service validiert die Domain-Regeln und führt die Datenbankoperation aus.

- **Handler 2: GET /api/habits/:id**
  - **Entfernte Logik**: Die Suche über Prisma sowie die Logik zur Prüfung, ob das Habit dem anfragenden User gehört (Ownership-Check).
  - **Service-Funktion**: `getHabitById(id, userId)` in `habits.service.js`.
  - **Verteilung**: Der Controller reicht Parameter weiter; der Service wirft spezifische Fehler, wenn Daten fehlen oder der Zugriff verweigert wird.

### Dokumentation der Prompt-Iterationen

- **Iteration 1**: Ziel war die grundlegende Extraktion der Logik. Der Fokus lag darauf, die Route-Handler "dünn" zu machen, indem Prisma-Queries in Funktionen ausgelagert wurden.
- **Iteration 2**: Hier wurde die Architektur präzisiert. Services dürfen nun keine HTTP-Objekte (`req`, `res`) mehr kennen. Zudem wurde eine eigene `ValidationError`-Klasse eingeführt. Dies entkoppelt die Geschäftslogik vollständig vom Web-Framework und ermöglicht ein sauberes Error-Mapping im Controller.

### Vorteile der neuen Struktur

- **Testbarkeit**: Geschäftslogik kann nun via Unit-Tests geprüft werden, ohne einen HTTP-Server simulieren zu müssen.
- **Klarere Verantwortlichkeiten**: Controller kümmern sich um Request-Parsing und Response-Status; Services um Datenvalidität und Persistenz.
- **Geringe Kopplung**: Das Backend ist nun robuster gegenüber Änderungen am Framework (z.B. Wechsel von Express auf ein anderes Tool).

## Service Layer (Studio Session 9)

### Refactoring-Übersicht
- **Refactorte Handler**: `POST /api/habits` (Erstellung eines Habits) und `GET /api/habits/:id` (Abrufen eines einzelnen Habits).
- **Auslagerung**: Die gesamte Geschäftslogik, inklusive Validierung der Eingabedaten und direkter Prisma-Datenbankzugriffe, wurde aus den Controllern in die neue Service-Datei `backend/src/services/habits.service.js` verschoben.

### Iterationsschritte
1.  **Iteration 1 (Konzept)**: Die Idee war, die Logik in Funktionen auszulagern. Der Controller sollte Input lesen, den Service aufrufen und Output zurückgeben. Fehlerbehandlung mit `try/catch` und generischen Statuscodes (400 für Validierung, 500 für andere Fehler).
2.  **Iteration 2 (Präzisierung)**: Die Service-Datei `habits.service.js` wurde erstellt und präzisiert. Sie kennt keine HTTP-Objekte (`req`, `res`) und enthält ausschließlich Geschäftslogik. Für Validierungsfehler wurde eine eigene Fehlerklasse `ValidationError` (`backend/src/utils/errors.js`) eingeführt, die einen `statusCode` von 400 mitbringt. Der Controller fängt diese spezifischen Fehler ab und mappt sie korrekt auf HTTP-Antworten. Für nicht gefundene Ressourcen (`GET /api/habits/:id`) wirft der Service nun einen generischen `Error` mit einem `statusCode` von 404, den der Controller ebenfalls abfängt.

### Fehlerbehandlung
- **Validierungsfehler**: Werden im Service als `ValidationError` geworfen und führen im Controller zu einem HTTP-Status 400 (Bad Request).
- **Ressource nicht gefunden**: Werden im Service als `Error` mit der Eigenschaft `statusCode: 404` geworfen und führen im Controller zu einem HTTP-Status 404 (Not Found).
- **Andere Fehler**: Alle anderen unerwarteten Fehler führen im Controller zu einem HTTP-Status 500 (Internal Server Error).

### Vorteile der neuen Struktur
-   **Trennung der Verantwortlichkeiten (Separation of Concerns)**: Controller sind nun "dünn" und konzentrieren sich ausschließlich auf die HTTP-Schicht (Request-Parsing, Response-Formatierung, Fehler-Mapping). Die Geschäftslogik ist sauber im Service-Layer gekapselt.
-   **Testbarkeit**: Die Service-Funktionen können jetzt unabhängig von Express-Objekten getestet werden (Unit-Tests), was die Entwicklung und Wartung erleichtert.
-   **Wiederverwendbarkeit**: Die Geschäftslogik im Service kann potenziell auch von anderen Schnittstellen (z.B. CLI-Tools, Message Queues) genutzt werden, ohne den HTTP-spezifischen Code der Controller mitzuziehen.
-   **Wartbarkeit und Lesbarkeit**: Der Code ist modularer, leichter zu verstehen und zu pflegen.

## Service Layer (Studio Session 9)

### Refactoring-Übersicht
- **Refactorte Handler**: `POST /api/habits` (Erstellung) und `GET /api/habits/:id` (Detailansicht).
- **Auslagerung**: Die gesamte Validierungslogik und die direkten Prisma-Datenbankaufrufe wurden aus den Controllern in den `habits.service.js` verschoben.

### Iterationsschritte
1. **Iteration 1**: Extraktion der Logik in Funktionen. Der Controller delegiert nun die Arbeit, kümmert sich aber noch um das Error-Mapping.
2. **Iteration 2**: Vollständige Entkopplung. Die Services haben keine Kenntnis mehr von Express-Objekten (`req`, `res`). Einführung einer dedizierten `ValidationError`-Klasse für präzises Error-Handling.

### Vorteile der neuen Struktur
- **Testbarkeit**: Geschäftslogik kann nun in Unit-Tests geprüft werden, ohne einen HTTP-Server zu simulieren.
- **Wiederverwendbarkeit**: Die `createHabit`-Logik könnte nun auch durch andere Trigger (z. B. CLI oder Cron-Jobs) genutzt werden.
- **Dünne Controller**: Die Controller-Dateien sind deutlich übersichtlicher und konzentrieren sich nur auf das HTTP-Protokoll.

## Modulschnittstellen

### habits.service.js
- **öffentlich**:
  - `getAllHabits(userId)`: Ruft alle Habits eines Benutzers ab.
  - `createHabit(data, userId)`: Erstellt ein neues Habit.
  - `getHabitById(id, userId)`: Ruft ein Habit anhand seiner ID und der Benutzer-ID ab.
  - `updateHabit(id, data, userId)`: Aktualisiert ein bestehendes Habit.
  - `deleteHabit(id, userId)`: Löscht ein Habit.
  - `getEntriesForPeriod(userId, from, to)`: Ruft alle Habit-Einträge eines Benutzers in einem bestimmten Zeitraum ab.
- **intern**:
  - (Validierungslogik wie `name.trim() === ''` ist aktuell inline in `createHabit` und `updateHabit`.)

### stats.service.js
- **öffentlich**:
  - `getStatsForUser(userId)`: Berechnet und liefert Statistiken für einen Benutzer.
- **intern**:
  - (Aktuell keine explizit ausgelagerten internen Funktionen, nutzt `habitsService` für Daten.)

### auth.service.js
- **öffentlich**:
  - `registerUser(email, password)`: Registriert einen neuen Benutzer.
  - `authenticateUser(email, password)`: Authentifiziert einen Benutzer und gibt diesen zurück.
  - `generateToken(user)`: Generiert einen JWT für einen Benutzer.
- **intern**:
  - (Hashing-Logik mit `bcrypt` ist inline in `registerUser` und `authenticateUser`.)
  - (Token-Signierung mit `jsonwebtoken` ist inline in `generateToken`.)

## Architektur-reviewer

### Microservices-Vorbereitung (Studio Session 9)
Das Stats-Modul ist am leichtesten extrahierbar, da es als reiner Daten-Konsument fungiert und keine direkten Schreib-Abhängigkeiten zum Habit-Kern besitzt. Die bereits erfolgte Kapselung des Datenzugriffs über Service-Schnittstellen macht es zu einem idealen Kandidaten für einen eigenständigen Analyse-Dienst.