import { io } from 'socket.io-client'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
let SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (API_BASE_URL.startsWith('http') ? API_BASE_URL.replace(/\/api$/, '') : '/')

// If the app is opened via an external browser on a different hostname/IP,
// dynamically adjust the socket URL to use the current hostname/IP.
if (typeof window !== 'undefined' && window.location) {
  const { hostname, protocol, origin } = window.location
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    if (SOCKET_URL.includes('localhost') || SOCKET_URL.includes('127.0.0.1')) {
      const backendPort = '3000'
      const wsProtocol = protocol === 'https:' ? 'https:' : 'http:'
      if (hostname.includes('5173')) {
        SOCKET_URL = `${wsProtocol}//${hostname.replace('5173', backendPort)}`
      } else if (origin.includes('5173')) {
        SOCKET_URL = origin.replace('5173', backendPort)
      } else {
        SOCKET_URL = `${wsProtocol}//${hostname}:${backendPort}`
      }
    }
  }
}

export const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
})
