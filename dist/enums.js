"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idTypes = exports.TBD0 = exports.sBlockTypes = exports.efmProdukt = exports.tarifpunkt = exports.orgId = void 0;
const ka_data_1 = require("./ka-data");
function orgId(orgId) {
    // @ts-expect-error
    return ka_data_1.ORG_ID[orgId] || orgId.toString();
}
exports.orgId = orgId;
function tarifpunkt(orgId, tp) {
    // @ts-expect-error
    return ka_data_1.TARIFPUNKTE[orgId]?.[tp] || tp.toString();
}
exports.tarifpunkt = tarifpunkt;
function efmProdukt(organizationId, produktId) {
    return {
        kvp_organisations_id: orgId(organizationId),
        // @ts-expect-error
        produkt_nr: ka_data_1.EFM_PRODUKTE[organizationId]?.[produktId] || produktId.toString()
    };
}
exports.efmProdukt = efmProdukt;
var sBlockTypes;
(function (sBlockTypes) {
    sBlockTypes[sBlockTypes["Preismodell"] = 1] = "Preismodell";
    sBlockTypes[sBlockTypes["Produktklasse Gesamtticket"] = 2] = "Produktklasse Gesamtticket";
    sBlockTypes[sBlockTypes["Produktklasse Hinfahrt"] = 3] = "Produktklasse Hinfahrt";
    sBlockTypes[sBlockTypes["Produktklasse R\u00FCckfahrt"] = 4] = "Produktklasse R\u00FCckfahrt";
    sBlockTypes[sBlockTypes["Passagiere"] = 9] = "Passagiere";
    sBlockTypes[sBlockTypes["Kinder"] = 12] = "Kinder";
    sBlockTypes[sBlockTypes["Klasse"] = 14] = "Klasse";
    sBlockTypes[sBlockTypes["H-Start-Bf"] = 15] = "H-Start-Bf";
    sBlockTypes[sBlockTypes["H-Ziel-Bf"] = 16] = "H-Ziel-Bf";
    sBlockTypes[sBlockTypes["R-Start-Bf"] = 17] = "R-Start-Bf";
    sBlockTypes[sBlockTypes["R-Ziel-Bf"] = 18] = "R-Ziel-Bf";
    sBlockTypes[sBlockTypes["Vorgangsnr./Flugscheinnr."] = 19] = "Vorgangsnr./Flugscheinnr.";
    sBlockTypes[sBlockTypes["Vertragspartner"] = 20] = "Vertragspartner";
    sBlockTypes[sBlockTypes["VIA"] = 21] = "VIA";
    sBlockTypes[sBlockTypes["Personenname"] = 23] = "Personenname";
    sBlockTypes[sBlockTypes["Preisart"] = 26] = "Preisart";
    sBlockTypes[sBlockTypes["Ausweis-ID"] = 27] = "Ausweis-ID";
    sBlockTypes[sBlockTypes["Vorname, Name"] = 28] = "Vorname, Name";
    sBlockTypes[sBlockTypes["Gueltig von"] = 31] = "Gueltig von";
    sBlockTypes[sBlockTypes["Gueltig bis"] = 32] = "Gueltig bis";
    sBlockTypes[sBlockTypes["Start-Bf-ID"] = 35] = "Start-Bf-ID";
    sBlockTypes[sBlockTypes["Ziel-Bf-ID"] = 36] = "Ziel-Bf-ID";
    sBlockTypes[sBlockTypes["Anzahl Personen"] = 40] = "Anzahl Personen";
    sBlockTypes[sBlockTypes["TBD EFS Anzahl"] = 41] = "TBD EFS Anzahl";
})(sBlockTypes || (exports.sBlockTypes = sBlockTypes = {}));
var TBD0;
(function (TBD0) {
    /* # '00' bei Schönem WE-Ticket / Ländertickets / Quer-Durchs-Land
    # '00' bei Vorläufiger BC
    # '02' bei Normalpreis Produktklasse C/B, aber auch Ausnahmen
    # '03' bei normalem IC/EC/ICE Ticket
    # '04' Hinfahrt A, Rückfahrt B; Rail&Fly ABC; Veranstaltungsticket; auch Ausnahmen
    # '05' bei Facebook-Ticket, BC+Sparpreis+neue BC25 [Ticket von 2011]
    # '18' bei Kauf via Android App */
})(TBD0 || (exports.TBD0 = TBD0 = {}));
var idTypes;
(function (idTypes) {
    idTypes[idTypes["CC"] = 1] = "CC";
    idTypes[idTypes["BC"] = 4] = "BC";
    idTypes[idTypes["EC"] = 7] = "EC";
    idTypes[idTypes["Bonus.card business"] = 8] = "Bonus.card business";
    idTypes[idTypes["Personalausweis"] = 9] = "Personalausweis";
    idTypes[idTypes["Reisepass"] = 10] = "Reisepass";
    idTypes[idTypes["bahn.bonus Card"] = 11] = "bahn.bonus Card";
})(idTypes || (exports.idTypes = idTypes = {}));
