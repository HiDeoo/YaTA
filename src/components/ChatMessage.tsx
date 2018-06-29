import * as _ from 'lodash'
import * as React from 'react'
import styled from 'styled-components'

import LogType from 'Constants/logType'
import { SerializedChatter } from 'Libs/Chatter'
import { SerializedMessage } from 'Libs/Message'
import { replaceImgTagByAlt } from 'Utils/html'
import { withSCProps } from 'Utils/react'
import { color, size } from 'Utils/styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  padding: 4px ${size('log.hPadding')}px;
`

/**
 * Time component.
 */
const Time = styled.span`
  color: ${color('message.time.color')};
  font-size: 0.77rem;
  padding-right: 2px;
`

/**
 * Badges component.
 */
const Badges = styled.span`
  .badge {
    display: inline-block;
    padding-right: 4px;
    vertical-align: middle;

    &:last-of-type {
      padding-right: 6px;
    }
  }
`

/**
 * Username component.
 */
const Username = withSCProps<UsernameProps, HTMLSpanElement>(styled.span)`
  color: ${(props) => props.color};
  cursor: pointer;
  font-weight: bold;
  padding-right: 2px;
`

/**
 * Message component.
 */
const Message = withSCProps<MessageProps, HTMLSpanElement>(styled.span)`
  color: ${(props) => props.color};

  .emote {
    display: inline-block;
    margin: -0.5rem 0;
    vertical-align: middle;
    width: 28px;
  }
`

/**
 * ChatMessage Component.
 */
export default class ChatMessage extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { message, style } = this.props

    const usernameColor = message.user.color as string

    return (
      <Wrapper style={style} onDoubleClick={this.onMessageDoubleClick}>
        <Time>{message.time} </Time>
        {this.renderBadges()}
        <Username color={usernameColor} onClick={this.onClickUsername}>
          {message.user.displayName}
        </Username>{' '}
        {this.renderMessage()}
      </Wrapper>
    )
  }

  /**
   * Renders a message by directly setting HTML from React.
   * @return Element to render.
   */
  private renderMessage() {
    const { message } = this.props

    const isAction = message.type === LogType.Action
    const messageColor = isAction && !_.isNil(message.user.color) ? message.user.color : 'inherit'

    return <Message color={messageColor} dangerouslySetInnerHTML={{ __html: message.message }} />
  }

  /**
   * Renders badges by directly setting HTML from React.
   * @return The HTML content to render.
   */
  private renderBadges() {
    const { badges } = this.props.message

    if (_.isNil(badges)) {
      return null
    }

    return <Badges dangerouslySetInnerHTML={{ __html: badges }} />
  }

  /**
   * Triggered when a username is clicked and we should show details for him.
   */
  private onClickUsername = () => {
    const { focusChatter, message } = this.props

    focusChatter(message.user)
  }

  /**
   * Triggered when the message is double clicked.
   */
  private onMessageDoubleClick = () => {
    const { message } = this.props

    this.props.copyMessage(`[${message.time}] ${message.user.displayName}: ${replaceImgTagByAlt(message.message)}`)
  }
}

/**
 * React Props.
 */
type Props = {
  copyMessage: (message: string) => void
  focusChatter: (chatter: SerializedChatter) => void
  message: SerializedMessage
  style: React.CSSProperties
}

/**
 * React Props.
 */
type UsernameProps = {
  color: string
}

/**
 * React Props.
 */
type MessageProps = {
  color: string
}
