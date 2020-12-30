import _ from 'lodash'

/**
 * RegExp used to identify the start of a word.
 */
const WordStartRegExp = /[\w]+$/

/**
 * RegExp used to identify the end of a word.
 */
const WordEndRegExp = /^\w+/

/**
 * RegExp used to identify a whitespace at the beginning of a string.
 */
const WhiteSpaceStartRegExp = /^\s/

/**
 * RegExp used to identify a whitespace at the end of a string.
 */
const WhiteSpaceEndRegExp = /\s$/

/**
 * Extracts the word from a string at a specific position.
 * @param  str - The string.
 * @param  position - The position of the word.
 * @return The word at the position and its boundaries.
 */
export function getWordAtPosition(str: string, position: number) {
  const start = WordStartRegExp.exec(str.substr(0, position))
  const wordStart = _.isNil(start) ? position : start.index

  const end = WordEndRegExp.exec(str.substr(position))
  const wordEnd = position + (_.isNil(end) ? 0 : end[0].length)

  return { word: str.substring(wordStart, wordEnd), start: wordStart, end: wordEnd }
}

/**
 * Checks if a string starts with a whitespace character.
 * @param  str - The string.
 * @return `true` if the string starts with a whitespace character
 */
export function startWithWhiteSpace(str: string) {
  return WhiteSpaceStartRegExp.test(str)
}

/**
 * Checks if a string ends with a whitespace character.
 * @param  str - The string.
 * @return `true` if the string ends with a whitespace character
 */
export function endWithWhiteSpace(str: string) {
  return WhiteSpaceEndRegExp.test(str)
}

/**
 * Converts a base64 string to a base64url string.
 * @see https://tools.ietf.org/html/rfc4648#section-5
 * @param  base64 - A base64 string.
 * @return The base64url string.
 */
export function toBase64Url(base64: string): string {
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}
