# PROMPTS

## Ziel
Dokumentation der wichtigsten Prompt-Iterationen aus den Studiosessions.

## Iteration 1: API-Basis
- Prompt-Idee: CRUD-Endpunkte fuer Habits aufsetzen.
- Ergebnis: Erste lauffaehige API mit Grundoperationen.

## Iteration 2: HTTP-Qualitaet
- Prompt-Idee: Validierung, klare Status-Codes, 404/400-Faelle.
- Ergebnis: Robusteres API-Verhalten.

## Iteration 3: Persistenz
- Prompt-Idee: Migration auf Prisma + SQLite.
- Ergebnis: Persistente Datenhaltung mit Migrationen.

## Iteration 4: Sicherheit
- Prompt-Idee: Auth-Flow, Ownership-Pruefung, weniger Information Exposure.
- Ergebnis: Verbesserte Zugriffskontrolle und JWT-basierte Sessions.

## Iteration 5: Service-Layer
- Prompt-Idee: Controller verschlanken und Business-Logik kapseln.
- Ergebnis: Bessere Modularitaet und Testbarkeit.

## Iteration 6: Realtime
- Prompt-Idee: Vergleich SSE vs WebSocket und Implementierung von Socket.IO.
- Ergebnis: Live-Updates zwischen Sessions ohne Reload.
