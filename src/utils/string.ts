import * as _ from 'lodash'

/**
 * RegExp used to identify the start of a word.
 */
const WordStartRegExp = /[\w]+$/

/**
 * RegExp used to identify the end of a word.
 */
const WordEndRegExp = /^\w+/

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
