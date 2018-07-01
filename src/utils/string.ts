import * as _ from 'lodash'

/**
 * Returns all the indexes of all occurences of a string in another string.
 * @see https://stackoverflow.com/a/3410557/1945960
 * @param  str - The string to search in.
 * @param  search - The search pattern.
 * @return The indexes.
 */
export function getWordsIndexesMatching(str: string, search: string) {
  const searchLength = search.length

  if (searchLength === 0) {
    return []
  }

  let index = 0
  let startIndex = 0
  const indexes = []

  // tslint:disable-next-line:no-conditional-assignment
  while ((index = str.indexOf(search, startIndex)) > -1) {
    const prevIndex = index - 1
    const nextIndex = index + searchLength

    const isLeftBoundary = prevIndex <= 0
    const isRightBoundary = nextIndex >= str.length

    const prevCharacter = str.charAt(prevIndex)
    const nextCharacter = str.charAt(nextIndex)

    if (
      (prevCharacter === ' ' && nextCharacter === ' ') ||
      (isLeftBoundary && isRightBoundary) ||
      (isLeftBoundary && nextCharacter === ' ') ||
      (prevCharacter === ' ' && isRightBoundary)
    ) {
      indexes.push(index)
    }

    startIndex = index + searchLength
  }

  return indexes
}

/**
 * Extracts the word from a string at a specific position.
 * @param  str - The string.
 * @param  position - The position of the word.
 * @return The word at the position and its boundaries.
 */
export function getWordAtPosition(str: string, position: number) {
  const start = /[\w]+$/.exec(str.substr(0, position))
  const wordStart = _.isNil(start) ? position : start.index

  const end = /^\w+/.exec(str.substr(position))
  const wordEnd = position + (_.isNil(end) ? 0 : end[0].length)

  return { word: str.substring(wordStart, wordEnd), start: wordStart, end: wordEnd }
}
