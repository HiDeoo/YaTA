import { Button, Colors, Icon, NavbarDivider } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import styled from 'styled-components'

import HeaderTooltip from 'Components/HeaderTooltip'
import { SerializedRoomState } from 'Libs/RoomState'
import { withSCProps } from 'Utils/react'
import { ifProp, size } from 'Utils/styled'

/**
 * TwitchState component.
 */
const TwitchState = withSCProps<TwitchStateProps, HTMLDivElement>(styled.div)`
  display: inline-grid;
  grid-auto-flow: column;
  grid-gap: ${size('twitchState.gap')} ${size('twitchState.gap')};
  grid-template-columns: repeat(auto-fill, ${size('twitchState.size')});
  grid-template-rows: repeat(${ifProp('unique', 1, 2)}, ${size('twitchState.size')});
  margin-right: 5px;

  & > span {
    height: ${size('twitchState.size')};
    margin-right: 0;
    width: ${size('twitchState.size')};

    & svg {
      height: ${size('twitchState.size')};
      width: ${size('twitchState.size')};
    }
  }
`

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
 * PauseButton component.
 */
const PauseButton = styled(Button)`
  & > svg.pt-icon {
    color: ${Colors.RED4} !important;
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
    const { isAutoScrollPaused, unpauseAutoScroll, roomState } = this.props

    const r9k = _.get(roomState, 'r9k', false)
    const emoteOnly = _.get(roomState, 'emoteOnly', false)
    const followersOnly = _.get(roomState, 'followersOnly', false)
    const followersOnlyDuration = _.get(roomState, 'followersOnlyDuration', 0) as number
    const slow = _.get(roomState, 'slow', false)
    const slowDuration = _.get(roomState, 'slowDuration', 0) as number
    const subsOnly = _.get(roomState, 'subsOnly', false)

    const showTwitchState = r9k || emoteOnly || followersOnly || slow || subsOnly

    if (!isAutoScrollPaused && !showTwitchState) {
      return null
    }

    const states = [r9k, emoteOnly, followersOnly, slow, subsOnly]

    const visibleStateCount = _.reduce(
      states,
      (count, state) => {
        if (state) {
          count += 1
        }

        return count
      },
      0
    )

    return (
      <>
        {isAutoScrollPaused && (
          <Tooltip content="Auto scrolling disabled">
            <PauseButton icon="pause" minimal onClick={unpauseAutoScroll} />
          </Tooltip>
        )}
        {showTwitchState && (
          <TwitchState unique={visibleStateCount === 1}>
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
          </TwitchState>
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
  unpauseAutoScroll: () => void
}

/**
 * React Props.
 */
type TwitchStateProps = {
  unique: boolean
}
