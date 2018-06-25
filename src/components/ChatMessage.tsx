import * as _ from 'lodash'
import * as React from 'react'
import styled from 'styled-components'

import { SerializedMessage } from 'Libs/Message'
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
  padding-right: 6px;
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
  font-weight: bold;
  padding-right: 6px;
`

/**
 * Message component.
 */
const Message = styled.span`
  .emote {
    display: inline-block;
    margin: -0.5rem 0;
    vertical-align: middle;
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
      <Wrapper style={style}>
        <Time>{message.time}</Time>
        {this.renderBadges()}
        <Username color={usernameColor}>{message.user.displayName}</Username>
        {this.renderMessage()}
      </Wrapper>
    )
  }

  /**
   * Renders a message by directly setting HTML from React.
   * @return Element to render.
   */
  private renderMessage() {
    const { message } = this.props.message

    return <Message dangerouslySetInnerHTML={{ __html: message }} />
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
}

/**
 * React Props.
 */
type Props = {
  message: SerializedMessage
  style: React.CSSProperties
}

/**
 * React Props.
 */
type UsernameProps = {
  color: string
}
