import * as React from 'react'
import styled from 'styled-components'

import { SerializedNotice } from 'Libs/Notice'

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
    const { notice, style } = this.props

    return <Wrapper style={style}>{notice.message}</Wrapper>
  }
}

/**
 * React Props.
 */
type Props = {
  notice: SerializedNotice
  style: React.CSSProperties
}
