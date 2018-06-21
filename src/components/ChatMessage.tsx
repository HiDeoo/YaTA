import * as React from 'react'
import styled from 'styled-components'

import { SerializedChat } from 'Libs/Chat'

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

    return <Wrapper style={style}>{message.message}</Wrapper>
  }
}

/**
 * React Props.
 */
type Props = {
  message: SerializedChat
  style: React.CSSProperties
}
