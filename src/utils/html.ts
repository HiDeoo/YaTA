import * as _ from 'lodash'

/**
 * Escapes HTML entities from a string array.
 * @param  html - The HTML to escape.
 * @return The escaped HTML.
 */
export function escapeArray(html: string[]) {
  return _.map(html, (character) => {
    if (character.length === 1) {
      return character.replace(/[\u00A0-\u9999<>\&]/g, (substring) => {
        return '&#' + substring.charCodeAt(0) + ';'
      })
    }

    return character
  })
}

/**
 * Escapes HTML entities from a string or string array.
 * @param  html - The HTML to escape.
 * @return The escaped HTML.
 */
export function escape(html: string): string
export function escape(html: string[]): string[]
export function escape(html: string | string[]) {
  if (_.isArray(html)) {
    return escapeArray(html)
  }

  return escapeArray(html.split('')).join('')
}

/**
 * Removes <img /> tags from a string and replace them by their associated alt attributes.
 * @param  str - The string to sanitize.
 * @return The sanitized string.
 */
export function replaceImgTagByAlt(str: string) {
  return str.replace(/<img.*?alt="(.*?)"[^\>]+>/g, '$1')
}
