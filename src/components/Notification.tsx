import * as _ from 'lodash'
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
  padding: 4px ${size('log.hPadding')}px 4px calc(${size('log.hPadding')}px - 1px);
`

/**
 * Message component.
 */
const Message = styled.div`
  font-style: italic;
  margin-top: 4px;
`

/**
 * Notification Component.
 */
export default class Notification extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { notification, style } = this.props

    return (
      <Wrapper style={style}>
        <div>{notification.title}</div>
        {!_.isNil(notification.message) && <Message>“{notification.message}”</Message>}
      </Wrapper>
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
