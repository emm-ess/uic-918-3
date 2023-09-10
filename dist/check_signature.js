"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTicketSignature = exports.getCertByID = void 0;
const jsrsasign_1 = __importDefault(require("jsrsasign"));
const block_types_1 = require("./block-types");
// @ts-ignore
const keys_json_1 = __importDefault(require("../keys.json"));
function getCertByID(orgId, keyId) {
    const issuerCode = parseInt(orgId).toString();
    const id = parseInt(keyId).toString();
    const certificate = keys_json_1.default.keys.key.find((key) => key.issuerCode[0] === issuerCode && key.id[0] === id);
    if (certificate) {
        return certificate;
    }
    else {
        throw Error('Not Found!');
    }
}
exports.getCertByID = getCertByID;
function checkSignature(certPEM, signature, message) {
    // DSA signature validation
    const sig = new jsrsasign_1.default.KJUR.crypto.Signature({ alg: 'SHA1withDSA' });
    sig.init(certPEM);
    sig.updateHex(message);
    return sig.verify(signature);
}
async function getCertByHeader(header) {
    if (!header) {
        return null;
    }
    const orgId = header.rics;
    const keyId = header.key_id;
    return getCertByID(orgId, keyId);
}
async function verifyTicketSignature(ticket) {
    if (!ticket) {
        return null;
    }
    const certificate = await getCertByHeader(ticket.header);
    if (!certificate) {
        return null;
    }
    const publicKey = jsrsasign_1.default.KEYUTIL.getKey(`-----BEGIN CERTIFICATE-----\n${certificate.publicKey}\n-----END CERTIFICATE-----\n`);
    const sig = (0, block_types_1.uint8ArrayToHex)(ticket.signature);
    const data = (0, block_types_1.uint8ArrayToHex)(ticket.ticketDataRaw);
    return checkSignature(publicKey, sig, data);
}
exports.verifyTicketSignature = verifyTicketSignature;
