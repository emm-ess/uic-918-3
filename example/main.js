import {readBarcodesFromImageData} from 'https://unpkg.com/@sec-ant/zxing-wasm@2.1.4/dist/reader'
import {barcodeDataToTicket} from './lib.js'

/**
 * @param width {number}
 * @param height {number}
 * @returns {OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null}
 */
function getContext(width, height) {
    if (window.OffscreenCanvas) {
        return new OffscreenCanvas(width, height).getContext('2d')
    }
    const canvas = document.createElement('canvas')
    canvas.width = 1920
    canvas.height = 1080
    return canvas.getContext('2d')
}

async function scanForTicket() {
    return new Promise(async (resolve) => {
        /** @type {MediaStream} */
        let stream
        let interval = 0
        let decoding = false

        stream = await navigator.mediaDevices.getUserMedia({video: true})
        const videoTrack = stream.getVideoTracks()[0]
        const constrains = videoTrack.getConstraints()
        const width = (constrains.width || 1920)
        const height = (constrains.height || 1080)
        const context = getContext(width, height)

        const videoEle = document.querySelector('#video')
        videoEle.addEventListener('loadeddata', onOpened, false)
        videoEle.srcObject = stream

        async function decode(){
            if (decoding || !videoEle || !context) {
                return
            }
            decoding = true
            context.drawImage(videoEle, 0, 0, width, height)
            const image = context.getImageData(0, 0, width, height)
            const barcodes = await readBarcodesFromImageData(image, {
                tryHarder: true,
                formats: ['Aztec'],
                maxSymbols: 1,
            })
            if (barcodes.length) {
                try {
                    const ticket = await barcodeDataToTicket(barcodes[0].bytes)
                    stop()
                    resolve(ticket)
                }
                catch (error) {
                    console.error(error)
                }
            }
            decoding = false
        }

        function onOpened() {
            if (!videoEle) {
                return
            }
            videoEle.play()
            videoEle.removeEventListener('loadeddata', onOpened, false)
            interval = setInterval(decode, 200)
        }

        function stop() {
            clearInterval(interval)
            videoEle.pause()
            videoEle.srcObject = null
            if (stream) {
                for (const track of stream.getVideoTracks()) {
                    track.stop()
                }
            }
        }
    })
}

async function startScan() {
    const videoWrapper = document.querySelector('#video-wrapper')
    videoWrapper.style.display = 'flex'
    const ticket = await scanForTicket()
    videoWrapper.style.display = 'none'
    const resultArea = document.querySelector('#output')
    resultArea.value = JSON.stringify(ticket, null, 4)
}

document.querySelector('#button').addEventListener('click', startScan)
