export function stringifyBufferObj <T extends Record<string, Uint8Array | any>> (obj: T): {
  [K in keyof T]: T[K] extends Uint8Array ? string : T[K]
} {
  for (const key in obj) {
    if (Buffer.isBuffer(obj[key])) {
      // @ts-ignore
      obj[key] = obj[key].toString()
    }
  }
  return obj
}

export type Interpreter = Readonly<[string, number | null] | [string, number | null, (buffer: Uint8Array) => any]>

export type InterpreterMapper<T extends Interpreter> = {
  [key in T[0]]: T[2] extends (buffer: Uint8Array) => infer R ? R : Uint8Array
}

export function interpretField<T extends Interpreter> (data: Uint8Array, fields: Readonly<T[]>): InterpreterMapper<T> {
  let remainder = data
  // @ts-expect-error
  return Object.fromEntries(fields.map((f) => {
    const interpretFunction = f[2] || ((x: Uint8Array): Uint8Array => x)
    let value
    if (f[1]) {
      value = interpretFunction(remainder.slice(0, f[1]))
      remainder = remainder.slice(f[1])
    } else {
      value = interpretFunction(remainder)
    }
    return [f[0], value]
  }))
}

export function parseContainers <R> (data: Uint8Array, f: (arg: Uint8Array) => [R, Uint8Array]): R[] {
  // f is a function which returns an array with a interpreted value from data and the remaining data as the second item
  let remainder = data
  const containers = []
  while (remainder.length > 0) {
    const result = f(remainder)
    containers.push(result[0])
    // if (containers.length < 10 ) {console.log(containers)};
    remainder = result[1]
  }
  return containers
}

export function myConsoleLog (str: string | unknown): void {
  /* following if statement is never fired up during test, so should be ignored */
  /* istanbul ignore if  */
  if (process.env['NODE_ENV'] !== 'test') {
    console.error(str)
  }
}

export function pad (number: number | string, length: number): string {
  let str = '' + number
  while (str.length < length) {
    str = '0' + str
  }
  return str
}

export function assignArrayToObj <T extends Array<Record<string, unknown>>> (arr: T): {
  [Key in keyof T[number]]: T[number][Key]
} {
  // @ts-expect-error
  return arr.reduce<{
    [Key in keyof T[number]]: T[number][Key]
  }>(
    (accumulator, currentValue) => {
      return Object.assign(accumulator, currentValue)
    },
    // @ts-expect-error
    {})
  // var obj = Object.assign({}, o1, o2, o3);
}

export function arrayDefinedAndNotEmpty (arr?: unknown[]): boolean {
  return (typeof arr !== 'undefined' && arr.length > 0)
}
