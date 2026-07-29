/**
 * SSE (Server-Sent Events) Manager
 * Verwaltet verbundene Clients und broadcastet Events
 */

import { logger } from './logger.js'

// Speichert alle verbundenen Clients pro Benutzer
const clientsByUser = new Map()

export const addClient = (userId, res) => {
  if (!clientsByUser.has(userId)) {
    clientsByUser.set(userId, [])
  }
  clientsByUser.get(userId).push(res)
  logger.info('sse.client_connected', { connections: clientsByUser.get(userId).length })
}

export const removeClient = (userId, res) => {
  if (!clientsByUser.has(userId)) return
  
  const clients = clientsByUser.get(userId)
  const index = clients.indexOf(res)
  
  if (index !== -1) {
    clients.splice(index, 1)
    logger.info('sse.client_disconnected', { connections: clients.length })
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
      logger.error('sse.broadcast_failed', error)
      removeClient(userId, res)
    }
  })
}

export const getConnectedClientsCount = (userId) => {
  return clientsByUser.has(userId) ? clientsByUser.get(userId).length : 0
}
