import fs from 'node:fs'
import path from 'node:path'
import axios from 'axios'
import xml2js from 'xml2js'

import { myConsoleLog } from './utils'
import { url, fileName } from './cert_url.json'

const basePath = path.dirname(require.resolve('./cert_url.json'))
const filePath = path.join(basePath, fileName)

const parser = new xml2js.Parser()

export interface Certificate {
  issuerName: string[]
  issuerCode: string[]
  versionType: string[]
  signatureAlgorithm: string[]
  id: string[]
  publicKey: string[]
  barcodeVersion: string[]
  startDate: string[]
  endDate: string[]
  barcodeXsd: string[]
  allowedProductOwnerCodes: string[]
  keyForged: string[]
  commentForEncryptionType: string[]
}

interface KeyFile {
  keys: {
    key: Certificate[]
  }
}

export async function updateLocalCerts (urlToLoad = url): Promise<void> {
  myConsoleLog(`Load public keys from ${urlToLoad} ...`)
  try {
    const response = await axios.get(urlToLoad)
    const result = await parser.parseStringPromise(response.data)
    fs.writeFileSync(filePath, JSON.stringify(result))
    myConsoleLog(`Loaded ${result.keys.key.length} public keys and saved under "${filePath}".`)
  }
  catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data)
        console.log(error.response.status)
        console.log(error.response.headers)
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request)
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message)
      }
      console.log(error.config)
    }
    else {
      console.log(error)
    }
  }
}

async function openLocalFiles (): Promise<KeyFile> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err == null) {
        resolve(JSON.parse(data))
      } else {
        reject(err)
      }
    })
  })
}

function selectCert (keys: KeyFile, orgId: number, keyId: number): Certificate {
  const issuerCode = orgId.toString()
  const id = keyId.toString()
  const certificate = keys.keys.key.find((key) => key.issuerCode[0] === issuerCode && key.id[0] === id)
  if (certificate) {
    return certificate
  }
  else {
    throw Error('Not Found!')
  }
}

export async function getCertByID (orgId: number, keyId: number): Promise<Certificate> {
  const keyFile = await openLocalFiles()
  return selectCert(keyFile, orgId, keyId)
}
