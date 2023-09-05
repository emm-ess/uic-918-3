import { assignArrayToObj, interpretField, parseContainers, pad, Interpreter, InterpreterMapper } from './utils'
import { EfmProdukt, efmProdukt, idTypes, orgId, sBlockTypes, tarifpunkt } from './enums'

// ################
// DATA TYPES
// ################

const STRING = (x: Buffer): string => x.toString()
const HEX = (x: Buffer): string => x.toString('hex')
const STR_INT = (x: Buffer): number => parseInt(x.toString(), 10)
const INT = (x: Buffer): number => x.readUIntBE(0, x.length)
const DB_DATETIME = (x: Buffer): Date => {
  // DDMMYYYYHHMM
  const day = STR_INT(x.slice(0, 2))
  const month = STR_INT(x.slice(2, 4)) - 1
  const year = STR_INT(x.slice(4, 8))
  const hour = STR_INT(x.slice(8, 10))
  const minute = STR_INT(x.slice(10, 12))
  return new Date(year, month, day, hour, minute)
}
const KA_DATETIME = (x: Buffer): Date => {
  // ‘yyyyyyymmmmddddd’B + hhhhhmmmmmmsssss’B  (4 Byte)
  const dateStr = pad(parseInt(x.toString('hex'), 16).toString(2), 32)
  const year = parseInt(dateStr.slice(0, 7), 2) + 1990
  const month = parseInt(dateStr.slice(7, 11), 2) - 1
  const day = parseInt(dateStr.slice(11, 16), 2)
  const hour = parseInt(dateStr.slice(16, 21), 2)
  const minute = parseInt(dateStr.slice(21, 27), 2)
  const sec = parseInt(dateStr.slice(27, 32), 2) / 2
  return new Date(year, month, day, hour, minute, sec)
}

const ORG_ID = (x: Buffer): string => {
  const id = INT(x)
  return orgId(id)
}

const EFM_PRODUKT = (x: Buffer): EfmProdukt => {
  const orgId = INT(x.slice(2, 4))
  const produktNr = INT(x.slice(0, 2))
  return efmProdukt(orgId, produktNr)
}
const AUSWEIS_TYP = (x: Buffer): string => {
  const number = STR_INT(x)
  return idTypes[number]
}

export interface DcListe {
  dc_length: number
  typ_DC: string
  pv_org_id: number
  TP: string[]
}

const DC_LISTE = (x: Buffer): DcListe => {
  const dc_length = INT(x.slice(1, 2))
  const typ_DC = HEX(x.slice(2, 3))
  const pv_org_id = INT(x.slice(3, 5))
  const TP = splitDCList(dc_length, typ_DC, x.slice(5, x.length))
    .map((item) => tarifpunkt(pv_org_id, item))

  return { dc_length, typ_DC, pv_org_id, TP }
}

const EFS_FIELDS = [
  ['berechtigungs_nr', 4, INT],
  ['kvp_organisations_id', 2, ORG_ID],
  // ['produkt_nr', 2, INT],
  ['efm_produkt', 4, EFM_PRODUKT],
  ['valid_from', 4, KA_DATETIME],
  ['valid_to', 4, KA_DATETIME],
  ['preis', 3, INT],
  ['sam_seqno', 4, INT],
  ['lengthList_DC', 1, INT],
  ['Liste_DC', null, DC_LISTE]
] as const

export type EfsData = Record<number, InterpreterMapper<(typeof EFS_FIELDS)[number]>>

const EFS_DATA = (x: Buffer): EfsData => {
  const lengthListDC = INT(x.slice(25, 26))
  const t = []
  if (lengthListDC + 26 < x.length) {
    t.push(x.slice(0, lengthListDC + 26))
    t.push(x.slice(lengthListDC + 26, x.length))
  } else {
    t.push(x.slice(0, lengthListDC + 26))
  }
  const res: EfsData = {}
  t.forEach((ticket, index) => {
    res[1 + index] = interpretField(ticket, EFS_FIELDS)
  })
  return res
}

function splitDCList (dcLength: number, typDC: string, data: Buffer): number[] {
  // 0x0D 3 Byte CT, CM
  // 0x10 2 Byte Länder,SWT, QDL
  const SEP = parseInt(typDC, 16) === 0x10
    ? 2
    : 3
  const amount = (dcLength - 3) / SEP
  const res = []
  for (let i = 0; i < amount; i++) {
    res.push(INT(data.slice(i * SEP, i * SEP + SEP)))
  }
  return res
}

export interface RCT2Block {
  line: number
  column: number
  height: number
  width: number
  style: number
  value: string
}

function interpretRCT2Block (data: Buffer): [RCT2Block, Buffer] {
  const length = parseInt(data.slice(9, 13).toString(), 10)
  const res = {
    line: parseInt(data.slice(0, 2).toString(), 10),
    column: parseInt(data.slice(2, 4).toString(), 10),
    height: parseInt(data.slice(4, 6).toString(), 10),
    width: parseInt(data.slice(6, 8).toString(), 10),
    style: parseInt(data.slice(8, 9).toString(), 10),
    value: data.slice(13, 13 + length).toString()
  }
  const rem = data.slice(13 + length)
  return [res, rem]
}

const RCT2_BLOCKS = (x: Buffer): RCT2Block[] => {
  return parseContainers(x, interpretRCT2Block)
}

const A_BLOCK_FIELDS_V2 = [
  ['certificate', 11, STRING],
  ['padding', 11, HEX],
  ['valid_from', 8, STRING],
  ['valid_to', 8, STRING],
  ['serial', 8, STRING]
] as const

const A_BLOCK_FIELDS_V3 = [
  ['valid_from', 8, STRING],
  ['valid_to', 8, STRING],
  ['serial', 10, STRING]
] as const

export type SingleSBlock = {
  [Key in keyof typeof sBlockTypes]?: string
}

function interpretSingleSBlock (data: Buffer): [SingleSBlock, Buffer] {
  const number = parseInt(data.slice(1, 4).toString(), 10)
  const type = sBlockTypes[number]
  const length = parseInt(data.slice(4, 8).toString(), 10)
  const res: SingleSBlock = {
    [type]: data.slice(8, 8 + length).toString()
  }
  const rem = data.slice(8 + length)
  return [res, rem]
}

export type AuftraegeSblocks = {
  auftrag_count: number
  sblock_amount: number
  sblocks: Record<string, unknown>
} & {
  [key in `auftrag_${number}`]: unknown
}

const auftraegeSBlocksV2 = (x: Buffer): AuftraegeSblocks => {
  const A_LENGTH = 11 + 11 + 8 + 8 + 8
  return auftraegeSblocks(x, A_LENGTH, A_BLOCK_FIELDS_V2)
}

const auftraegeSBlocksV3 = (x: Buffer): AuftraegeSblocks => {
  const A_LENGTH = 10 + 8 + 8
  return auftraegeSblocks(x, A_LENGTH, A_BLOCK_FIELDS_V3)
}

function auftraegeSblocks (x: Buffer, A_LENGTH: number, fields: Readonly<Interpreter[]>): AuftraegeSblocks {
  const auftrag_count = parseInt(x.slice(0, 1).toString(), 10)
  const sblock_amount = parseInt(x.slice(A_LENGTH * auftrag_count + 1, A_LENGTH * auftrag_count + 3).toString(), 10)
  const sblocks = assignArrayToObj(parseContainers(x.slice(A_LENGTH * auftrag_count + 3), interpretSingleSBlock))

  const res: {
    [key in `auftrag_${number}`]: unknown
  } = {}
  for (let i = 0; i < auftrag_count; i++) {
    res[`auftrag_${i + 1}`] = interpretField(x.slice(1 + (i * A_LENGTH), (i + 1) * A_LENGTH + 1), fields)
  }
  return { auftrag_count, sblock_amount, sblocks, ...res }
}

// ################
// DATA FIELDS
// ################

const DATA_FIELDS = [{
  name: 'U_HEAD',
  versions: {
    '01': [
      ['carrier', 4, STRING],
      ['auftragsnummer', 8, STRING],
      ['padding', 12, HEX],
      ['creation_date', 12, DB_DATETIME], /*, datetime_parser() */
      ['flags', 1, STRING
        /*, lambda x: ",".join(
                               ['international'] if int(x) & 1 else [] +
                               ['edited'] if int(x) & 2 else [] +
                               ['specimen'] if int(x) & 4 else [])), */
      ],
      ['language', 2, STRING],
      ['language_2', 2, STRING]
    ]
  }
}, {
  name: '0080VU',
  versions: {
    '01': [
      ['Terminalnummer:', 2, INT],
      ['SAM_ID', 3, INT],
      ['persons', 1, INT],
      ['anzahlEFS', 1, INT],
      ['VDV_EFS_BLOCK', null, EFS_DATA]
    ]
  }
}, {
  name: '1180AI',
  versions: {
    '01': [
      ['customer?', 7, STRING],
      ['vorgangs_num', 8, STRING],
      ['unknown1', 5, STRING],
      ['unknown2', 2, STRING],
      ['full_name', 20, STRING],
      ['adults#', 2, INT],
      ['children#', 2, INT],
      ['unknown3', 2, STRING],
      ['description', 20, STRING],
      ['ausweis?', 10, STRING],
      ['unknown4', 7, STRING],
      ['valid_from', 8, STRING],
      ['valid_to?', 8, STRING],
      ['unknown5', 5, STRING],
      ['start_bf', 20, STRING],
      ['unknown6', 5, STRING],
      ['ziel_bf?', 20, STRING],
      ['travel_class', 1, INT],
      ['unknown7', 6, STRING],
      ['unknown8', 1, STRING],
      ['issue_date', 8, STRING]
    ]
  }
}, {
  name: '0080BL',
  versions: {
    '02': [
      ['TBD0', 2, STRING],
      /* # '00' bei Schönem WE-Ticket / Ländertickets / Quer-Durchs-Land
      # '00' bei Vorläufiger BC
      # '02' bei Normalpreis Produktklasse C/B, aber auch Ausnahmen
      # '03' bei normalem IC/EC/ICE Ticket
      # '04' Hinfahrt A, Rückfahrt B; Rail&Fly ABC; Veranstaltungsticket; auch Ausnahmen
      # '05' bei Facebook-Ticket, BC+Sparpreis+neue BC25 [Ticket von 2011]
      # '18' bei Kauf via Android App */
      ['blocks', null, auftraegeSBlocksV2]
    ],
    '03': [
      ['TBD0', 2, STRING],
      ['blocks', null, auftraegeSBlocksV3]
    ]
  }
}, {
  name: '0080ID', // NO SOURCE FOUND FOR THIS BLOCK.
  versions: {
    '01': [
      ['ausweis_typ', 2, AUSWEIS_TYP],
      ['ziffer_ausweis', 4, STRING]
    ],
    '02': [
      ['ausweis_typ', 2, AUSWEIS_TYP],
      ['ziffer_ausweis', 4, STRING]
    ]
  }
}, {
  name: 'U_TLAY',
  versions: {
    '01': [
      ['layout', 4, STRING],
      ['amount_rct2_blocks', 4, STR_INT],
      ['rct2_blocks', null, RCT2_BLOCKS]
    ]
  }
}] as const

export type DataFieldNames = (typeof DATA_FIELDS)[number]['name']
export type DataFieldVersions = keyof (typeof DATA_FIELDS)[number]['versions']

export default DATA_FIELDS
