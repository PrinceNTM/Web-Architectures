# Prisma ORM Setup

## Übersicht

Das Backend wurde erfolgreich von In-Memory-Arrays auf Prisma ORM mit SQLite-Datenbank migriert.

## Datenmodell

### Habit
- `id`: String (CUID, Primary Key)
- `name`: String (erforderlich)
- `category`: String (optional)
- `createdAt`: DateTime (automatisch gesetzt)

### Entry
- `id`: String (CUID, Primary Key)
- `habitId`: String (Foreign Key zu Habit)
- `date`: String (Datum als String)
- `value`: Int (Standard: 1)

## Installation

```bash
npm install prisma @prisma/client better-sqlite3
```

## Datenbank-Setup

### 1. Prisma initialisieren
```bash
npx prisma init --datasource-provider sqlite
```

### 2. Schema definieren
Das Schema wurde in `prisma/schema.prisma` definiert.

### 3. Migration erstellen
```bash
npm run db:migrate
```

### 4. Prisma Client generieren
```bash
npm run db:generate
```

## Verfügbare Scripts

```json
{
  "db:migrate": "prisma migrate dev",
  "db:generate": "prisma generate",
  "db:studio": "prisma studio",
  "db:reset": "prisma migrate reset"
}
```

## Prisma Studio

Um die Datenbank visuell zu verwalten:

```bash
npm run db:studio
```

Öffnet Prisma Studio im Browser unter `http://localhost:5555`

## API-Änderungen

### Vorher (In-Memory)
- Synchrone Operationen
- Daten gingen beim Neustart verloren
- Keine Persistierung

### Nachher (Prisma + SQLite)
- Asynchrone Operationen mit `async/await`
- Daten werden in `dev.db` persistiert
- Automatische Fehlerbehandlung
- Type-Safe mit Prisma Client

## Beispiel-Queries

```javascript
// Alle Habits abrufen
const habits = await prisma.habit.findMany({
  include: { entries: true }
})

// Habit mit ID finden
const habit = await prisma.habit.findUnique({
  where: { id: 'abc123' },
  include: { entries: true }
})

// Neues Habit erstellen
const habit = await prisma.habit.create({
  data: {
    name: 'Morgenmeditation',
    category: 'Gesundheit'
  }
})

// Habit aktualisieren
const updatedHabit = await prisma.habit.update({
  where: { id: 'abc123' },
  data: { name: 'Abendmeditation' }
})

// Habit löschen
await prisma.habit.delete({
  where: { id: 'abc123' }
})
```

## Migration von In-Memory zu Prisma

### Modelle (`src/models/Habit.js`)
- Alle Funktionen wurden `async` gemacht
- Verwendung von Prisma Client statt Arrays
- Fehlerbehandlung mit try/catch

### Controller (`src/controllers/habitController.js`)
- Alle Handler wurden `async` gemacht
- `await` für alle Datenbank-Operationen
- Verbesserte Fehlerbehandlung

### Server (`src/server.js`)
- Prisma Client wird initialisiert
- Graceful Shutdown für saubere Datenbank-Verbindung

## Umgebungsvariablen

```env
PORT=3001
NODE_ENV=development
DATABASE_URL="file:./dev.db"
```

## Datenbank-Datei

Die SQLite-Datenbank wird als `dev.db` im Projektroot gespeichert und ist in `.gitignore` ausgenommen.

## Troubleshooting

### Migration-Fehler
```bash
npm run db:reset  # Datenbank zurücksetzen
npm run db:migrate  # Neue Migration erstellen
```

### Client-Generierung
```bash
npm run db:generate  # Prisma Client neu generieren
```

### Datenbank-Reset
```bash
npm run db:reset  # Komplette Datenbank zurücksetzen
```

## Nächste Schritte

- [ ] API mit Postman/Hoppscotch testen
- [ ] Prisma Studio für Daten-Exploration verwenden
- [ ] Weitere Migrationen für Schema-Änderungen planen
- [ ] Seed-Scripts für Testdaten erstellen

---

**Die Migration zu Prisma ist abgeschlossen! 🚀**