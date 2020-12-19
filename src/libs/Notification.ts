import _ from 'lodash'
import pluralize from 'pluralize'
import { nanoid } from 'nanoid'

import LogType from 'constants/logType'
import { getMonthFromIndex } from 'utils/time'

/**
 * Notification associated events.
 */
export enum NotificationEvent {
  AnonGiftPaidUpgrade,
  AnonSubGift,
  AnonSubMysteryGift,
  BitsBadgeTier,
  ExtendedSub,
  GiftPaidUpgrade,
  Host,
  PrimePaidUpgrade,
  Raid,
  ReSub,
  RewardGift,
  RitualNewChatter,
  SubGift,
  Subscription,
  SubMysteryGift,
}

/**
 * Notification class.
 * A notification can be a cheer, a raid, a ritual, a resub, a sub, a subgift, etc.
 */
export default class Notification implements Serializable<SerializedNotification> {
  /**
   * Creates a new notification from a submysterygift user notice which corresponds to a known user gifting to some
   * random users.
   * @param  tags - The notice tags.
   * @return The new notice.
   */
  public static fromSubMysteryGift(tags: Record<string, string>) {
    return new Notification(Notification.getMysteryGiftNotificationTitle(tags, false), NotificationEvent.SubMysteryGift)
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
    return new Notification(
      Notification.getMysteryGiftNotificationTitle(tags, true),
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

  /**
   * Creates a new notification from a rewardgift user notice.
   * @param  tags - The notice tags.
   * @return The new notice.
   */
  public static fromRewardGift(tags: Record<string, string>) {
    const total = tags['msg-param-selected-count']

    return new Notification(`A cheer shared rewards to ${total} others in chat!`, NotificationEvent.AnonGiftPaidUpgrade)
  }

  /**
   * Creates a new notification from a bitsbadgetier user notice.
   * @param  tags - The notice tags.
   * @return The new notice.
   */
  public static fromBitsBadgeTier(tags: Record<string, string>) {
    const username = tags['display-name'] || tags.login
    const badge = parseInt(tags['msg-param-threshold'], 10)

    return new Notification(
      _.isNaN(badge)
        ? `${username} just earned a new Bits badge!`
        : `${username} just earned a new ${badge.toLocaleString()} Bits badge!`,
      NotificationEvent.BitsBadgeTier
    )
  }

  /**
   * Creates a new notification from a extendsub user notice.
   * @param  tags - The notice tags.
   * @return The new notice.
   */
  public static fromExtendedSub(tags: Record<string, string>) {
    const username = tags['display-name'] || tags.login
    const endMonthIndex = tags['msg-param-sub-benefit-end-month']
    const endMonth = getMonthFromIndex(parseInt(endMonthIndex, 10))
    const plan = _.get(tags, 'msg-param-sub-plan', '')

    let tier = 1

    if (plan === '2000') {
      tier = 2
    } else if (plan === '3000') {
      tier = 3
    }

    return new Notification(
      `${username} extended their Tier ${tier} subscription through ${endMonth}!`,
      NotificationEvent.ExtendedSub
    )
  }

  /**
   * Returns the notification title for mystery gifts.
   * @param  tags - The notice tags.
   * @param  anonymous - `true` when the gift is anonymous.
   * @return The notification title.
   */
  private static getMysteryGiftNotificationTitle(tags: Record<string, string>, anonymous: boolean) {
    const username = anonymous ? 'An anonymous gifter' : tags['display-name'] || tags.login
    const total = parseInt(tags['msg-param-mass-gift-count'], 10)

    return !_.isNaN(total)
      ? `${username} is giving out ${total} sub ${pluralize('gift', total)}!`
      : `${username} is giving out a sub gift!`
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
    this.id = nanoid()
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
 * Serialized notification.
 */
export type SerializedNotification = {
  id: string
  event: NotificationEvent
  type: LogType
  title: string
  message?: string
}
