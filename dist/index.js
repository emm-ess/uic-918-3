"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.barcodeDataToTicket = void 0;
const barcode_data_1 = require("./barcode-data");
// const DEFAULT_OPTIONS = {
//   verifySignature: false
// }
async function barcodeDataToTicket(input) {
    // const opts = Object.assign({}, DEFAULT_OPTIONS, options)
    return (0, barcode_data_1.convertBarcodeData)(input);
    // if (opts.verifySignature) {
    //   ticket.isSignatureValid = await verifyTicketSignature(ticket)
    // }
}
exports.barcodeDataToTicket = barcodeDataToTicket;
