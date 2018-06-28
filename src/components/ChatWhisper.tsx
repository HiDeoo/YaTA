import { Icon } from '@blueprintjs/core'
import * as React from 'react'
import styled from 'styled-components'

import { SerializedMessage } from 'Libs/Message'
import { withSCProps } from 'Utils/react'
import { color, size } from 'Utils/styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  background-color: ${color('whisper.background')};
  border-left: 3px solid ${color('whisper.border')};
  padding: 2px ${size('log.hPadding')}px 2px calc(${size('log.hPadding')}px - 1px);
`

/**
 * InboxIcon component.
 */
const InboxIcon = styled(Icon)`
  color: ${color('whisper.border')};
  margin-right: 10px;
  margin-top: 3px;
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
 * ChatWhisper Component.
 */
export default class ChatWhisper extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { style, whisper } = this.props

    const usernameColor = whisper.user.color as string

    return (
      <Wrapper style={style}>
        <InboxIcon icon="inbox" />
        <Username color={usernameColor}>{whisper.user.displayName}</Username>
        {this.renderMessage()}
      </Wrapper>
    )
  }

  /**
   * Renders a message by directly setting HTML from React.
   * @return Element to render.
   */
  private renderMessage() {
    const { whisper } = this.props

    return <span dangerouslySetInnerHTML={{ __html: whisper.message }} />
  }
}

/**
 * React Props.
 */
type Props = {
  whisper: SerializedMessage
  style: React.CSSProperties
}

/**
 * React Props.
 */
type UsernameProps = {
  color: string
}
