import { Button, Icon, Menu, Popover, Position } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'

import HeaderTooltip from 'Components/HeaderTooltip'
import { SerializedRoomState } from 'Libs/RoomState'

/**
 * HeaderModerationTools Component.
 */
export default class HeaderModerationTools extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    return (
      <Popover content={this.renderMenu()} position={Position.BOTTOM}>
        <HeaderTooltip content="Moderation Tools">
          <Button icon="wrench" minimal />
        </HeaderTooltip>
      </Popover>
    )
  }

  /**
   * Renders the menu.
   * @return Element to render.
   */
  private renderMenu() {
    const { clearChat, toggleR9k, toggleSlowMode, toggleFollowersOnly, toggleSubsOnly, toggleEmoteOnly } = this.props

    return (
      <Menu>
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
        <Menu.Divider title="Tools" />
        <Menu.Item icon="eraser" text="Clear chat" onClick={clearChat} />
      </Menu>
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
  roomState: SerializedRoomState
  toggleR9k: () => void
  toggleSlowMode: () => void
  toggleFollowersOnly: () => void
  toggleSubsOnly: () => void
  toggleEmoteOnly: () => void
}
