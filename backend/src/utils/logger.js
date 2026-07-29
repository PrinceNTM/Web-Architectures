const serializeError = (error) => {
  if (!error) {
    return undefined
  }

  return {
    name: error.name,
    message: error.message,
    statusCode: error.statusCode,
    code: error.code,
  }
}

const writeLog = (level, event, metadata = {}) => {
  const entry = {
    level,
    event,
    ...metadata,
  }

  const sink = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
  sink(entry)
}

export const logger = {
  info: (event, metadata = {}) => writeLog('info', event, metadata),
  warn: (event, metadata = {}) => writeLog('warn', event, metadata),
  error: (event, error, metadata = {}) => writeLog('error', event, {
    ...metadata,
    error: serializeError(error),
  }),
}