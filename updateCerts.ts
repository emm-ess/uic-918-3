import fs from 'node:fs'
import axios from 'axios'
import xml2js from 'xml2js'

import { myConsoleLog } from './src/utils'
import { url } from './src/cert_url.json'

const parser = new xml2js.Parser()

export async function updateLocalCerts (urlToLoad = url): Promise<void> {
    myConsoleLog(`Load public keys from ${urlToLoad} ...`)
    try {
        const response = await axios.get(urlToLoad)
        const result = await parser.parseStringPromise(response.data)
        fs.writeFileSync('./keys.json', JSON.stringify(result))
        myConsoleLog(`Loaded ${result.keys.key.length} public keys and saved under "./keys.json".`)
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data)
                console.log(error.response.status)
                console.log(error.response.headers)
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request)
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message)
            }
            console.log(error.config)
        }
        else {
            console.log(error)
        }
    }
}

updateLocalCerts()
