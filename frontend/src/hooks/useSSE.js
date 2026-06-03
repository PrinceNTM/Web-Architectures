import { useEffect, useCallback } from 'react'
import api from '../services/api.js'

/**
 * Custom Hook für Server-Sent Events (SSE)
 * Verbindet sich mit dem SSE-Endpoint und reagiert auf Events
 * 
 * @param {Function} onEvent - Callback-Funktion, die aufgerufen wird, wenn ein Event empfangen wird
 * @param {string} eventType - Optional: Reagiere nur auf bestimmte Event-Typen
 */
export const useSSE = (onEvent, eventType = null) => {
  const handleEvent = useCallback((event) => {
    try {
      const parsedEvent = JSON.parse(event.data)
      
      // Wenn eventType gefiltert wird, nur dann aufrufen
      if (!eventType || parsedEvent.type === eventType) {
        onEvent(parsedEvent)
      }
    } catch (error) {
      console.error('Fehler beim Parsen des SSE-Events:', error)
    }
  }, [onEvent, eventType])

  useEffect(() => {
    let eventSource = null
    let reconnectTimeout

    const connectSSE = async () => {
      try {
        // Hole SSE-Token vom Backend
        const sseTokenResponse = await api.get('/auth/sse-token')
        const sseToken = sseTokenResponse.data.token
        
        // EventSource zum SSE-Endpoint verbinden mit Token
        const backendURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
        const url = `${backendURL}/habits/events/stream?token=${encodeURIComponent(sseToken)}`
        console.log('Verbinde zu SSE-Endpoint mit Token')
        
        eventSource = new EventSource(url)

        // Bei erfolgreicher Verbindung
        eventSource.addEventListener('connected', (event) => {
          console.log('SSE-Verbindung hergestellt')
        })

        // Generic Message-Handler für alle Events
        eventSource.addEventListener('message', handleEvent)

        // Fehlerbehandlung
        eventSource.onerror = (error) => {
          console.error('SSE-Verbindungsfehler:', error)
          if (eventSource) {
            eventSource.close()
          }
          
          // Reconnect nach 3 Sekunden
          reconnectTimeout = setTimeout(connectSSE, 3000)
        }
      } catch (error) {
        console.error('Fehler beim Einrichten der SSE-Verbindung:', error)
        
        // Reconnect nach 3 Sekunden
        reconnectTimeout = setTimeout(connectSSE, 3000)
      }
    }

    connectSSE()

    // Cleanup: EventSource schließen, wenn Hook unmountet wird
    return () => {
      if (eventSource) {
        eventSource.close()
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
    }
  }, [handleEvent])
}

