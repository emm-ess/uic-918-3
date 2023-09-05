import fs from 'fs'
import path from 'path'
import axios from 'axios'
import _ from 'lodash'
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

export function updateLocalCerts (urlToLoad = url) {
  myConsoleLog(`Load public keys from ${urlToLoad} ...`)
  axios.get(urlToLoad)
    .then((response) => {
      parser.parseString(response.data, (err, result) => {
      /* istanbul ignore else */
        if (err == null) {
          fs.writeFileSync(filePath, JSON.stringify(result))
          myConsoleLog(`Loaded ${result.keys.key.length} public keys and saved under "${filePath}".`)
        } else {
          console.log(err)
        }
      })
    })
    .catch(function (error) {
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
    })
}

async function openLocalFiles (): Promise<KeyFile> {
  return await new Promise((resolve, reject) => {
    // const filePath = path.join(__dirname, '../', fileName)
    fs.readFile(filePath, 'utf8', (err, data) => {
      /* istanbul ignore else */
      if (err == null) {
        resolve(JSON.parse(data))
      } else {
        reject(err)
      }
    })
  })
}

async function selectCert (keys: KeyFile, orgId: number, keyId: number): Promise<Certificate> {
  return await new Promise((resolve, reject) => {
    const cert = _.find(keys.keys.key, { issuerCode: [orgId.toString()], id: [keyId.toString()] })
    if (cert != null) {
      resolve(cert)
    } else {
      reject(Error('Not Found!'))
    }
  })
}

export async function getCertByID (orgId: number, keyId: number): Promise<Certificate> {
  return await new Promise((resolve, reject) => {
    openLocalFiles()
      .then(async keys => await selectCert(keys, orgId, keyId))
      .then(cert => resolve(cert))
      .catch(err => reject(err))
  })
}
