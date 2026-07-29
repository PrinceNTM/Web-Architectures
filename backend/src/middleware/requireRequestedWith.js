const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export const requireRequestedWith = (req, res, next) => {
  if (!STATE_CHANGING_METHODS.has(req.method)) {
    return next()
  }

  if (req.get('X-Requested-With') !== 'XMLHttpRequest') {
    return res.status(403).json({ error: 'Ungueltige Anfrage.' })
  }

  return next()
}