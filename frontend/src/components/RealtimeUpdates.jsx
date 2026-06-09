import { useEffect } from 'react'
import { socket } from '../services/socket.js'

function RealtimeUpdates({ onNewHabit }) {
  useEffect(() => {
    socket.connect()

    const handleNewTask = (payload) => {
      if (!payload?.id) {
        return
      }

      onNewHabit?.({
        id: payload.id,
        name: payload.name,
        category: payload.category || 'General',
      })
    }

    socket.on('new-task', handleNewTask)

    return () => {
      socket.off('new-task', handleNewTask)
      socket.disconnect()
    }
  }, [onNewHabit])

  return null
}

export default RealtimeUpdates
