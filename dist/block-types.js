"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uint8ArrayToInt = exports.uin8ArrayToIntViaString = exports.uint8ArrayToHex = exports.uint8ArrayToString = void 0;
const utils_1 = require("./utils");
const enums_1 = require("./enums");
// ################
// DATA TYPES
// ################
const decoder = new TextDecoder();
function uint8ArrayToString(x) {
    return decoder.decode(x);
}
exports.uint8ArrayToString = uint8ArrayToString;
function uint8ArrayToHex(x) {
    return x.reduce((sum, part) => {
        sum += part.toString(16).padStart(2, '0');
        return sum;
    }, '');
}
exports.uint8ArrayToHex = uint8ArrayToHex;
function uin8ArrayToIntViaString(x, radix = 10) {
    return parseInt(decoder.decode(x), radix);
}
exports.uin8ArrayToIntViaString = uin8ArrayToIntViaString;
function uint8ArrayToInt(x) {
    return x.reduce((sum, part) => {
        sum <<= 8;
        sum += part;
        return sum;
    }, 0);
}
exports.uint8ArrayToInt = uint8ArrayToInt;
const DB_DATETIME = (x) => {
    // DDMMYYYYHHMM
    const day = uin8ArrayToIntViaString(x.slice(0, 2));
    const month = uin8ArrayToIntViaString(x.slice(2, 4)) - 1;
    const year = uin8ArrayToIntViaString(x.slice(4, 8));
    const hour = uin8ArrayToIntViaString(x.slice(8, 10));
    const minute = uin8ArrayToIntViaString(x.slice(10, 12));
    return new Date(year, month, day, hour, minute);
};
const KA_DATETIME = (x) => {
    // ‘yyyyyyymmmmddddd’B + hhhhhmmmmmmsssss’B  (4 Byte)
    // const dateStr = pad(parseInt(x.toString('hex'), 16).toString(2), 32)
    const dateStr = (0, utils_1.pad)(parseInt(uint8ArrayToHex(x), 16).toString(2), 32);
    const year = parseInt(dateStr.slice(0, 7), 2) + 1990;
    const month = parseInt(dateStr.slice(7, 11), 2) - 1;
    const day = parseInt(dateStr.slice(11, 16), 2);
    const hour = parseInt(dateStr.slice(16, 21), 2);
    const minute = parseInt(dateStr.slice(21, 27), 2);
    const sec = parseInt(dateStr.slice(27, 32), 2) / 2;
    return new Date(year, month, day, hour, minute, sec);
};
const ORG_ID = (x) => {
    const id = uint8ArrayToInt(x);
    return (0, enums_1.orgId)(id);
};
const EFM_PRODUKT = (x) => {
    const orgId = uint8ArrayToInt(x.slice(2, 4));
    const produktNr = uint8ArrayToInt(x.slice(0, 2));
    return (0, enums_1.efmProdukt)(orgId, produktNr);
};
const AUSWEIS_TYP = (x) => {
    const number = uin8ArrayToIntViaString(x);
    return enums_1.idTypes[number];
};
const DC_LISTE = (x) => {
    const dc_length = uint8ArrayToInt(x.slice(1, 2));
    const typ_DC = uint8ArrayToHex(x.slice(2, 3));
    const pv_org_id = uint8ArrayToInt(x.slice(3, 5));
    const TP = splitDCList(dc_length, typ_DC, x.slice(5, x.length))
        .map((item) => (0, enums_1.tarifpunkt)(pv_org_id, item));
    return { dc_length, typ_DC, pv_org_id, TP };
};
const EFS_FIELDS = [
    ['berechtigungs_nr', 4, uint8ArrayToInt],
    ['kvp_organisations_id', 2, ORG_ID],
    // ['produkt_nr', 2, INT],
    ['efm_produkt', 4, EFM_PRODUKT],
    ['valid_from', 4, KA_DATETIME],
    ['valid_to', 4, KA_DATETIME],
    ['preis', 3, uint8ArrayToInt],
    ['sam_seqno', 4, uint8ArrayToInt],
    ['lengthList_DC', 1, uint8ArrayToInt],
    ['Liste_DC', null, DC_LISTE]
];
const EFS_DATA = (x) => {
    const lengthListDC = uint8ArrayToInt(x.slice(25, 26));
    const t = [];
    if (lengthListDC + 26 < x.length) {
        t.push(x.slice(0, lengthListDC + 26));
        t.push(x.slice(lengthListDC + 26, x.length));
    }
    else {
        t.push(x.slice(0, lengthListDC + 26));
    }
    const res = {};
    t.forEach((ticket, index) => {
        res[1 + index] = (0, utils_1.interpretField)(ticket, EFS_FIELDS);
    });
    return res;
};
function splitDCList(dcLength, typDC, data) {
    // 0x0D 3 Byte CT, CM
    // 0x10 2 Byte Länder,SWT, QDL
    const SEP = parseInt(typDC, 16) === 0x10
        ? 2
        : 3;
    const amount = (dcLength - 3) / SEP;
    const res = [];
    for (let i = 0; i < amount; i++) {
        res.push(uint8ArrayToInt(data.slice(i * SEP, i * SEP + SEP)));
    }
    return res;
}
function interpretRCT2Block(data) {
    const length = uin8ArrayToIntViaString(data.slice(9, 13));
    const res = {
        line: uin8ArrayToIntViaString(data.slice(0, 2)),
        column: uin8ArrayToIntViaString(data.slice(2, 4)),
        height: uin8ArrayToIntViaString(data.slice(4, 6)),
        width: uin8ArrayToIntViaString(data.slice(6, 8)),
        style: uin8ArrayToIntViaString(data.slice(8, 9)),
        value: uint8ArrayToString(data.slice(13, 13 + length))
    };
    const rem = data.slice(13 + length);
    return [res, rem];
}
const RCT2_BLOCKS = (x) => {
    return (0, utils_1.parseContainers)(x, interpretRCT2Block);
};
const A_BLOCK_FIELDS_V2 = [
    ['certificate', 11, uint8ArrayToString],
    ['padding', 11, uint8ArrayToHex],
    ['valid_from', 8, uint8ArrayToString],
    ['valid_to', 8, uint8ArrayToString],
    ['serial', 8, uint8ArrayToString]
];
const A_BLOCK_FIELDS_V3 = [
    ['valid_from', 8, uint8ArrayToString],
    ['valid_to', 8, uint8ArrayToString],
    ['serial', 10, uint8ArrayToString]
];
function interpretSingleSBlock(data) {
    const number = uin8ArrayToIntViaString(data.slice(1, 4));
    const type = enums_1.sBlockTypes[number];
    const length = uin8ArrayToIntViaString(data.slice(4, 8));
    const res = {
        [type]: uint8ArrayToString(data.slice(8, 8 + length))
    };
    const rem = data.slice(8 + length);
    return [res, rem];
}
const auftraegeSBlocksV2 = (x) => {
    const A_LENGTH = 11 + 11 + 8 + 8 + 8;
    return auftraegeSblocks(x, A_LENGTH, A_BLOCK_FIELDS_V2);
};
const auftraegeSBlocksV3 = (x) => {
    const A_LENGTH = 10 + 8 + 8;
    return auftraegeSblocks(x, A_LENGTH, A_BLOCK_FIELDS_V3);
};
function auftraegeSblocks(x, A_LENGTH, fields) {
    const auftrag_count = uin8ArrayToIntViaString(x.slice(0, 1));
    const sblock_amount = uin8ArrayToIntViaString(x.slice(A_LENGTH * auftrag_count + 1, A_LENGTH * auftrag_count + 3));
    const sblocks = (0, utils_1.assignArrayToObj)((0, utils_1.parseContainers)(x.slice(A_LENGTH * auftrag_count + 3), interpretSingleSBlock));
    const res = {};
    for (let i = 0; i < auftrag_count; i++) {
        res[`auftrag_${i + 1}`] = (0, utils_1.interpretField)(x.slice(1 + (i * A_LENGTH), (i + 1) * A_LENGTH + 1), fields);
    }
    return { auftrag_count, sblock_amount, sblocks, ...res };
}
// ################
// DATA FIELDS
// ################
const DATA_FIELDS = [{
        name: 'U_HEAD',
        versions: {
            '01': [
                ['carrier', 4, uint8ArrayToString],
                ['auftragsnummer', 8, uint8ArrayToString],
                ['padding', 12, uint8ArrayToHex],
                ['creation_date', 12, DB_DATETIME],
                ['flags', 1, uint8ArrayToString
                    /*, lambda x: ",".join(
                   ['international'] if int(x) & 1 else [] +
                   ['edited'] if int(x) & 2 else [] +
                   ['specimen'] if int(x) & 4 else [])), */
                ],
                ['language', 2, uint8ArrayToString],
                ['language_2', 2, uint8ArrayToString]
            ]
        }
    }, {
        name: '0080VU',
        versions: {
            '01': [
                ['Terminalnummer:', 2, uint8ArrayToInt],
                ['SAM_ID', 3, uint8ArrayToInt],
                ['persons', 1, uint8ArrayToInt],
                ['anzahlEFS', 1, uint8ArrayToInt],
                ['VDV_EFS_BLOCK', null, EFS_DATA]
            ]
        }
    }, {
        name: '1180AI',
        versions: {
            '01': [
                ['customer?', 7, uint8ArrayToString],
                ['vorgangs_num', 8, uint8ArrayToString],
                ['unknown1', 5, uint8ArrayToString],
                ['unknown2', 2, uint8ArrayToString],
                ['full_name', 20, uint8ArrayToString],
                ['adults#', 2, uint8ArrayToInt],
                ['children#', 2, uint8ArrayToInt],
                ['unknown3', 2, uint8ArrayToString],
                ['description', 20, uint8ArrayToString],
                ['ausweis?', 10, uint8ArrayToString],
                ['unknown4', 7, uint8ArrayToString],
                ['valid_from', 8, uint8ArrayToString],
                ['valid_to?', 8, uint8ArrayToString],
                ['unknown5', 5, uint8ArrayToString],
                ['start_bf', 20, uint8ArrayToString],
                ['unknown6', 5, uint8ArrayToString],
                ['ziel_bf?', 20, uint8ArrayToString],
                ['travel_class', 1, uint8ArrayToInt],
                ['unknown7', 6, uint8ArrayToString],
                ['unknown8', 1, uint8ArrayToString],
                ['issue_date', 8, uint8ArrayToString]
            ]
        }
    }, {
        name: '0080BL',
        versions: {
            '02': [
                ['TBD0', 2, uint8ArrayToString],
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
                ['TBD0', 2, uint8ArrayToString],
                ['blocks', null, auftraegeSBlocksV3]
            ]
        }
    }, {
        name: '0080ID',
        versions: {
            '01': [
                ['ausweis_typ', 2, AUSWEIS_TYP],
                ['ziffer_ausweis', 4, uint8ArrayToString]
            ],
            '02': [
                ['ausweis_typ', 2, AUSWEIS_TYP],
                ['ziffer_ausweis', 4, uint8ArrayToString]
            ]
        }
    }, {
        name: 'U_TLAY',
        versions: {
            '01': [
                ['layout', 4, uint8ArrayToString],
                ['amount_rct2_blocks', 4, uin8ArrayToIntViaString],
                ['rct2_blocks', null, RCT2_BLOCKS]
            ]
        }
    }];
exports.default = DATA_FIELDS;
