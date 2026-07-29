import { useEffect, useRef } from 'react';
/**
 * Custom Hook für Server-Sent Events (SSE)
 * Verbindet sich mit dem SSE-Endpoint und reagiert auf Events
 *
 * Die Verbindung wird genau EINMAL pro Mount aufgebaut. Der Callback und der
 * Event-Filter werden in Refs gehalten, damit ein sich bei jedem Render neu
 * erzeugender `onEvent`-Callback NICHT zu einem Neuaufbau der Verbindung führt.
 * Andernfalls würden bei jedem Render zusätzliche (teils geleakte) Verbindungen
 * entstehen und Events mehrfach empfangen werden.
 *
 * @param onEvent - Callback-Funktion, die aufgerufen wird, wenn ein Event empfangen wird
 * @param eventType - Optional: Reagiere nur auf bestimmte Event-Typen
 */
export const useSSE = (onEvent: (data: any) => void, eventType: string | null = null) => {
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

  // Aktuellen Callback/Filter in Refs spiegeln, damit die Effect-Dependencies
  // leer bleiben können und die Verbindung stabil bleibt.
  const onEventRef = useRef(onEvent)
  const eventTypeRef = useRef(eventType)

  useEffect(() => {
    onEventRef.current = onEvent
    eventTypeRef.current = eventType
  }, [onEvent, eventType])

  useEffect(() => {
    let eventSource = null
    let reconnectTimeout = null
    // Verhindert, dass eine asynchron aufgebaute Verbindung nach dem Cleanup
    // (z.B. StrictMode-Doppel-Mount) offen bleibt und leakt.
    let isCancelled = false

    const handleEvent = (event) => {
      try {
        const parsedEvent = JSON.parse(event.data)
        const filter = eventTypeRef.current

        // Wenn eventType gefiltert wird, nur dann aufrufen
        if (!filter || parsedEvent.type === filter) {
          onEventRef.current(parsedEvent)
        }
      } catch (error) {
        console.error('Fehler beim Parsen des SSE-Events:', error)
      }
    }

    const connectSSE = async () => {
      try {
        const url = `${API_URL}/habits/events/stream`

        eventSource = new EventSource(url, { withCredentials: true })

        // Falls der Effect während des Token-Fetches schon wieder aufgeräumt
        // wurde, die frisch erzeugte Verbindung sofort schließen (kein Leak).
        if (isCancelled) {
          eventSource.close()
          eventSource = null
          return
        }

        // Bei erfolgreicher Verbindung
        eventSource.addEventListener('connected', () => {
          return undefined
        })

        // Generic Message-Handler für alle Events
        eventSource.addEventListener('message', handleEvent)

        // Fehlerbehandlung
        eventSource.onerror = (error) => {
          console.error('SSE-Verbindungsfehler:', error)
          if (eventSource) {
            eventSource.close()
            eventSource = null
          }

          // Reconnect nach 3 Sekunden (nur wenn noch aktiv)
          if (!isCancelled) {
            reconnectTimeout = setTimeout(connectSSE, 3000)
          }
        }
      } catch (error) {
        console.error('Fehler beim Einrichten der SSE-Verbindung:', error)

        // Reconnect nach 3 Sekunden (nur wenn noch aktiv)
        if (!isCancelled) {
          reconnectTimeout = setTimeout(connectSSE, 3000)
        }
      }
    }

    connectSSE()

    // Cleanup: EventSource schließen, wenn Hook unmountet wird
    return () => {
      isCancelled = true
      if (eventSource) {
        eventSource.close()
        eventSource = null
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
    }
  }, [])
}
