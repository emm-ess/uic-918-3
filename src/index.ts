import { convertBarcodeData } from './barcode-data'
// import { verifyTicketSignature } from './check_signature'

export {type Ticket} from './barcode-data'

// const DEFAULT_OPTIONS = {
//   verifySignature: false
// }

export async function barcodeDataToTicket (input: Uint8Array) {
  // const opts = Object.assign({}, DEFAULT_OPTIONS, options)

  return convertBarcodeData(input)
  // if (opts.verifySignature) {
  //   ticket.isSignatureValid = await verifyTicketSignature(ticket)
  // }
}
