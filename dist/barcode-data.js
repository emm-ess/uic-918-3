"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertBarcodeData = exports.TicketDataContainer = void 0;
const pako_1 = __importDefault(require("pako"));
const block_types_1 = __importStar(require("./block-types"));
const utils_1 = require("./utils");
function getHeader(data) {
    return {
        umid: (0, block_types_1.uint8ArrayToString)(data.slice(0, 3)),
        mt_version: (0, block_types_1.uint8ArrayToString)(data.slice(3, 5)),
        rics: (0, block_types_1.uint8ArrayToString)(data.slice(5, 9)),
        key_id: (0, block_types_1.uint8ArrayToString)(data.slice(9, 14)),
    };
}
function getSignature(data) {
    return data.slice(14, 64);
}
function getTicketDataLength(data) {
    return (0, block_types_1.uin8ArrayToIntViaString)(data.slice(64, 68));
}
function getTicketDataRaw(data) {
    return data.slice(68, data.length);
}
function getTicketDataUncompressed(data) {
    if (data?.length > 0) {
        // return zlib.unzipSync(data)
        return pako_1.default.inflate(data);
    }
    else {
        return data;
    }
}
// Interpreters for uncompressed Ticket Data
class TicketDataContainer {
    id;
    version;
    length;
    container_data;
    constructor(data) {
        this.id = (0, block_types_1.uint8ArrayToString)(data.slice(0, 6));
        this.version = (0, block_types_1.uint8ArrayToString)(data.slice(6, 8));
        this.length = (0, block_types_1.uin8ArrayToIntViaString)(data.slice(8, 12));
        // this.container_data = data.slice(12, data.length)
        this.container_data = this.parseFields(data.slice(12, data.length));
    }
    parseFields(data) {
        const fields = getBlockTypeFieldsByIdAndVersion(this.id, this.version);
        if (fields != null) {
            return (0, utils_1.interpretField)(data, fields);
        }
        else {
            debugger;
            (0, utils_1.myConsoleLog)(`ALERT: Container with id ${this.id} and version ${this.version} isn't implemented for TicketContainer ${this.id}.`);
            return data;
        }
    }
}
exports.TicketDataContainer = TicketDataContainer;
function interpretTicketContainer(data) {
    const length = (0, block_types_1.uin8ArrayToIntViaString)(data.slice(8, 12));
    const remainder = data.slice(length, data.length);
    const container = new TicketDataContainer(data.slice(0, length));
    return [container, remainder];
}
function getBlockTypeFieldsByIdAndVersion(id, version) {
    const types = block_types_1.default.filter(typ => (typ.name === id));
    if ((0, utils_1.arrayDefinedAndNotEmpty)(types)) {
        return types[0].versions[version];
    }
    else {
        return null;
    }
}
function convertBarcodeData(data) {
    const header = getHeader(data);
    const signature = getSignature(data);
    const ticketDataLength = getTicketDataLength(data);
    const ticketDataRaw = getTicketDataRaw(data);
    const ticketDataUncompressed = getTicketDataUncompressed(ticketDataRaw);
    const ticketContainers = (0, utils_1.parseContainers)(ticketDataUncompressed, interpretTicketContainer);
    return { header, signature, ticketDataLength, ticketDataRaw, ticketDataUncompressed, ticketContainers };
}
exports.convertBarcodeData = convertBarcodeData;
