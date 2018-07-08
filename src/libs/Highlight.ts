import * as _ from 'lodash'
import * as shortid from 'shortid'

import { Highlights } from 'Store/ducks/settings'
import { Serializable } from 'Utils/typescript'

/**
 * RegExp used to identify a valid highlight pattern.
 */
const PatternRegExp = /^[\w\-]+$/

/**
 * Highlight class.
 */
export default class Highlight implements Serializable<SerializedHighlight> {
  /**
   * Validates an highlight.
   * @param  pattern - The highlight pattern.
   * @param  highlights - The existing highlights.
   * @return `true` if the highlight is valid.
   */
  public static validate(pattern: string, highlights: Highlights) {
    return PatternRegExp.test(pattern) && !_.includes(_.map(highlights, 'pattern'), pattern.toLowerCase())
  }

  private id: string
  private pattern: string

  /**
   * Creates a new highlight instance.
   * @class
   * @param pattern - The highlight pattern.
   */
  constructor(pattern: string) {
    this.id = shortid.generate()
    this.pattern = pattern.toLowerCase()
  }

  /**
   * Serializes an highlight.
   * @return The serialized highlight.
   */
  public serialize() {
    return {
      id: this.id,
      pattern: this.pattern,
    }
  }
}

/**
 * Serialized highlight.
 */
export type SerializedHighlight = {
  id: string
  pattern: string
}
