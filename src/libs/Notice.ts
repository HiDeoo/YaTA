import * as shortid from 'shortid'

import Event from 'Constants/event'
import LogType from 'Constants/logType'
import { Serializable } from 'Utils/typescript'

/**
 * Notice class.
 */
export default class Notice implements Serializable<SerializedNotice> {
  private id: string
  private message: string
  private event: Event | null

  /**
   * Creates a new notice.
   * @class
   */
  constructor(message: string, event: Event | null = null) {
    this.id = shortid.generate()
    this.message = message
    this.event = event
  }

  /**
   * Serializes a notice.
   * @return The serialized notice.
   */
  public serialize() {
    return {
      event: this.event,
      id: this.id,
      message: this.message,
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
  message: string
  type: LogType
}
