import { ZXing } from './barcode-reader'
import interpretBarcode, { type Ticket } from './barcode-data'
import fixingZXing from './fixingZXing'
import { loadFileOrBuffer } from './checkInput'

import { verifyTicketSignature } from './check_signature'

export async function checkSignature (ticket: Ticket, verifyTicket: boolean) {
  if (verifyTicket) {
    ticket.isSignatureValid = await verifyTicketSignature(ticket)
  }
}

export async function readBarcode (input?: string | Buffer | unknown, options = {}) {
  const defaults = {
    verifySignature: false
  }
  const opts = Object.assign({}, defaults, options)

  const imageData = await loadFileOrBuffer(input)
  const readCode = await ZXing(imageData)
  const readCodeFixed = fixingZXing(readCode.raw)
  const ticket = interpretBarcode(readCodeFixed)
  await checkSignature(ticket, opts.verifySignature)
  return ticket
}
