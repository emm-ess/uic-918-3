import pako from 'pako'

import BLOCK_TYPES, { DataFieldNames, DataFieldVersions } from './block-types'
import {
  arrayDefinedAndNotEmpty,
  Interpreter,
  InterpreterMapper,
  interpretField,
  myConsoleLog,
  parseContainers
} from './utils'

export interface Header {
  umid: Buffer
  mt_version: Buffer
  rics: Buffer
  key_id: Buffer
}

function getHeader (data: Buffer): Header {
  return {
    umid: data.slice(0, 3),
    mt_version: data.slice(3, 5),
    rics: data.slice(5, 9),
    key_id: data.slice(9, 14)
  }
}

function getSignature (data: Buffer): Buffer {
  return data.slice(14, 64)
}

function getTicketDataLength (data: Buffer): Buffer {
  return data.slice(64, 68)
}

function getTicketDataRaw (data: Buffer): Buffer {
  return data.slice(68, data.length)
}

function getTicketDataUncompressed (data: Buffer): Buffer {
  if (data?.length > 0) {
    // return zlib.unzipSync(data)
    return Buffer.from(pako.inflate(data))
  } else {
    return data
  }
}

// Interpreters for uncompressed Ticket Data
export class TicketDataContainer {
  id: DataFieldNames
  version: DataFieldVersions
  length: number
  container_data: Buffer | InterpreterMapper<any>

  constructor (data: Buffer) {
    this.id = data.slice(0, 6).toString() as DataFieldNames
    this.version = data.slice(6, 8).toString() as DataFieldVersions
    this.length = parseInt(data.slice(8, 12).toString(), 10)
    // this.container_data = data.slice(12, data.length)
    this.container_data = this.parseFields(data.slice(12, data.length))
  }

  parseFields (data: Buffer): InterpreterMapper<any> | Buffer {
    const fields = getBlockTypeFieldsByIdAndVersion(this.id, this.version)
    if (fields != null) {
      return interpretField(data, fields)
    } else {
      myConsoleLog(`ALERT: Container with id ${this.id} and version ${this.version} isn't implemented for TicketContainer ${this.id}.`)
      return data
    }
  }
}

function interpretTicketContainer (data: Buffer): [TicketDataContainer, Buffer] {
  const length = parseInt(data.slice(8, 12).toString(), 10)
  const remainder = data.slice(length, data.length)
  const container = new TicketDataContainer(data.slice(0, length))
  return [container, remainder]
}

function getBlockTypeFieldsByIdAndVersion (id: DataFieldNames, version: DataFieldVersions): Interpreter[] | null {
  const types = BLOCK_TYPES.filter(typ => (typ.name === id))
  if (arrayDefinedAndNotEmpty(types)) {
    return types[0].versions[version]
  } else {
    return null
  }
}

export interface Ticket {
  isSignatureValid?: boolean | null
  header: Header
  signature: Buffer
  ticketDataLength: Buffer
  ticketDataRaw: Buffer
  ticketDataUncompressed: Buffer
  ticketContainers: TicketDataContainer[]
}

export default function (data: Buffer): Ticket {
  const header = getHeader(data)
  const signature = getSignature(data)
  const ticketDataLength = getTicketDataLength(data)
  const ticketDataRaw = getTicketDataRaw(data)
  const ticketDataUncompressed = getTicketDataUncompressed(ticketDataRaw)
  const ticketContainers = parseContainers(ticketDataUncompressed, interpretTicketContainer)
  return { header, signature, ticketDataLength, ticketDataRaw, ticketDataUncompressed, ticketContainers }
}
