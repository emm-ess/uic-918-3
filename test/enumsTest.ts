import chai from 'chai'

import { efmProdukt, idTypes, orgId, sBlockTypes, tarifpunkt } from '../src/enums'

chai.should()

describe('enums.sBlockTypes', () => {
  it('should return an instance of enum', () => {
    sBlockTypes.should.be.an.instanceof(Object)
  })
  it('should not be empty', () => {
    sBlockTypes.should.not.be.empty // eslint-disable-line no-unused-expressions
  })
})
describe('enums.id_types', () => {
  it('should return an instance of enum', () => {
    idTypes.should.be.an.instanceof(Object)
  })
  it('should not be empty', () => {
    idTypes.should.not.be.empty // eslint-disable-line no-unused-expressions
  })
})
describe('enums.efm_produkt', () => {
  it('should return an object', () => {
    efmProdukt(6263, 1005).should.be.a('object')
  })
  it('should have correct property kvp_organisations_id', () => {
    efmProdukt(6263, 1005).should.have.deep.property('kvp_organisations_id', '6263 (DB Regio Zentrale)')
  })
  it('should have correct property produkt_nr', () => {
    efmProdukt(6263, 1005).should.have.deep.property('produkt_nr', '1005 (Bayern-Ticket)')
  })
  it('should ignore unknow products', () => {
    efmProdukt(6263, 1).should.have.deep.property('kvp_organisations_id', '6263 (DB Regio Zentrale)')
    efmProdukt(6263, 1).should.have.deep.property('produkt_nr', '1')
  })
  it('should ignore unknow organisations', () => {
    efmProdukt(815, 1005).should.have.deep.property('kvp_organisations_id', '815')
    efmProdukt(815, 1005).should.have.deep.property('produkt_nr', '1005')
  })
})

describe('enums.org_id', () => {
  const result = orgId(6262)
  it('should return a string with the correct value', () => {
    result.should.be.equal('6262 (DB Fernverkehr)').and.be.a('string')
  })
  it('should ignore unknown values', () => {
    orgId(815).should.be.equal('815').and.be.a('string')
  })
})

describe('enums.tarifpunkt', () => {
  it('should return a string', () => {
    tarifpunkt(6263, 8000284).should.be.a('string')
  })
  it('should have correct properties', () => {
    tarifpunkt(6263, 8000284).should.be.equal('8000284 (Nürnberg Hbf)')
  })
  it('should ignore unknow stops', () => {
    tarifpunkt(6263, 1).should.be.equal('1')
  })
  it('should ignore unknow organisations', () => {
    tarifpunkt(1, 1).should.be.equal('1')
  })
})
