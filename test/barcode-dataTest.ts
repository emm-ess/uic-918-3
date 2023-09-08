import chai from 'chai'
import { dummyTicket } from './helper'
import{convertBarcodeData, type TicketDataContainer} from '../src/barcode-data'
chai.should()

describe('barcode-data', () => {
  describe('barcode-data.interpret', () => {
    it('should return an object', () => {
      const ticket = dummyTicket('U_HEAD', '01', 'Hi!')
      convertBarcodeData(ticket).should.be.an('object')
    })
    it('should return an empty array if input param is an empty buffer.', () => {
      // @ts-ignore
      convertBarcodeData(Buffer.from('')).ticketContainers.should.be.an('array')
      // @ts-ignore
      convertBarcodeData(Buffer.from('')).ticketContainers.should.be.empty // eslint-disable-line no-unused-expressions
    })

    describe('on unknown data fields', () => {
      let results!: TicketDataContainer[]
      beforeEach((done) => {
        const ticket = dummyTicket('MYID!!', '01', 'Test')
        results = convertBarcodeData(ticket).ticketContainers
        done()
      })
      it('should ignore unkown data fields', () => {
        // @ts-ignore
        results.should.not.be.empty // eslint-disable-line no-unused-expressions
      })
      it('should parse the unknown container id', () => {
        results[0].id.should.be.equal('MYID!!')
      })
      it('should not touch/parse the container data', () => {
        results[0].container_data.should.be.deep.equal(Buffer.from('Test'))
      })
    })
    describe('on unknown data fieds versions but known id', () => {
      let results!: TicketDataContainer[]
      beforeEach((done) => {
        const ticket = dummyTicket('U_HEAD', '03', 'Test')
        results = convertBarcodeData(ticket).ticketContainers
        done()
      })
      it('should ignore unkown versions of data fields', () => {
        // @ts-ignore
        results.should.not.be.empty // eslint-disable-line no-unused-expressions
      })
      it('should parse the unknown container id', () => {
        results[0].id.should.be.equal('U_HEAD')
      })
      it('should not touch/parse the container data', () => {
        results[0].container_data.should.be.deep.equal(Buffer.from('Test'))
      })
    })
  })
})
