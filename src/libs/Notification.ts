import * as _ from 'lodash'
import * as pluralize from 'pluralize'
import * as shortid from 'shortid'

import LogType from 'Constants/logType'

/**
 * Notification class.
 * A notification can be a cheer, a raid, a ritual, a resub, a sub, a subgift, etc.
 */
export default class Notification implements Serializable<SerializedNotification> {
  /**
   * Creates a new notification from a submysterygift user notice which corresponds to a known user gifting to a random
   * user.
   * @param  tags - The notice tags.
   * @return The new notice.
   */
  public static fromSubMysteryGift(tags: Record<string, string>) {
    const username = tags['display-name'] || tags.login
    const total = parseInt(tags['msg-param-mass-gift-count'], 10)

    return new Notification(
      `${username} is giving out ${total} sub ${pluralize('gift', total)}!`,
      NotificationEvent.SubMysteryGift
    )
  }

  /**
   * Creates a new notification from an anonsubgift user notice which corresponds to an unknown user gifting to a
   * specific user.
   * @param  tags - The notice tags.
   * @return The new notice.
   */
  public static fromAnonSubGift(tags: Record<string, string>) {
    const recipient = tags['msg-param-recipient-display-name'] || tags['msg-param-recipient-user-name']

    return new Notification(`An anonymous gifter just gifted a sub to ${recipient}!`, NotificationEvent.AnonSubGift)
  }

  /**
   * Creates a new notification from an anonsubmysterygift user notice which corresponds to an unknown user gifting to
   * multiple random users.
   * @param  tags - The notice tags.
   * @return The new notice.
   */
  public static fromAnonSubMysteryGift(tags: Record<string, string>) {
    const total = parseInt(tags['msg-param-mass-gift-count'], 10)

    return new Notification(
      `An anonymous gifter is giving out ${total} sub ${pluralize('gift', total)}!`,
      NotificationEvent.AnonSubMysteryGift
    )
  }

  /**
   * Creates a new notification from a giftpaidupgrade user notice which corresponds to a user continuing the gift sub
   * they got from a known user.
   * @param  tags - The notice tags.
   * @return The new notice.
   */
  public static fromGiftPaidUpgrade(tags: Record<string, string>) {
    const username = tags['display-name'] || tags.login
    const gifter = tags['msg-param-sender-name'] || tags['msg-param-sender-login']

    return new Notification(
      `${username} is continuing the gift sub they got from ${gifter}!`,
      NotificationEvent.GiftPaidUpgrade
    )
  }

  /**
   * Creates a new notification from an anongiftpaidupgrade user notice which corresponds to a user continuing the gift
   * sub they got from an unknown user.
   * @param  tags - The notice tags.
   * @return The new notice.
   */
  public static fromAnonGiftPaidUpgrade(tags: Record<string, string>) {
    const username = tags['display-name'] || tags.login

    return new Notification(
      `${username} is continuing the gift sub they got from an anonymous gifter!`,
      NotificationEvent.AnonGiftPaidUpgrade
    )
  }

  /**
   * Creates a new notification from a primepaidupgrade user notice which corresponds to a user upgrading their Prime
   * sub to a normal paid one.
   * @param  tags - The notice tags.
   * @return The new notice.
   */
  public static fromPrimePaidUpgrade(tags: Record<string, string>) {
    const username = tags['display-name'] || tags.login
    const plan = _.get(tags, 'msg-param-sub-plan', '')

    let tier = 1

    if (plan === '2000') {
      tier = 2
    } else if (plan === '3000') {
      tier = 3
    }

    return new Notification(
      `${username} just converted their Twitch Prime sub to a tier ${tier} sub!`,
      NotificationEvent.PrimePaidUpgrade
    )
  }

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
  AnonGiftPaidUpgrade,
  AnonSubGift,
  AnonSubMysteryGift,
  GiftPaidUpgrade,
  Host,
  PrimePaidUpgrade,
  Raid,
  ReSub,
  RitualNewChatter,
  SubGift,
  Subscription,
  SubMysteryGift,
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
