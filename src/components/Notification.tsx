import _ from 'lodash'
import * as React from 'react'

import notificationBorder from 'images/notificationBorder.png'
import { NotificationEvent, SerializedNotification } from 'libs/Notification'
import styled, { ifProp, size, theme } from 'styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div<WrapperProps>`
  background-color: ${theme('notification.background')};
  border-color: ${ifProp('highlight', 'initial', theme('notification.border'))};
  border-image-repeat: repeat;
  border-image-slice: 1 30;
  border-image-source: ${ifProp('highlight', `url(${notificationBorder})`, 'initial')};
  border-style: solid;
  border-width: 0 0 0 3px;
  padding: 4px ${size('log.hPadding')} 4px ${size('log.hPadding', -1)};
  position: relative;
`

/**
 * Message component.
 */
const Message = styled.div`
  color: ${theme('notification.message')};
  font-style: italic;
  margin-top: 4px;

  .emoteWrapper {
    display: inline-block;
    min-height: 28px;
    min-width: 28px;
    text-align: center;
  }

  .emote {
    display: inline-block;
    margin-top: -3px;
    vertical-align: middle;
  }

  img:-moz-loading,
  img:-moz-broken {
    height: 28px;
    width: 28px;
    overflow-x: hidden;
  }
`

/**
 * Notification Component.
 */
export default class Notification extends React.Component<Props> {
  /**
   * Lifecycle: shouldComponentUpdate.
   * @param  nextProps - The next props.
   * @return A boolean to indicate if the component should update on state or props change.
   */
  public shouldComponentUpdate(nextProps: Props) {
    const { notification, style } = this.props
    const { notification: nextNotification, style: nextStyle } = nextProps

    return notification.id !== nextNotification.id || !_.isEqual(style, nextStyle)
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { notification, style } = this.props

    return (
      <Wrapper style={style} highlight={this.shouldHighlightNotification()}>
        <div>{notification.title}</div>
        {!_.isNil(notification.message) && (
          <Message dangerouslySetInnerHTML={{ __html: `“${notification.message}”` }} />
        )}
      </Wrapper>
    )
  }

  /**
   * Defines which notification event should be highlighted.
   * @return `true` to highlight.
   */
  private shouldHighlightNotification() {
    const { event } = this.props.notification

    return (
      event === NotificationEvent.Subscription ||
      event === NotificationEvent.ReSub ||
      event === NotificationEvent.SubGift ||
      event === NotificationEvent.SubMysteryGift ||
      event === NotificationEvent.AnonSubGift ||
      event === NotificationEvent.AnonSubMysteryGift ||
      event === NotificationEvent.GiftPaidUpgrade ||
      event === NotificationEvent.AnonGiftPaidUpgrade ||
      event === NotificationEvent.PrimePaidUpgrade ||
      event === NotificationEvent.RewardGift ||
      event === NotificationEvent.BitsBadgeTier
    )
  }
}

/**
 * React Props.
 */
interface Props {
  notification: SerializedNotification
  style: React.CSSProperties
}

/**
 * React Props.
 */
interface WrapperProps {
  highlight: boolean
}
