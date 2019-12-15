import _ from 'lodash'
import shortid from 'shortid'

import { SerializedHighlights } from 'store/ducks/settings'

/**
 * RegExp used to identify a valid highlight pattern.
 */
const PatternRegExp = /^[\w-]+$/

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
  public static validate(pattern: string, highlights: SerializedHighlights) {
    return PatternRegExp.test(pattern) && !_.includes(_.map(highlights, 'pattern'), pattern.toLowerCase())
  }

  private id: string
  private pattern: string

  /**
   * Creates a new highlight instance.
   * @class
   * @param pattern - The highlight pattern.
   * @param color - The highlight color.
   */
  constructor(pattern: string, private color: HighlightColors) {
    this.id = shortid.generate()
    this.pattern = pattern.toLowerCase()
  }

  /**
   * Serializes an highlight.
   * @return The serialized highlight.
   */
  public serialize() {
    return {
      color: this.color,
      id: this.id,
      pattern: this.pattern,
    }
  }
}

/**
 * Serialized highlight.
 */
export type SerializedHighlight = {
  color: HighlightColors
  id: string
  pattern: string
}

/**
 * Highlight color.
 */
export type HighlightColor = {
  background: string
  color: string
}

/**
 * Highlight colors.
 */
export enum HighlightColors {
  Yellow = 'Yellow',
  Blue = 'Blue',
  Green = 'Green',
  Red = 'Red',
}
