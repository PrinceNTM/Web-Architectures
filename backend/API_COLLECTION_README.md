# Habits API - Postman/Hoppscotch Collection

## Übersicht

Diese Collection enthält alle REST-API-Endpunkte für den Habit Tracker mit Beispiel-Requests, verschiedenen Szenarien und Fehlerfällen.

## Installation

### Postman
1. Öffne Postman
2. Klicke auf **Import** (oben links)
3. Wähle die Datei `Habits-API.postman_collection.json`
4. Bestätige und fertig!

### Hoppscotch
1. Öffne [https://hoppscotch.io](https://hoppscotch.io)
2. Klicke auf **Menü → Datei/Kollektion importieren**
3. Wähle die Datei `Habits-API.postman_collection.json`
4. Die Collection wird automatisch importiert

## Verwendung

### Umgebungsvariablen konfigurieren

1. Stelle sicher, dass `{{base_url}}` auf `http://localhost:3001` gesetzt ist
2. Nach einem POST-Request, dessen Habit abrufen und die `habit_id` in der Variable speichern
3. Alle nachfolgenden Requests verwenden dann diese ID

### Anfrage-Kategorien

#### 1. **Einzelne Endpunkte** (Habits-Ordner)
Vollständige Tests für jeden Endpunkt:

- ✅ **GET /api/habits** – Alle Habits auflisten
- ✅ **GET /api/habits/:id** – Einzelnes Habit abrufen (erfolgreich + 404-Fehler)
- ✅ **POST /api/habits** – Neues Habit erstellen (erfolgreich + 400-Fehler + minimal)
- ✅ **PUT /api/habits/:id** – Habit bearbeiten (erfolgreich + 404-Fehler)
- ✅ **DELETE /api/habits/:id** – Habit löschen (erfolgreich + 404-Fehler)

#### 2. **Workflows** (Workflows-Ordner)
Realistische Anwendungsszenarien:

1. Neues Habit erstellen
2. Erstelltes Habit abrufen (mit gespeicherter ID)
3. Habit bearbeiten
4. Habit löschen

#### 3. **Health Check** (Health Check-Ordner)
- GET /api/health – Server-Status überprüfen

## HTTP-Status-Codes

| Code | Bedeutung | Beispiel |
|------|-----------|---------|
| **200** | OK | GET, PUT erfolgreich |
| **201** | Created | POST erfolgreich |
| **204** | No Content | DELETE erfolgreich (leere Response) |
| **400** | Bad Request | Fehlendes erforderliches Feld (name) |
| **404** | Not Found | Habit mit ID nicht gefunden |

## Beispiel-Workflows

### Workflow 1: Komplettes CRUD-Beispiel

```bash
1. POST /api/habits                    # Erstelle ein neues Habit
   ↓ Speichere die 'id' aus Response
2. GET /api/habits/:id                 # Rufe es ab
3. PUT /api/habits/:id                 # Bearbeite es
4. DELETE /api/habits/:id              # Lösche es
```

### Workflow 2: Fehlerbehandlung testen

```bash
1. GET /api/habits/999999              # 404 - nicht gefunden
2. POST /api/habits (ohne name)        # 400 - ungültig
3. PUT /api/habits/999999 (Update)     # 404 - nicht gefunden
4. DELETE /api/habits/999999           # 404 - nicht gefunden
```

## Beispiel-Daten

Die Collection enthält bereits vordefinierte Beispiel-Daten:

```json
{
  "name": "Morgenmeditation",
  "description": "10 Minuten täglich meditieren",
  "category": "Gesundheit"
}
```

Du kannst diese jederzeit anpassen oder neue Daten hinzufügen.

## Tipps

- 💡 Nutze die **Description** in jedem Request – sie erklärt was erwartet wird
- 💡 Achte auf die **Status-Codes** in den Responses
- 💡 Die Variable `{{habit_id}}` muss nach einem POST manuell aktualisiert werden
- 💡 Teste immer zuerst die Erfolgs-Fälle, dann die Fehler-Fälle
- 💡 Mit `GET /api/habits` kannst du alle existierenden Habits sehen und deren IDs kopieren

## Troubleshooting

**Problem:** "Connection refused" oder "Cannot GET"
- ✓ Überprüfe, dass der Backend-Server läuft: `npm start`
- ✓ Stelle sicher, dass der Port korrekt ist: 3001
- ✓ Überprüfe `{{base_url}}` Variable

**Problem:** DELETE gibt 404 statt 204
- ✓ Stelle sicher, dass die Habit-ID existiert
- ✓ Nutze `GET /api/habits` um existierende IDs zu sehen

**Problem:** POST gibt 400 "Name is required"
- ✓ Das ist beabsichtigt! Der `name` ist erforderlich
- ✓ Teste mit dem Request "POST - Neues Habit (erfolgreich)"

---

**Viel Erfolg beim Testen der API! 🚀**
