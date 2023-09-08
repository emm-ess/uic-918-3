import fs from 'node:fs'
import path from 'node:path'
import chai from 'chai'

import { updateLocalCerts } from '../updateCerts'
import { fileName } from '../src/cert_url.json'

chai.should()
const filePath = path.join(__dirname, '../', fileName)

describe('get_certs', () => {
    describe('updateLocalCerts', () => {
        before((done) => {
            // remove keys.json
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
            }
            updateLocalCerts(filePath)
            done()
        })
        it('should create a not empty file', () => {
            // expect(file(filePath)).to.exist.and.to.not.be.empty()
        })
    })
})
