import * as _ from 'lodash'
import * as React from 'react'
import styled from 'styled-components'

import { SerializedNotice } from 'Libs/Notice'
import { color, size } from 'Utils/styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  color: ${color('notice.color')};
  padding: 5px ${size('log.hPadding')} 0 ${size('log.hPadding')};
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

    return <Wrapper style={style} dangerouslySetInnerHTML={{ __html: notice.message }} />
  }
}

/**
 * React Props.
 */
type Props = {
  notice: SerializedNotice
  style: React.CSSProperties
}
