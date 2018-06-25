import * as React from 'react'
import styled from 'styled-components'

import { SerializedNotification } from 'Libs/Notification'
import { color, size } from 'Utils/styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  background-color: ${color('notification.background')};
  border-left: 3px solid ${color('notification.border')};
  padding: 2px ${size('log.hPadding')}px 2px calc(${size('log.hPadding')}px - 1px);
`

/**
 * ChatNotification Component.
 */
export default class ChatNotification extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { notification, style } = this.props

    return <Wrapper style={style}>{notification.title}</Wrapper>
  }
}

/**
 * React Props.
 */
type Props = {
  notification: SerializedNotification
  style: React.CSSProperties
}
