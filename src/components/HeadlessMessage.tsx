import * as _ from 'lodash'
import * as React from 'react'
import styled from 'styled-components'

import MessageContent from 'Components/MessageContent'
import { SerializedMessage } from 'Libs/Message'
import { color, size } from 'Utils/styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  min-height: ${size('log.minHeight')};
  padding: 4px 8px;
  white-space: pre-wrap;
`

/**
 * Time component.
 */
const Time = styled.span`
  color: ${color('message.time.color')};
  font-size: 0.77rem;
  padding-right: 6px;
`

/**
 * Name component.
 */
const Name = styled.span<NameProps>`
  color: ${(props) => props.color};
  font-weight: bold;
  padding-right: 2px;
`

/**
 * Username component.
 */
const Username = styled.span`
  font-size: 0.8rem;
  font-weight: normal;
`

/**
 * HeadlessMessage Component.
 */
export default class HeadlessMessage extends React.Component<Props> {
  /**
   * React Default Props.
   */
  public static defaultProps = {
    showUsername: false,
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { message, style } = this.props

    const showUsername = _.get(this.props, 'showUsername', false)
    const usernameColor = message.user.color as string

    return (
      <Wrapper style={style} onDoubleClick={this.onDoubleClick}>
        <Time>{message.time}</Time>
        {showUsername && (
          <>
            {' '}
            <Name color={usernameColor}>
              {message.user.displayName}
              {message.user.showUserName && <Username> ({message.user.userName})</Username>}
            </Name>
          </>
        )}{' '}
        <MessageContent message={message} />
        {'\n'}
      </Wrapper>
    )
  }

  /**
   * Triggered when a message is double clicked.
   */
  private onDoubleClick = () => {
    const { message, onDoubleClick } = this.props

    onDoubleClick(message)
  }
}

/**
 * React Props.
 */
type Props = {
  message: SerializedMessage
  onDoubleClick: (message: SerializedMessage) => void
  showUsername: boolean
  style: React.CSSProperties
}

/**
 * React Props.
 */
type NameProps = {
  color: string
}
