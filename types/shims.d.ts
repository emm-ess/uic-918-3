declare module 'zebra-crossing' {
  export const read: (data: Buffer | string, options: Record<string, boolean>) => Promise<{ raw: Buffer }>
}
