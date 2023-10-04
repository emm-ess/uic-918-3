import * as pako from 'pako'

import BLOCK_TYPES, {
  DataFieldNames,
  DataFieldVersions,
  uin8ArrayToIntViaString,
  uint8ArrayToString,
} from './block-types'
import {
  arrayDefinedAndNotEmpty,
  Interpreter,
  InterpreterMapper,
  interpretField,
  myConsoleLog,
  parseContainers
} from './utils'

export interface Header {
  umid: string
  mt_version: string
  rics: string
  key_id: string
}

function getHeader (data: Uint8Array): Header {
  return {
    umid: uint8ArrayToString(data.slice(0, 3)),
    mt_version: uint8ArrayToString(data.slice(3, 5)),
    rics: uint8ArrayToString(data.slice(5, 9)),
    key_id: uint8ArrayToString(data.slice(9, 14)),
  }
}

function getSignature (data: Uint8Array): Uint8Array {
  return data.slice(14, 64)
}

function getTicketDataLength (data: Uint8Array): number {
  return uin8ArrayToIntViaString(data.slice(64, 68))
}

function getTicketDataRaw (data: Uint8Array): Uint8Array {
  return data.slice(68, data.length)
}

function getTicketDataUncompressed (data: Uint8Array): Uint8Array {
  if (data?.length > 0) {
    // return zlib.unzipSync(data)
    return pako.inflate(data)
  } else {
    return data
  }
}

// Interpreters for uncompressed Ticket Data
export class TicketDataContainer {
  id: DataFieldNames
  version: DataFieldVersions
  length: number
  container_data: Uint8Array | InterpreterMapper<any>

  constructor (data: Uint8Array) {
    this.id = uint8ArrayToString(data.slice(0, 6)) as DataFieldNames
    this.version = uint8ArrayToString(data.slice(6, 8)) as DataFieldVersions
    this.length = uin8ArrayToIntViaString(data.slice(8, 12))
    // this.container_data = data.slice(12, data.length)
    this.container_data = this.parseFields(data.slice(12, data.length))
  }

  parseFields (data: Uint8Array): InterpreterMapper<any> | Uint8Array {
    const fields = getBlockTypeFieldsByIdAndVersion(this.id, this.version)
    if (fields != null) {
      return interpretField(data, fields)
    } else {
      debugger
      myConsoleLog(`ALERT: Container with id ${this.id} and version ${this.version} isn't implemented for TicketContainer ${this.id}.`)
      return data
    }
  }
}

function interpretTicketContainer (data: Uint8Array): [TicketDataContainer, Uint8Array] {
  const length = uin8ArrayToIntViaString(data.slice(8, 12))
  const remainder = data.slice(length, data.length)
  const container = new TicketDataContainer(data.slice(0, length))
  return [container, remainder]
}

function getBlockTypeFieldsByIdAndVersion (id: DataFieldNames, version: DataFieldVersions): Interpreter[] | null {
  const types = BLOCK_TYPES.filter(typ => (typ.name === id))
  if (arrayDefinedAndNotEmpty(types)) {
    return types[0]!.versions[version]
  } else {
    return null
  }
}

export interface Ticket {
  isSignatureValid?: boolean | null
  header: Header
  signature: Uint8Array
  ticketDataLength: number
  ticketDataRaw: Uint8Array
  ticketDataUncompressed: Uint8Array
  ticketContainers: TicketDataContainer[]
}

export function convertBarcodeData (data: Uint8Array): Ticket {
  const header = getHeader(data)
  const signature = getSignature(data)
  const ticketDataLength = getTicketDataLength(data)
  const ticketDataRaw = getTicketDataRaw(data)
  const ticketDataUncompressed = getTicketDataUncompressed(ticketDataRaw)
  const ticketContainers = parseContainers(ticketDataUncompressed, interpretTicketContainer)
  return { header, signature, ticketDataLength, ticketDataRaw, ticketDataUncompressed, ticketContainers }
}
