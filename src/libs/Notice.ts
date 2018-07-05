import linkifyHtml from 'linkifyjs/html'
import * as shortid from 'shortid'

import Event from 'Constants/event'
import LogType from 'Constants/logType'
import { escape } from 'Utils/html'
import { Serializable } from 'Utils/typescript'

/**
 * Notice class.
 */
export default class Notice implements Serializable<SerializedNotice> {
  private id: string
  private message: string
  private event: Event | null
  private linkify: boolean

  /**
   * Creates a new notice.
   * @class
   * @param message - The received message.
   * @param event - The associated event if any.
   * @param linkify - Defines if the notice can include links or not.
   */
  constructor(message: string, event: Event | null = null, linkify = false) {
    this.id = shortid.generate()
    this.message = message
    this.event = event
    this.linkify = linkify
  }

  /**
   * Serializes a notice.
   * @return The serialized notice.
   */
  public serialize() {
    return {
      event: this.event,
      id: this.id,
      linkify: this.linkify,
      message: this.linkify ? linkifyHtml(this.message) : escape(this.message),
      type: LogType.Notice,
    }
  }
}

/**
 * Serialized notice.
 */
export type SerializedNotice = {
  id: string
  event: Event | null
  linkify: boolean
  message: string
  type: LogType
}
