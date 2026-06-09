import { Server } from 'socket.io'

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
    console.log(`Socket connected: ${socket.id}`)

    socket.on('new-task', (payload) => {
      console.log(`Received new-task from ${socket.id}`, payload)
      socket.broadcast.emit('new-task', payload)
    })

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`)
    })
  })

  return socketServer
}
