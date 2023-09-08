import fs from 'node:fs'
import path from 'node:path'
import { myConsoleLog } from './utils'

function fileWithAbsolutePathExists (filePath: string): boolean {
  if (fs.existsSync(filePath)) {
    return true
  } else {
    myConsoleLog(`ERROR: ${filePath} not found.`)
    return false
  }
}

export function fileExists (filePath?: string): boolean {
  if (!filePath) {
    myConsoleLog('No path passed.')
    return false
  }
  if (!path.isAbsolute(filePath)) {
    filePath = path.join(process.cwd(), filePath)
  }
  return fileWithAbsolutePathExists(filePath)
}

// promisify fs.readFile()
export async function readFileAsync (filename: string): Promise<Buffer> {
  return await new Promise((resolve, reject) => {
    fs.readFile(filename, (err, buffer) => {
      if (err != null) {
        reject(err)
        return
      }
      resolve(buffer)
    })
  })
}

async function tryToLoadFile (filePath: string): Promise<Buffer> {
  if (!fileExists(filePath)) {
    throw Error()
  }
  return await readFileAsync(filePath)
}

export async function loadFileOrBuffer (input: string | Buffer | unknown): Promise<Buffer> {
  if (typeof input === 'string') {
    return tryToLoadFile(input)
  } else if (input instanceof Buffer) {
    return input
  }
  throw new Error('Error: Input must be a Buffer (Image) or a String (path to image)')
}
