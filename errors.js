/**
 * Benutzerdefinierte Fehlerklasse für Validierungsfehler.
 * Wird im Service-Layer geworfen und im Controller zu HTTP 400 gemappt.
 */
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Ressource nicht gefunden.') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Zugriff verweigert.') {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
}