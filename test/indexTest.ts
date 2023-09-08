import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

import {barcodeDataToTicket} from '../src'

chai.use(chaiAsPromised)
chai.should()

describe('index', () => {
  describe('index.readBarcode', () => {
    // describe('...when inputis a local file', () => {
    //   it('should return an object on sucess', () => {
    //     return barcodeDataToTicket(dummy).should.eventually.be.an('object')
    //   })
    //   it('should eventually be resolved', () => {
    //     return barcodeDataToTicket(dummy).should.eventually.be.fulfilled
    //   })
    //   // it('should reject if file not found', () => {
    //   //   return barcodeDataToTicket(falseDummy).should.be.rejected
    //   // })
    //   // it('should handle verifySignature option and resolve', async () => {
    //   //   // eventually.have.deep.property('thing.foo', 'bar')
    //   //   // return Promise.resolve({ foo: 'bar' }).should.eventually.have.property('foo')
    //   //   // return (Promise.resolve({isSignatureValid: true})).should.eventually.have.deep.property('isSignatureValid', true)
    //   //   return barcodeDataToTicket(dummy4, { verifySignature: true }).should.eventually.have.property('isSignatureValid')
    //   // })
    // })
    // describe('...when input is an image buffer', () => {
    //   const dummyBuff = fs.readFileSync('test/images/barcode-dummy2.png')
    //   // const dummy3Buff = fs.readFileSync('test/images/barcode-dummy3.png')
    //   const dummy4Buff = fs.readFileSync('test/images/CT-003.png')
    //   it('should return an object on sucess', () => {
    //     return barcodeDataToTicket(dummyBuff).should.eventually.be.an('object')
    //   })
    //   it('should eventually be resolved', () => {
    //     return barcodeDataToTicket(dummyBuff).should.eventually.be.fulfilled
    //   })
    //   it('should handle verifySignature option and resolve', async () => {
    //     // eventually.have.deep.property('thing.foo', 'bar')
    //     // return Promise.resolve({ foo: 'bar' }).should.eventually.have.property('foo')
    //     // return (Promise.resolve({isSignatureValid: true})).should.eventually.have.deep.property('isSignatureValid', true)
    //     return barcodeDataToTicket(dummy4Buff, { verifySignature: true }).should.eventually.have.property('isSignatureValid')
    //   })
    // })
    describe('...when input is something else', () => {
      it('should reject if input is array', () => {
        // @ts-expect-error
        return barcodeDataToTicket([1, 2, 3]).should.be.rejected
      })
      it('should reject if input is object', () => {
        // @ts-expect-error
        return barcodeDataToTicket({ nr: 3 }).should.be.rejected
      })
      it('should reject if input is null', () => {
        // @ts-expect-error
        return barcodeDataToTicket().should.be.rejected
      })
    })
  })
})
