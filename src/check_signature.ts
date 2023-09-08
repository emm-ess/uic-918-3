import { Header, Ticket } from './barcode-data'
import { Certificate, getCertByID } from './get_certs'
import rs from 'jsrsasign'

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
  const orgId = parseInt(header.rics.toString(), 10)
  const keyId = parseInt(header.key_id.toString(), 10)
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
  const publicKey = rs.KEYUTIL.getKey(`-----BEGIN CERTIFICATE-----\n${certificate.publicKey}-----END CERTIFICATE-----\n`)
  return checkSignature(publicKey, ticket.signature.toString('hex'), ticket.ticketDataRaw.toString('hex'))
}
