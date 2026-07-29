import { Server } from 'socket.io'
import { logger } from '../utils/logger.js'

let socketServer = null

export const initializeSocket = (server, corsOriginHandler) => {
  if (socketServer) {
    return socketServer
  }

  socketServer = new Server(server, {
    cors: {
      origin: corsOriginHandler,
      credentials: true,
    },
  })

  socketServer.on('connection', (socket) => {
    logger.info('socket.connected')

    socket.on('new-task', (payload) => {
      socket.broadcast.emit('new-task', payload)
    })

    socket.on('disconnect', () => {
      logger.info('socket.disconnected')
    })
  })

  return socketServer
}
