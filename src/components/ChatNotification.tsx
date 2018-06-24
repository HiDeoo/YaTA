import * as React from 'react'
import styled from 'styled-components'

import { SerializedNotification } from 'Libs/Notification'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  font-size: 0.88rem;
  padding: 5px 10px;
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
