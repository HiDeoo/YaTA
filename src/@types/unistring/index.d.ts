declare module 'unistring' {
  export type Word = {
    text: string
    index: number
    length: number
    type: number
  }

  const _default: {
    getWords(str: string): Word[]
  }

  export default _default
}
