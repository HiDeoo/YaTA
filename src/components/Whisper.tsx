import { Icon } from '@blueprintjs/core'
import * as _ from 'lodash'
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
  padding: 4px ${size('log.hPadding')} 4px calc(${size('log.hPadding')} - 1px);
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
   * Lifecycle: shouldComponentUpdate.
   * @param  nextProps - The next props.
   * @return A boolean to indicate if the component should update on state or props change.
   */
  public shouldComponentUpdate(nextProps: Props) {
    const { whisper, style } = this.props
    const { whisper: nextWhisper, style: nextStyle } = nextProps

    return whisper.id !== nextWhisper.id || !_.isEqual(style, nextStyle)
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { style, whisper } = this.props

    const usernameColor = whisper.user.color as string

    return (
      <Wrapper style={style} onDoubleClick={this.onDoubleClick}>
        <InboxIcon
          icon={whisper.self ? 'document-share' : 'document-open'}
          title={whisper.self ? 'Whisper sent' : 'Whisper received'}
        />
        <Username color={whisper.self ? 'inherit' : usernameColor}>{whisper.user.displayName}</Username>
        <MessageContent message={whisper} />
      </Wrapper>
    )
  }

  /**
   * Triggered when a message is double clicked.
   */
  private onDoubleClick = () => {
    const { copyMessageOnDoubleClick, copyMessageToClipboard, whisper } = this.props

    if (copyMessageOnDoubleClick) {
      copyMessageToClipboard(whisper)
    }
  }
}

/**
 * React Props.
 */
type Props = {
  copyMessageOnDoubleClick: boolean
  copyMessageToClipboard: (message: SerializedMessage) => void
  style: React.CSSProperties
  whisper: SerializedMessage
}

/**
 * React Props.
 */
type UsernameProps = {
  color: string
}
