import { Colors, Icon, NavbarDivider } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import styled from 'styled-components'

import HeaderTooltip from 'Components/HeaderTooltip'
import { SerializedRoomState } from 'Libs/RoomState'

/**
 * Tooltip component.
 */
const Tooltip = styled(HeaderTooltip)`
  margin-right: 10px;

  & + .pt-navbar-divider {
    margin-left: 0;
  }
`

/**
 * HeaderChannelState Component.
 */
export default class HeaderChannelState extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { isAutoScrollPaused, roomState } = this.props

    const r9k = _.get(roomState, 'r9k', false)
    const emoteOnly = _.get(roomState, 'emoteOnly', false)
    const followersOnly = _.get(roomState, 'followersOnly', false)
    const followersOnlyDuration = _.get(roomState, 'followersOnlyDuration', 0) as number
    const slow = _.get(roomState, 'slow', false)
    const slowDuration = _.get(roomState, 'slowDuration', 0) as number
    const subsOnly = _.get(roomState, 'subsOnly', false)

    if (!isAutoScrollPaused && !r9k && !emoteOnly && !followersOnly && !slow && !subsOnly) {
      return null
    }

    return (
      <>
        {isAutoScrollPaused && (
          <Tooltip content="Auto scrolling disabled">
            <Icon icon="pause" color={Colors.RED4} />
          </Tooltip>
        )}
        {subsOnly && (
          <Tooltip content="Subscriber-only">
            <Icon icon="dollar" />
          </Tooltip>
        )}
        {slow && (
          <Tooltip content={`Slow mode (${slowDuration}s)`}>
            <Icon icon="outdated" />
          </Tooltip>
        )}
        {followersOnly && (
          <Tooltip content={`Follower-only${followersOnlyDuration > 0 ? ` (${followersOnlyDuration}m)` : ''}`}>
            <Icon icon="follower" />
          </Tooltip>
        )}
        {emoteOnly && (
          <Tooltip content="Emote-only">
            <Icon icon="media" />
          </Tooltip>
        )}
        {r9k && (
          <Tooltip content="R9K">
            <Icon icon="multi-select" />
          </Tooltip>
        )}
        <NavbarDivider />
      </>
    )
  }
}

/**
 * React Props.
 */
type Props = {
  isAutoScrollPaused: boolean
  roomState: SerializedRoomState | null
}
