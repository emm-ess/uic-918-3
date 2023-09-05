import chai from 'chai'

import {
  arrayDefinedAndNotEmpty,
  assignArrayToObj,
  interpretField,
  pad,
  parseContainers,
  stringifyBufferObj,
} from '../src/utils'

chai.should()

describe('utils', () => {
  describe('utils.stringifyBufferObj', () => {
    const str = 'Hello World!'
    const str2 = 'Hello World!!!!!'
    const obj = {
      a: Buffer.from(str),
      b: 123,
      c: Buffer.from(str2)
    }
    const result = stringifyBufferObj(obj)
    it('should return an object where all buffer values would be converted to string values', () => {
      result.a.should.be.equal(str)
      result.c.should.be.equal(str2)
      result.a.should.be.a('string')
      result.c.should.be.a('string')
    })
    it('should return an object', () => {
      result.should.be.a('object')
    })
    it('should not change values which aren\'t strings', () => {
      result.b.should.be.equal(123)
    })
  })

  describe('utils.interpretField', () => {
    it('should return an object', () => {
      const data = Buffer.from('Test')
      const result = interpretField(data, [])
      result.should.be.an('object')
    })
    it('should return an empty object if fields is an empty arry', () => {
      const data = Buffer.from('Test')
      const result = interpretField(data, [])
      result.should.be.empty // eslint-disable-line no-unused-expressions
    })
    it('should parse a buffer using a given data field specification', () => {
      const data = Buffer.from([0x14, 0x14, 0x06, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x21])
      const fields = [
        ['TAG', 2, (x: Buffer) => x.toString('hex')],
        ['LENGTH', 1],
        ['TEXT', null, (x: Buffer) => x.toString()]
      ] as const
      const result = interpretField(data, fields)
      result.TAG.should.be.equal('1414')
      result.LENGTH.should.be.deep.equal(Buffer.from('06', 'hex'))
      result.TEXT.should.be.equal('Hello!')
    })
    it('should parse a buffer using a given data field specification', () => {
      const data = Buffer.from([0x14, 0x14, 0x06, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x21])
      const fields = [
        ['TAG', 2, (x: Buffer) => x.toString('hex')],
        ['LENGTH', 1],
        ['TEXT', null, (x: Buffer) => x.toString()]
      ] as const
      const result = interpretField(data, fields)
      result.TAG.should.be.equal('1414')
      result.LENGTH.should.be.deep.equal(Buffer.from('06', 'hex'))
      result.TEXT.should.be.equal('Hello!')
    })
  })

  describe('utils.parseContainers', () => {
    let results!: string[]
    beforeEach((done) => {
      const data = Buffer.from('Test')
      const f = (buf: Buffer): [string, Buffer] => [
        buf.slice(0, 1).toString(),
        buf.slice(1),
      ]
      results = parseContainers(data, f)
      done()
    })
    it('should return an array', () => {
      // @ts-ignore
      results.should.be.a('array')
    })
    it('should parse the values with the given logic in the function', () => {
      // @ts-ignore
      results.should.be.deep.equal(['T', 'e', 's', 't'])
    })
  })

  describe('utils.pad', () => {
    it('should return a string', () => {
      pad(12, 4).should.be.a('string')
    })
    it('should return a string with the give length', () => {
      const len = 12
      pad(12, len).length.should.be.equal(len)
    })
    it('should return a string respresentation of a number with leading zeros', () => {
      pad(12, 4).should.be.equal('0012')
    })
    it('should return a string respresentation of a hexstring with leading zeros', () => {
      pad('11', 4).should.be.equal('0011')
    })
  })

  describe('utils.arrayDefinedAndNotEmpty', () => {
    it('should return true on array with items', () => {
      arrayDefinedAndNotEmpty([1, 2, 3]).should.be.true // eslint-disable-line no-unused-expressions
    })
    it('should return false on array without items', () => {
      arrayDefinedAndNotEmpty([]).should.be.false // eslint-disable-line no-unused-expressions
    })
    it('should return false on undefined input', () => {
      arrayDefinedAndNotEmpty(undefined).should.be.false // eslint-disable-line no-unused-expressions
    })
  })
  describe('utils.assignArrayToObj', () => {
    const TEST_DATA = [
      { hello: 'world' },
      { thats: 's' },
      { a: 'test' }
    ]
    const result = assignArrayToObj(TEST_DATA)

    it('should return an object', () => {
      result.should.be.an('object')
    })
    it('should have all given properties', () => {
      result.should.have.deep.property('hello', 'world')
      result.should.have.deep.property('thats', 's')
      result.should.have.deep.property('a', 'test')
    })
  })
})
