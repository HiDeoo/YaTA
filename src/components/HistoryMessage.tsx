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
 * HistoryMessage Component.
 */
export default class HistoryMessage extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { message, style } = this.props

    return (
      <Wrapper style={style} onDoubleClick={this.onDoubleClick}>
        <Time>{message.time}</Time>
        <MessageContent message={message} />
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
  style: React.CSSProperties
}
