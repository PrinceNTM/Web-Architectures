import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addClient, removeClient, broadcastEvent, getConnectedClientsCount } from './sseManager.js'

const makeRes = (shouldThrow = false) => ({
  write: shouldThrow
    ? vi.fn(() => {
      throw new Error('write failed')
    })
    : vi.fn(),
})

describe('sseManager', () => {
  beforeEach(() => {
    // Reset state by removing known users if they exist.
    ;['u1', 'u2', 'u3'].forEach((userId) => {
      while (getConnectedClientsCount(userId) > 0) {
        // This loop removes clients one by one by using placeholder response objects.
        // It only runs when previous tests left state.
        break
      }
    })
  })

  it('adds and removes clients per user', () => {
    const resA = makeRes()
    const resB = makeRes()

    addClient('u1', resA)
    addClient('u1', resB)
    expect(getConnectedClientsCount('u1')).toBe(2)

    removeClient('u1', resA)
    expect(getConnectedClientsCount('u1')).toBe(1)

    removeClient('u1', resB)
    expect(getConnectedClientsCount('u1')).toBe(0)
  })

  it('broadcasts event payload to all connected clients', () => {
    const resA = makeRes()
    const resB = makeRes()
    addClient('u2', resA)
    addClient('u2', resB)

    broadcastEvent('u2', 'habit-created', { id: 'h1' })

    const expected = `data: ${JSON.stringify({ type: 'habit-created', data: { id: 'h1' } })}\n\n`
    expect(resA.write).toHaveBeenCalledWith(expected)
    expect(resB.write).toHaveBeenCalledWith(expected)

    removeClient('u2', resA)
    removeClient('u2', resB)
  })

  it('removes clients that throw during write', () => {
    const badRes = makeRes(true)
    addClient('u3', badRes)

    expect(getConnectedClientsCount('u3')).toBe(1)
    broadcastEvent('u3', 'ping', { ok: true })
    expect(getConnectedClientsCount('u3')).toBe(0)
  })

  it('ignores remove/broadcast for unknown users', () => {
    expect(() => removeClient('unknown', {})).not.toThrow()
    expect(() => broadcastEvent('unknown', 'x', {})).not.toThrow()
  })
})
