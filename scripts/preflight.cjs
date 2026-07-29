const fs = require('fs')
const path = require('path')

const root = process.cwd()

const readEnvFile = (relativePath) => {
  const filePath = path.join(root, relativePath)
  if (!fs.existsSync(filePath)) {
    return { exists: false, values: {}, filePath }
  }

  const raw = fs.readFileSync(filePath, 'utf8')
  const lines = raw.split(/\r?\n/)
  const values = {}

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) continue

    const key = trimmed.slice(0, separatorIndex).trim()
    let value = trimmed.slice(separatorIndex + 1).trim()

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    values[key] = value
  }

  return { exists: true, values, filePath }
}

const required = {
  'backend/.env': ['DATABASE_URL', 'JWT_SECRET'],
  'frontend/.env.local': ['VITE_API_BASE_URL'],
}

const failures = []

for (const [relativePath, keys] of Object.entries(required)) {
  const result = readEnvFile(relativePath)

  if (!result.exists) {
    failures.push(`${relativePath} is missing`)
    continue
  }

  for (const key of keys) {
    const value = result.values[key]
    if (typeof value !== 'string' || value.trim() === '') {
      failures.push(`${relativePath}: ${key} is missing or empty`)
    }
  }
}

if (failures.length > 0) {
  console.error('[preflight] failed')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('[preflight] ok')
