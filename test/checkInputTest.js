const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

const path = require('path')
const fs = require('fs')

const { fileExists, fileWillExists, loadFileOrBuffer, readFileAsync } = require('../lib/checkInput')

describe('checkInput.js', () => {
  const filePath = {}

  beforeEach((done) => {
    const file = 'index.js'
    filePath.relative_true = file
    filePath.relative_false = file + '1458'
    filePath.absolute_true = path.resolve(file)
    filePath.absolute_false = path.resolve(file) + '254'
    done()
  })

  describe('fileExists', () => {
    it('should return false if no file path given', () => {
      fileExists(null).should.be.false // eslint-disable-line no-unused-expressions
    })
    it('should return false if a file with relative path isn\'t found', () => {
      fileExists(filePath.relative_false).should.be.false // eslint-disable-line no-unused-expressions
    })
    it('should return true if a file with relative path is found', () => {
      fileExists(filePath.relative_true).should.be.true // eslint-disable-line no-unused-expressions
    })
    it('should return false if a file with absolute path isn\'t found', () => {
      fileExists(filePath.absolute_false).should.be.false // eslint-disable-line no-unused-expressions
    })
    it('should return true if a file with absolute path is found', () => {
      fileExists(filePath.absolute_true).should.be.true // eslint-disable-line no-unused-expressions
    })
  })

  describe('fileWillExists', () => {
    it('should return false if no file path given', () => {
      return fileWillExists(null).should.be.rejected // eslint-disable-line no-unused-expressions
    })
    it('should return false if a file with relative path isn\'t found', () => {
      return fileWillExists(filePath.relative_false).should.be.rejected // eslint-disable-line no-unused-expressions
    })
    it('should return true if a file with relative path is found', () => {
      return fileWillExists(filePath.relative_true).should.eventually.equal(filePath.relative_true) // eslint-disable-line no-unused-expressions
    })
    it('should return false if a file with absolute path isn\'t found', () => {
      return fileWillExists(filePath.absolute_false).should.be.rejected // eslint-disable-line no-unused-expressions
    })
    it('should return true if a file with absolute path is found', () => {
      return fileWillExists(filePath.absolute_true).should.eventually.equal(filePath.absolute_true)// eslint-disable-line no-unused-expressions
    })
  })
  describe('readFileAsync', () => {
    it('should return false if no file path given', () => {
      return readFileAsync(null).should.be.rejected // eslint-disable-line no-unused-expressions
    })
    it('should return false if a file with relative path isn\'t found', () => {
      return readFileAsync(filePath.relative_false).should.be.rejected // eslint-disable-line no-unused-expressions
    })
    it('should return true if a file with relative path is found', () => {
      return readFileAsync(filePath.relative_true).should.become(fs.readFileSync(filePath.relative_true)) // eslint-disable-line no-unused-expressions
    })
    it('should return false if a file with absolute path isn\'t found', () => {
      return readFileAsync(filePath.absolute_false).should.be.rejected // eslint-disable-line no-unused-expressions
    })
    it('should return true if a file with absolute path is found', () => {
      return readFileAsync(filePath.absolute_true).should.become(fs.readFileSync(filePath.absolute_true))// eslint-disable-line no-unused-expressions
    })
  })

  describe('isBufferOrString', () => {
    describe('with no optional parameters', () => {
      it('should be fulfilled with a string', () => {
        loadFileOrBuffer(filePath.relative_true).should.be.fulfilled // eslint-disable-line no-unused-expressions
        return loadFileOrBuffer(filePath.relative_true).should.become(fs.readFileSync(filePath.relative_true)) // eslint-disable-line no-unused-expressions
      })
      it('should be fulfilled with a Buffer', () => {
        const buf = Buffer.from('01125684')
        loadFileOrBuffer(buf).should.be.fulfilled // eslint-disable-line no-unused-expressions
        return loadFileOrBuffer(buf).should.become(buf) // eslint-disable-line no-unused-expressions
      })
      it('should be rejected with a wrong file path', () => {
        return loadFileOrBuffer(filePath.relative_false).should.be.rejected // eslint-disable-line no-unused-expressions
      })
    })
  })
})
