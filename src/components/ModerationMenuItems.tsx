import { Icon, Menu } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'

import { SerializedRoomState } from 'Libs/RoomState'

/**
 * ModerationMenuItems Component.
 */
export default class ModerationMenuItems extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const {
      clearChat,
      isMod,
      roomState,
      toggleR9k,
      toggleSlowMode,
      toggleFollowersOnly,
      toggleSubsOnly,
      toggleEmoteOnly,
    } = this.props

    if (_.isNil(roomState) || !isMod) {
      return null
    }

    return (
      <>
        <Menu.Divider title="Mode" />
        <Menu.Item
          icon={this.getStateMenuIcon('r9k')}
          text="R9K"
          labelElement={<Icon icon="multi-select" />}
          onClick={toggleR9k}
        />
        <Menu.Item
          icon={this.getStateMenuIcon('slow')}
          text="Slow mode"
          labelElement={<Icon icon="outdated" />}
          onClick={toggleSlowMode}
        />
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
   * Returns the menu icon for a specicic room state key.
   * @param  key - The key.
   * @return The icon name.
   */
  private getStateMenuIcon(key: keyof SerializedRoomState) {
    return _.get(this.props.roomState, key, false) ? 'tick' : 'blank'
  }
}

/**
 * React Props.
 */
type Props = {
  clearChat: () => void
  isMod: boolean
  roomState: SerializedRoomState | null
  toggleR9k: () => void
  toggleSlowMode: () => void
  toggleFollowersOnly: () => void
  toggleSubsOnly: () => void
  toggleEmoteOnly: () => void
}
