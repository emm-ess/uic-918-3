import { read } from 'zebra-crossing'

const defaultOptions = {
  pureBarcode: true,
  tryHarder: true
}

export async function ZXing (data: Buffer | string, options = defaultOptions): Promise<{ raw: Buffer }> {
  return await read(data, options)
}
