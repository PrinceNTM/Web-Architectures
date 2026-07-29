const fs = require('fs')
const path = require('path')

const root = process.cwd()

const files = [
  { source: 'backend/.env.example', target: 'backend/.env' },
  { source: 'frontend/.env.example', target: 'frontend/.env.local' },
]

for (const file of files) {
  const sourcePath = path.join(root, file.source)
  const targetPath = path.join(root, file.target)

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing template file: ${file.source}`)
  }

  if (!fs.existsSync(targetPath)) {
    fs.copyFileSync(sourcePath, targetPath)
    console.log(`[env] created ${file.target} from ${file.source}`)
  } else {
    console.log(`[env] keeping existing ${file.target}`)
  }
}
