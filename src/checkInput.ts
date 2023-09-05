import fs from 'fs'
import path from 'path'
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
  if (path.isAbsolute(filePath)) {
    return fileWithAbsolutePathExists(filePath)
  } else {
    const absolutePath = path.join(process.cwd(), filePath)
    return fileWithAbsolutePathExists(absolutePath)
  }
}

export async function fileWillExists (filePath?: string): Promise<string> {
  return await new Promise((resolve, reject) => {
    if (filePath && fileExists(filePath)) {
      resolve(filePath)
    } else {
      reject(new Error(`${filePath} not found.`))
    }
  })
}

// promisify fs.readFile()
export async function readFileAsync (filename?: string): Promise<Buffer> {
  return await new Promise((resolve, reject) => {
    if (!filename) {
      reject()
      return
    }
    fs.readFile(filename, (err, buffer) => {
      if (err != null) reject(err); else resolve(buffer)
    })
  })
}

async function tryToLoadFile (input: string): Promise<Buffer> {
  return await new Promise((resolve, reject) => {
    fileWillExists(input)
      .then(async input => await readFileAsync(input))
      .then(buffer => resolve(buffer))
      .catch(error => reject(error))
  })
}

// const loadFileOrBuffer = (input, stringCallback = null, bufferCallback = null, defaultCallback = null) => {
export async function loadFileOrBuffer (input: string | Buffer | unknown): Promise<Buffer> {
  if (typeof input === 'string') {
    // return stringCallback ? stringCallback(input) : tryToLoadFile(input)
    return await tryToLoadFile(input)
  } else if (input instanceof Buffer) {
    // return bufferCallback ? bufferCallback(input) : Promise.resolve(input)
    return await Promise.resolve(input)
  } else {
    // return defaultCallback ? defaultCallback(input) : Promise.reject(new Error(`Error: Input must be a Buffer (Image) or a String (path to image)`))
    return await Promise.reject(new Error('Error: Input must be a Buffer (Image) or a String (path to image)'))
  }
}
