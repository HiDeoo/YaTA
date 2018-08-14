import * as _ from 'lodash'
import * as React from 'react'
import styled from 'styled-components'

import notificationBorder from 'Images/notificationBorder.png'
import { NotificationEvent, SerializedNotification } from 'Libs/Notification'
import { color, ifProp, size } from 'Utils/styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div<WrapperProps>`
  background-color: ${color('notification.background')};
  border-color: ${ifProp('highlight', 'initial', color('notification.border'))};
  border-image-repeat: repeat;
  border-image-slice: 1 30;
  border-image-source: ${ifProp('highlight', `url(${notificationBorder})`, 'initial')};
  border-style: solid;
  border-width: 0 0 0 3px;
  padding: 4px ${size('log.hPadding')} 4px calc(${size('log.hPadding')} - 1px);
  position: relative;
`

/**
 * Message component.
 */
const Message = styled.div`
  color: ${color('notification.message')};
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
      event === NotificationEvent.SubGift
    )
  }
}

/**
 * React Props.
 */
type Props = {
  notification: SerializedNotification
  style: React.CSSProperties
}

/**
 * React Props.
 */
type WrapperProps = {
  highlight: boolean
}
