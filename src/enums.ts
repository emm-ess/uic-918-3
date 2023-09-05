import { ORG_ID, EFM_PRODUKTE, TARIFPUNKTE } from './ka-data'

export function orgId (orgId: number): string {
  // @ts-expect-error
  return ORG_ID[orgId] || orgId.toString()
}

export function tarifpunkt (orgId: number, tp: number): string {
  // @ts-expect-error
  return TARIFPUNKTE[orgId]?.[tp] || tp.toString()
}

export interface EfmProdukt {
  kvp_organisations_id: string
  produkt_nr: string
}

export function efmProdukt (organizationId: number, produktId: number): EfmProdukt {
  return {
    kvp_organisations_id: orgId(organizationId),
    // @ts-expect-error
    produkt_nr: EFM_PRODUKTE[organizationId]?.[produktId] || produktId.toString()
  }
}

export enum sBlockTypes {
  Preismodell = 1,
  'Produktklasse Gesamtticket' = 2,
  'Produktklasse Hinfahrt' = 3,
  'Produktklasse Rückfahrt' = 4,
  Passagiere = 9,
  Kinder = 12,
  Klasse = 14,
  'H-Start-Bf' = 15,
  'H-Ziel-Bf' = 16,
  'R-Start-Bf' = 17,
  'R-Ziel-Bf' = 18,
  'Vorgangsnr./Flugscheinnr.' = 19,
  Vertragspartner = 20,
  VIA = 21,
  Personenname = 23,
  Preisart = 26,
  'Ausweis-ID' = 27,
  'Vorname, Name' = 28,
  'Gueltig von' = 31,
  'Gueltig bis' = 32,
  'Start-Bf-ID' = 35,
  'Ziel-Bf-ID' = 36,
  'Anzahl Personen' = 40,
  'TBD EFS Anzahl' = 41,
}

export enum TBD0 {
  /* # '00' bei Schönem WE-Ticket / Ländertickets / Quer-Durchs-Land
  # '00' bei Vorläufiger BC
  # '02' bei Normalpreis Produktklasse C/B, aber auch Ausnahmen
  # '03' bei normalem IC/EC/ICE Ticket
  # '04' Hinfahrt A, Rückfahrt B; Rail&Fly ABC; Veranstaltungsticket; auch Ausnahmen
  # '05' bei Facebook-Ticket, BC+Sparpreis+neue BC25 [Ticket von 2011]
  # '18' bei Kauf via Android App */
}

export enum idTypes {
  CC = 1,
  BC = 4,
  EC = 7,
  'Bonus.card business' = 8,
  Personalausweis = 9,
  Reisepass = 10,
  'bahn.bonus Card' = 11,
}
