import * as _ from 'lodash'
import * as React from 'react'

import notificationBorder from 'Images/notificationBorder.png'
import { NotificationEvent, SerializedNotification } from 'Libs/Notification'
import styled, { ifProp, size, theme } from 'Styled'

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
        {!_.isNil(notification.message) && <Message>“{notification.message}”</Message>}
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
      event === NotificationEvent.PrimePaidUpgrade
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
