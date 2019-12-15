import _ from 'lodash'

declare global {
  /**
   * Optional value.
   */
  export type Optional<T> = T | undefined

  /**
   * Serializable interface.
   */
  export interface Serializable<T> {
    serialize(): T
  }

  /**
   * Recursive Partial<T>.
   */
  export type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> }
}

/**
 * Checks if a value is included in a string based enum.
 * @param  theEnum - The enum.
 * @param  value - The value to find.
 * @return `true` if the value is in the enum.
 */
export function enumIncludes<Enum>(theEnum: Enum, value: string) {
  return _.includes(_.values(theEnum), value)
}
