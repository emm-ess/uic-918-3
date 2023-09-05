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

async function getCertByHeader (header: Header): Promise<Certificate | null> {
  return await new Promise((resolve, reject) => {
    if (header) {
      const orgId = parseInt(header.rics.toString(), 10)
      const keyId = parseInt(header.key_id.toString(), 10)
      getCertByID(orgId, keyId)
        .then(cert => resolve(cert))
        .catch(err => reject(err))
    } else {
      resolve(null)
    }
  })
}

export async function verifyTicketSignature (ticket?: Ticket): Promise<boolean | null> {
  return await new Promise((resolve, reject) => {
    if (ticket != null) {
      getCertByHeader(ticket.header)
        .then(cert => {
          if (cert != null) {
            const publicKey = rs.KEYUTIL.getKey('-----BEGIN CERTIFICATE-----\n' + cert.publicKey + '\n-----END CERTIFICATE-----\n')
            resolve(checkSignature(publicKey, ticket.signature.toString('hex'), ticket.ticketDataRaw.toString('hex')))
          } else {
            resolve(null)
          }
        })
        .catch(err => reject(err))
    } else {
      resolve(null)
    }
  })
}
