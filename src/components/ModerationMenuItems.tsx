import { Icon, Menu } from '@blueprintjs/core'
import _ from 'lodash'
import pluralize from 'pluralize'
import * as React from 'react'

import { SerializedRoomState } from 'libs/RoomState'

/**
 * Supported slow mode durations.
 */
const SlowModeDurations: SlowModeDuration[] = [3, 5, 10, 20, 30, 60, 120]

/**
 * ModerationMenuItems Component.
 */
export default class ModerationMenuItems extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { clearChat, isMod, roomState, toggleR9k, toggleFollowersOnly, toggleSubsOnly, toggleEmoteOnly } = this.props

    if (_.isNil(roomState) || !isMod) {
      return null
    }

    return (
      <>
        <Menu.Divider title="Mode" />
        <Menu.Item
          icon={this.getStateMenuIcon('r9k')}
          text="Unique chat"
          labelElement={<Icon icon="multi-select" />}
          onClick={toggleR9k}
        />
        <Menu.Item icon={this.getStateMenuIcon('slow')} text="Slow mode" onClick={this.toggleSlowMode}>
          <Menu.Divider
            title={
              <>
                <Icon icon="outdated" /> &nbsp;Slow mode
              </>
            }
          />
          {_.map(SlowModeDurations, (slowModeDuration) => (
            <Menu.Item
              onClick={(event: React.MouseEvent) => this.toggleSlowMode(event, slowModeDuration)}
              text={`${slowModeDuration} ${pluralize('second', slowModeDuration)}`}
              icon={this.getSlowModeMenuIcon(slowModeDuration)}
              key={slowModeDuration}
            />
          ))}
        </Menu.Item>
        <Menu.Item
          icon={this.getStateMenuIcon('followersOnly')}
          text="Follower-only"
          labelElement={<Icon icon="follower" />}
          onClick={toggleFollowersOnly}
        />
        <Menu.Item
          icon={this.getStateMenuIcon('subsOnly')}
          text="Subscribers-only"
          labelElement={<Icon icon="dollar" />}
          onClick={toggleSubsOnly}
        />
        <Menu.Item
          icon={this.getStateMenuIcon('emoteOnly')}
          text="Emote-only"
          labelElement={<Icon icon="media" />}
          onClick={toggleEmoteOnly}
        />
        <Menu.Divider title="Moderation" />
        <Menu.Item icon="eraser" text="Clear chat" onClick={clearChat} />
      </>
    )
  }

  /**
   * Toggles the slow mode.
   * @param event - The associated event.
   * @param duration - The optional
   */
  private toggleSlowMode = (_event: React.MouseEvent, duration?: SlowModeDuration) => {
    this.props.toggleSlowMode(duration)
  }

  /**
   * Returns the menu icon for a specicic room state key.
   * @param  key - The key.
   * @return The icon name.
   */
  private getStateMenuIcon(key: keyof SerializedRoomState) {
    return _.get(this.props.roomState, key, false) ? 'tick' : 'blank'
  }

  /**
   * Returns the menu icon for a specicic slow mode duration.
   * @param  slowDuration - The slow duration.
   * @return The icon name.
   */
  private getSlowModeMenuIcon(slowDuration: SlowModeDuration) {
    return _.get(this.props.roomState, 'slowDuration', 0) === slowDuration ? 'tick' : 'blank'
  }
}

/**
 * React Props.
 */
interface Props {
  clearChat: () => void
  isMod: boolean
  roomState: SerializedRoomState | null
  toggleR9k: () => void
  toggleSlowMode: (duration?: SlowModeDuration) => void
  toggleFollowersOnly: () => void
  toggleSubsOnly: () => void
  toggleEmoteOnly: () => void
}

/**
 * All supported slow mode durations.
 */
export type SlowModeDuration = 3 | 5 | 10 | 20 | 30 | 60 | 120
