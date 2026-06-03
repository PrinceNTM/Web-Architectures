/**
 * SSE (Server-Sent Events) Manager
 * Verwaltet verbundene Clients und broadcastet Events
 */

// Speichert alle verbundenen Clients pro Benutzer
const clientsByUser = new Map()

export const addClient = (userId, res) => {
  if (!clientsByUser.has(userId)) {
    clientsByUser.set(userId, [])
  }
  clientsByUser.get(userId).push(res)
  console.log(`Client verbunden für Benutzer ${userId}. Insgesamt: ${clientsByUser.get(userId).length}`)
}

export const removeClient = (userId, res) => {
  if (!clientsByUser.has(userId)) return
  
  const clients = clientsByUser.get(userId)
  const index = clients.indexOf(res)
  
  if (index !== -1) {
    clients.splice(index, 1)
    console.log(`Client getrennt für Benutzer ${userId}. Verbleibend: ${clients.length}`)
  }
}

export const broadcastEvent = (userId, eventType, data) => {
  if (!clientsByUser.has(userId)) return
  
  const clients = clientsByUser.get(userId)
  const message = `data: ${JSON.stringify({ type: eventType, data })}\n\n`
  
  clients.forEach((res) => {
    try {
      res.write(message)
    } catch (error) {
      console.error('Fehler beim Senden des Events:', error)
      removeClient(userId, res)
    }
  })
}

export const getConnectedClientsCount = (userId) => {
  return clientsByUser.has(userId) ? clientsByUser.get(userId).length : 0
}
