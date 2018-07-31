import { Colors } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import styled from 'styled-components'

import { SerializedMarker } from 'Store/ducks/logs'
import { color, size } from 'Utils/styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  background-color: ${color('notification.background')};
  border-left: 3px solid ${Colors.RED4};
  border-right: 3px solid ${Colors.RED4};
  padding: 5px ${size('log.hPadding')} 0 ${size('log.hPadding')};
  text-align: center;
`

/**
 * Marker Component.
 */
export default class Marker extends React.Component<Props> {
  /**
   * Lifecycle: shouldComponentUpdate.
   * @param  nextProps - The next props.
   * @return A boolean to indicate if the component should update on state or props change.
   */
  public shouldComponentUpdate(nextProps: Props) {
    const { marker, style } = this.props
    const { marker: nextMarker, style: nextStyle } = nextProps

    return marker.id !== nextMarker.id || !_.isEqual(style, nextStyle)
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { marker, style } = this.props

    return <Wrapper style={style}>{marker.time}</Wrapper>
  }
}

/**
 * React Props.
 */
type Props = {
  marker: SerializedMarker
  style: React.CSSProperties
}
