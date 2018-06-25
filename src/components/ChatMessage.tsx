import * as React from 'react'
import styled from 'styled-components'

import { SerializedMessage } from 'Libs/Message'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  font-size: 0.88rem;
  padding: 5px 10px;
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

    return (
      <Wrapper style={style}>
        <span dangerouslySetInnerHTML={this.renderMessage()} />
      </Wrapper>
    )
  }

  /**
   * Renders a message by directly setting HTML from React.
   * @return The HTML content to render.
   */
  private renderMessage() {
    const { message } = this.props.message

    return { __html: message }
  }
}

/**
 * React Props.
 */
type Props = {
  message: SerializedMessage
  style: React.CSSProperties
}
