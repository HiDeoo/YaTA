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
