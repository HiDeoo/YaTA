import { Colors } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'

import { SerializedMarker } from 'store/ducks/logs'
import styled, { size, theme } from 'styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  background-color: ${theme('notification.background')};
  border-left: 3px solid ${Colors.RED4};
  border-right: 3px solid ${Colors.RED4};
  padding: 5px ${size('log.hPadding')} 0 ${size('log.hPadding')};
  text-align: center;
  white-space: pre-wrap;
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

    return (
      <Wrapper style={style}>
        {marker.time}
        {'\n'}
      </Wrapper>
    )
  }
}

/**
 * React Props.
 */
interface Props {
  marker: SerializedMarker
  style: React.CSSProperties
}
