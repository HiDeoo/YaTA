declare module 'bowser' {
  type Browser = { name: string; version: string }

  type Result = {
    browser: Browser
    engine: { name: string }
    os: { name: string; version: string }
    platform: { type: string; vendor: string }
  }

  class Parser {
    parsedResult: Result

    getBrowser(): Browser
    getBrowserName(): string
    parse(): { parsedResult: Result }
  }

  const _default: {
    getParser(userAgent: string): Parser
  }

  export default _default
}
