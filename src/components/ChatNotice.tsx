import * as React from 'react'
import styled from 'styled-components'

import { SerializedNotice } from 'Libs/Notice'
import { color, size } from 'Utils/styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  color: ${color('notice.color')};
  padding: 0 ${size('log.hPadding')}px;
`

/**
 * ChatNotice Component.
 */
export default class ChatNotice extends React.Component<Props> {
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
