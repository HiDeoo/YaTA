import * as shortid from 'shortid'

import LogType from 'Constants/logType'
import { Serializable } from 'Utils/typescript'

/**
 * Notification class.
 * A notification can be a cheer, a raid, a ritual, a resub, a sub, a subgift, etc.
 */
export default class Notification implements Serializable<SerializedNotification> {
  private id: string
  private event: NotificationEvent
  private title: string
  private message?: string

  /**
   * Creates a new notice.
   * @class
   * @param title - The notification title.
   * @param event - The associated event.
   * @param [message] - An additional notification message.
   */
  constructor(title: string, event: NotificationEvent, message?: string) {
    this.id = shortid.generate()
    this.event = event
    this.title = title
    this.message = message
  }

  /**
   * Serializes a notification.
   * @return The serialized notification.
   */
  public serialize() {
    return {
      event: this.event,
      id: this.id,
      message: this.message,
      title: this.title,
      type: LogType.Notification,
    }
  }
}

/**
 * Notification associated events.
 */
export enum NotificationEvent {
  Raid,
  ReSub,
  RitualNewChatter,
  SubGift,
  Subscription,
}

/**
 * Serialized notification.
 */
export type SerializedNotification = {
  id: string
  event: NotificationEvent
  type: LogType
  title: string
  message?: string
}
