import rs from 'jsrsasign'
import { Header, Ticket } from './barcode-data'
import {uint8ArrayToHex} from './block-types'

// we create the file during install -> maybe load differently?
// @ts-ignore
import keys from '../keys.json'

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

export function getCertByID (orgId: string, keyId: string): Certificate {
  const issuerCode = parseInt(orgId).toString()
  const id = parseInt(keyId).toString()
  const certificate = (keys as KeyFile).keys.key.find((key) => key.issuerCode[0] === issuerCode && key.id[0] === id)
  if (certificate) {
    return certificate
  }
  else {
    throw Error('Not Found!')
  }
}

function checkSignature (certPEM: ReturnType<typeof rs.KEYUTIL.getKey>, signature: string, message: string): boolean {
  // DSA signature validation
  const sig = new rs.KJUR.crypto.Signature({ alg: 'SHA1withDSA' })
  sig.init(certPEM)
  sig.updateHex(message)
  return sig.verify(signature)
}

async function getCertByHeader (header?: Header): Promise<Certificate | null> {
  if (!header) {
    return null
  }
  const orgId = header.rics
  const keyId = header.key_id
  return getCertByID(orgId, keyId)
}

export async function verifyTicketSignature (ticket?: Ticket): Promise<boolean | null> {
  if (!ticket) {
    return null
  }
  const certificate = await getCertByHeader(ticket.header)
  if (!certificate) {
    return null
  }
  const publicKey = rs.KEYUTIL.getKey(`-----BEGIN CERTIFICATE-----\n${certificate.publicKey}\n-----END CERTIFICATE-----\n`)
  const sig = uint8ArrayToHex(ticket.signature)
  const data = uint8ArrayToHex(ticket.ticketDataRaw)
  return checkSignature(publicKey, sig, data)
}
