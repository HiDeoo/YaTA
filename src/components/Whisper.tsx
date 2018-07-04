import { Icon } from '@blueprintjs/core'
import * as React from 'react'
import styled from 'styled-components'

import MessageContent from 'Components/MessageContent'
import { SerializedMessage } from 'Libs/Message'
import { withSCProps } from 'Utils/react'
import { color, size } from 'Utils/styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  background-color: ${color('whisper.background')};
  border-left: 3px solid ${color('whisper.border')};
  padding: 4px ${size('log.hPadding')}px 4px calc(${size('log.hPadding')}px - 1px);
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
 * Whisper Component.
 */
export default class Whisper extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { style, whisper } = this.props

    const usernameColor = whisper.user.color as string

    return (
      <Wrapper style={style}>
        <InboxIcon icon={whisper.self ? 'document-share' : 'document-open'} />
        <Username color={whisper.self ? 'inherit' : usernameColor}>{whisper.user.displayName}</Username>
        <MessageContent message={whisper} />
      </Wrapper>
    )
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
