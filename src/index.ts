import { ZXing } from './barcode-reader'
import interpretBarcode, { Ticket } from './barcode-data'
import fixingZXing from './fixingZXing'
import { loadFileOrBuffer } from './checkInput'
// const pdfReader = require('./lib/pdfReader')
// const {checkInput} = require('./lib/utils')

import { verifyTicketSignature } from './check_signature'

// const checkInput = (input, stringCallback =null, bufferCallback = null , defaultCallback = null) => {
//   if (typeof input === 'string') {
//     return fileWillExists(input)
//   } else if (input instanceof Buffer) {
//     return Promise.resolve(input)
//   } else {
//     return Promise.reject(new Error(`Error: Input must be a Buffer (Image) or a String (path to image)`))
//   }
// }

const fixZXING = async (res: { raw: Buffer }): Promise<Buffer> => { return await Promise.resolve(fixingZXing(res.raw)) }
const readZxing = async (filePath: Buffer): Promise<{ raw: Buffer }> => await ZXing(filePath)
const interpretBarcodeFn = async (res: Buffer) => { return await Promise.resolve(interpretBarcode(res)) }

export async function checkSignature (ticket: Ticket, verifyTicket: boolean) {
  if (verifyTicket) {
    ticket.isSignatureValid = await verifyTicketSignature(ticket)
  }
  return ticket
}

export async function readBarcode (input?: string | Buffer | unknown, options = {}) {
  const defaults = {
    verifySignature: false
  }
  const opts = Object.assign({}, defaults, options)

  return await new Promise((resolve, reject) => {
    // fileWillExists(filePath)
    loadFileOrBuffer(input)
      .then(readZxing)
      .then(fixZXING)
      .then(interpretBarcodeFn)
      .then(async ticket => await checkSignature(ticket, opts.verifySignature))
      .then((res) => resolve(res))
      .catch((err) => reject(err))
  })
}
// const readPDFBarcode = (input, options) => {
//   return new Promise((resolve, reject) => {
//     pdfReader(input)
//       .then(x => readBarcode(x, options))
//       .then((res) => resolve(res))
//       .catch((err) => reject(err))
//   })
// }
