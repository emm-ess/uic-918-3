import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

import { verifyTicketSignature } from '../src/check_signature'

chai.use(chaiAsPromised)
chai.should()

describe('check_signature', () => {
  describe('verifyTicket()', () => {
    it('should return null if no arguments are given', () => {
      return verifyTicketSignature().should.become(null)
    })
    it('should return  null if no ticket header is available', () => {
      const ticket = { value: 'fooBar' }
      // @ts-expect-error
      return verifyTicketSignature(ticket).should.be.fulfilled.and.become(null)
    })
    it('should return Error if no ticket certificate is available', () => {
      const ticket = {
        header: {
          umid: Buffer.from('235554', 'hex'),
          mt_version: Buffer.from('3031', 'hex'),
          rics: Buffer.from('1234'),
          key_id: Buffer.from('3030303036', 'hex')
        }
      }
      // @ts-expect-error
      return verifyTicketSignature(ticket).should.be.rejectedWith(Error)
    })
    it('should return true if a valid signature is given', () => {
      const ticket = {
        signature: Buffer.from('302c02146b646f806c2cbc1f16977166e626c3a251c30b5602144917f4e606dfa8150eb2fa4c174378972623e47400000000', 'hex'),
        ticketDataRaw: Buffer.from('789c6d90cd4ec24010c78b07f5e2c5534f86c48350539cd98f523c9014ba056285c40ae1661a056c2484b495a8275fc877f1017c1867900307770ffbdfdffee76367fcd037410808a025800f919a7ad3c095d6de124d04411ba5d2109ad0b0b1138304891a04a204147caabf532bbfa93ca5b5855e029c1b5ad172f6b6ce6759414010404142b20848b4486874c1858453700c0945422464a42a80789316c56c79d9cdca77421ee789f274f5327fcdcbda6d9aadeabb374115154e06c175b5371ede3bb58ee9387d73973851e8f44c3cbcea8e4cecc4a338767a833a05c86d438fcf79362fab715a94c43caece6d0a9f5f999eef2c097d9c7b44d9006cf09789882d517b84ba06c59c3467a320cda39b8c79267ed37aa2e1560e2ebe6a73bb3cfab6376dd7aab41b36cf9ce1f1cfe189bdf938fba4cbe23fc762e738cd7e01b9e06a43', 'hex'),
        header: {
          umid: '#UT',
          mt_version: '01',
          rics: '0080',
          key_id: '00007',
        },
      }
      // @ts-expect-error
      return verifyTicketSignature(ticket).should.be.fulfilled.and.become(true)
    })
    it('should return false if an invalid message is given', () => {
      const ticket = {
        signature: Buffer.from('302c02146b646f806c2cbc1f16977166e626c3a251c30b5602144917f4e606dfa8150eb2fa4c174378972623e47400000000', 'hex'),
        ticketDataRaw: Buffer.from('f000', 'hex'),
        header: {
          umid: '#UT',
          mt_version: '01',
          rics: '0080',
          key_id: '00007',
        },
      }
      // @ts-expect-error
      return verifyTicketSignature(ticket).should.be.fulfilled.and.become(false)
    })
  })
})
