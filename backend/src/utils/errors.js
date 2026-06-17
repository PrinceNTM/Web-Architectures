// backend/src/utils/errors.js
class ValidationError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = statusCode;
  }
}

class NotFoundError extends Error {
  constructor(message, statusCode = 404) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = statusCode;
  }
}

class ForbiddenError extends Error {
  constructor(message, statusCode = 403) {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = statusCode;
  }
}

export { ValidationError, NotFoundError, ForbiddenError };