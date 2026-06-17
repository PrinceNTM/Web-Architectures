/**
 * Benutzerdefinierte Fehlerklasse für Validierungsfehler.
 * Wird im Service-Layer geworfen und im Controller zu HTTP 400 gemappt.
 */
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400; // Standard-Statuscode für Validierungsfehler
  }
}