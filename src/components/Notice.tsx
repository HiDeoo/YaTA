import * as _ from 'lodash'
import * as React from 'react'

import { SerializedNotice } from 'Libs/Notice'
import styled, { size, theme } from 'Styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  color: ${theme('notice.color')};
  padding: 5px ${size('log.hPadding')} 0 ${size('log.hPadding')};
  white-space: pre-wrap;
`

/**
 * Notice Component.
 */
export default class Notice extends React.Component<Props> {
  /**
   * Lifecycle: shouldComponentUpdate.
   * @param  nextProps - The next props.
   * @return A boolean to indicate if the component should update on state or props change.
   */
  public shouldComponentUpdate(nextProps: Props) {
    const { notice, style } = this.props
    const { notice: nextNotice, style: nextStyle } = nextProps

    return notice.id !== nextNotice.id || !_.isEqual(style, nextStyle)
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { notice, style } = this.props

    return (
      <Wrapper style={style}>
        <div dangerouslySetInnerHTML={{ __html: notice.message }} />
      </Wrapper>
    )
  }
}

/**
 * React Props.
 */
interface Props {
  notice: SerializedNotice
  style: React.CSSProperties
}
