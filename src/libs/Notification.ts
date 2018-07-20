import * as shortid from 'shortid'

import LogType from 'Constants/logType'
import { Serializable } from 'Utils/typescript'

/**
 * Notification class.
 * A notification can be a cheer, a raid, a ritual, a resub, a sub, a subgift, etc.
 */
export default class Notification implements Serializable<SerializedNotification> {
  private id: string

  /**
   * Creates a new notice.
   * @class
   * @param title - The notification title.
   * @param event - The associated event.
   * @param [message] - An additional notification message.
   */
  constructor(private title: string, private event: NotificationEvent, private message?: string) {
    this.id = shortid.generate()
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
