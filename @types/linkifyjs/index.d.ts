declare module 'linkifyjs/html' {
  type Options = {
    attributes?: { [key: string]: string }
  }

  function linkifyHtml(str: string, options?: Options): string

  namespace linkifyHtml {

  }

  export default linkifyHtml
}
