import iconv from 'iconv-lite'

export default function (buffer: Buffer) {
  // FIX: https://github.com/ashtuchkin/iconv-lite/wiki/Use-Buffers-when-decoding
  // WORKAROUND:
  // @ts-expect-error
  iconv.skipDecodeWarning = true
  // @ts-expect-error
  const latin1str = iconv.decode(buffer.toString('utf-8'), 'ISO-8859-1')
  return Buffer.from(latin1str, 'latin1')
}
