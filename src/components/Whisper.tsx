import { Icon } from '@blueprintjs/core'
import _ from 'lodash'
import * as React from 'react'

import MessageContent from 'components/MessageContent'
import { WithNameColorProps } from 'libs/Chatter'
import { SerializedMessage } from 'libs/Message'
import styled, { prop, size, theme } from 'styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  background-color: ${theme('whisper.background')};
  border-left: 3px solid ${theme('whisper.border')};
  padding: 4px ${size('log.hPadding')} 4px ${size('log.hPadding', -1)};
  white-space: pre-wrap;
`

/**
 * InboxIcon component.
 */
const InboxIcon = styled(Icon)`
  color: ${theme('whisper.border')};
  margin-right: 10px;
  margin-top: 3px;
`

/**
 * Username component.
 */
const Username = styled.span<WithNameColorProps>`
  color: ${prop('color')};
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
    const { focusEmote, style, whisper } = this.props

    const usernameColor = whisper.user.color as string

    return (
      <Wrapper style={style} onDoubleClick={this.onDoubleClick}>
        <InboxIcon
          icon={whisper.self ? 'document-share' : 'document-open'}
          title={whisper.self ? 'Whisper sent' : 'Whisper received'}
        />
        <Username color={whisper.self ? 'inherit' : usernameColor}>{whisper.user.displayName}</Username>
        <MessageContent message={whisper} focusEmote={focusEmote} withEmoteDetails />
        {'\n'}
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
interface Props {
  copyMessageOnDoubleClick: boolean
  copyMessageToClipboard: (message: SerializedMessage) => void
  focusEmote: (id: string, name: string, provider: string) => void
  style: React.CSSProperties
  whisper: SerializedMessage
}
