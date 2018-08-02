import { Button, Classes, Colors, Intent, Menu, Popover } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import styled from 'styled-components'

import MessageContent from 'Components/MessageContent'
import Preview from 'Components/Preview'
import ActionMenuItems from 'Containers/ActionMenuItems'
import { ActionHandler } from 'Libs/Action'
import { SerializedChatter } from 'Libs/Chatter'
import { SerializedMessage } from 'Libs/Message'
import { color, ifProp, size } from 'Utils/styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div<WrapperProps>`
  background-color: ${ifProp(
    'highlighted',
    color('log.permanent.background'),
    ifProp('mentionned', color('log.mention.self.background'), 'inherit')
  )};
  border-left: 3px solid
    ${ifProp(
      'highlighted',
      color('log.permanent.border'),
      ifProp('mentionned', color('log.mention.self.color'), 'transparent')
    )};
  opacity: ${ifProp('purged', 0.5, 1.0)};
  padding: 4px ${size('log.hPadding')} 1px 7px;
  white-space: pre-wrap;
`

/**
 * MenuButton component.
 */
const MenuButton = styled(Button)`
  &.${Classes.BUTTON}.${Classes.MINIMAL}, .${Classes.DARK} &.${Classes.BUTTON}.${Classes.MINIMAL} {
    height: 16px;
    min-height: 16px;
    min-width: 24px;
    padding: 0;
    position: relative;
    vertical-align: top;
    width: 24px;

    & > svg {
      color: ${Colors.GRAY2};
      position: absolute;
      left: 7px;
      top: 3px;
    }

    &:active,
    &:hover,
    &.${Classes.ACTIVE} {
      background: initial;

      & > svg {
        color: ${Colors.LIGHT_GRAY1};
      }
    }
  }
`

/**
 * ContextMenu component.
 */
const ContextMenu = styled(Menu)`
  & .${Classes.MENU_ITEM}.${Classes.DISABLED} {
    cursor: auto !important;
  }
`

/**
 * Time component.
 */
const Time = styled.span`
  color: ${color('message.time.color')};
  display: inline-block;
  font-size: 0.77rem;
  min-width: 42px;
`

/**
 * Badges component.
 */
const Badges = styled.span`
  .badge {
    border-radius: 2px;
    display: inline-block;
    margin-top: -1px;
    min-width: 18px;
    margin-right: 4px;
    vertical-align: middle;

    &:last-of-type {
      margin-right: 6px;
    }
  }
`

/**
 * Name component.
 */
const Name = styled.span<NameProps>`
  color: ${(props) => props.color};
  cursor: pointer;
  font-weight: bold;
  padding-right: 2px;
`

/**
 * Username component.
 */
const Username = styled.span`
  font-size: 0.8rem;
  font-weight: normal;
`

/**
 * React State.
 */
const initialState = { isContextMenuOpened: false }
type State = Readonly<typeof initialState>

/**
 * Message Component.
 */
export default class Message extends React.Component<Props, State> {
  public state: State = initialState

  /**
   * Lifecycle: shouldComponentUpdate.
   * @param  nextProps - The next props.
   * @param  nextState - The next state.
   * @return A boolean to indicate if the component should update on state or props change.
   */
  public shouldComponentUpdate(nextProps: Props, nextState: State) {
    const { isContextMenuOpened } = this.state
    const { isContextMenuOpened: nextIsContextMenuOpened } = nextState

    const { message, showUnbanContextMenuItem, style } = this.props
    const { message: nextMessage, showUnbanContextMenuItem: prevShowUnbanContextMenuItem, style: nextStyle } = nextProps

    return (
      isContextMenuOpened !== nextIsContextMenuOpened ||
      message.id !== nextMessage.id ||
      message.purged !== nextMessage.purged ||
      showUnbanContextMenuItem !== prevShowUnbanContextMenuItem ||
      !_.isEqual(style, nextStyle)
    )
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { message, style } = this.props

    const usernameColor = message.user.color as string

    return (
      <Wrapper
        onDoubleClick={this.onDoubleClick}
        highlighted={message.highlighted}
        mentionned={message.mentionned}
        purged={message.purged}
        style={style}
      >
        {this.renderContextMenu()}
        <Time>{message.time} </Time>
        {this.renderBadges()}
        <Name color={usernameColor} onClick={this.onClickUsername}>
          {message.user.displayName}
          {message.user.showUserName && <Username> ({message.user.userName})</Username>}
        </Name>{' '}
        <MessageContent message={message} />
        {'\n'}
        {this.renderPreviews()}
      </Wrapper>
    )
  }

  /**
   * Renders the previews if necessary.
   * @return Element to render.
   */
  private renderPreviews() {
    const { message } = this.props

    if (_.size(message.previews) <= 0) {
      return null
    }

    return _.map(message.previews, (preview) => {
      return <Preview key={preview.id} preview={preview} />
    })
  }

  /**
   * Renders the context menu when enabled.
   * @return Element to render.
   */
  private renderContextMenu() {
    const { actionHandler, canModerate, message, showContextMenu, showUnbanContextMenuItem } = this.props

    if (!showContextMenu) {
      return null
    }

    const menu = (
      <ContextMenu>
        <Menu.Divider
          title={`${message.user.displayName}${message.user.showUserName ? ` (${message.user.userName})` : ''}`}
        />
        <Menu.Item text="" disabled />
        {!message.user.isSelf && (
          <>
            <Menu.Item icon="envelope" text="Whisper" onClick={this.onClickWhisper} />
            <Menu.Divider />
          </>
        )}
        <Menu.Item icon="clipboard" text="Copy message" onClick={this.copyMessage} />
        <Menu.Item icon="clipboard" text="Copy username" onClick={this.onCopyUsername} />
        <ActionMenuItems startDivider actionHandler={actionHandler} chatter={message.user} />
        {canModerate(message.user) && (
          <>
            <Menu.Divider />
            <Menu.Item icon="trash" text="Purge" onClick={this.onClickPurge} />
            <Menu.Item icon="time" text="Timeout">
              <Menu.Item text="10m" onClick={this.onClickTimeout10M} />
              <Menu.Item text="1h" onClick={this.onClickTimeout1H} />
              <Menu.Item text="6h" onClick={this.onClickTimeout6H} />
              <Menu.Item text="24h" onClick={this.onClickTimeout24H} />
            </Menu.Item>
            <Menu.Item icon="disable" text="Ban" intent={Intent.DANGER} onClick={this.onClickBan} />
            {showUnbanContextMenuItem && (
              <Menu.Item icon="unlock" text="Unban" intent={Intent.DANGER} onClick={this.onClickUnban} />
            )}
          </>
        )}
      </ContextMenu>
    )

    return (
      <Popover content={menu} onInteraction={this.onToggleContextMenu} isOpen={this.state.isContextMenuOpened}>
        <MenuButton icon="menu" minimal />
      </Popover>
    )
  }

  /**
   * Renders badges by directly setting HTML from React.
   * @return The HTML content to render.
   */
  private renderBadges() {
    const { badges } = this.props.message

    if (_.isNil(badges)) {
      return null
    }

    return <Badges dangerouslySetInnerHTML={{ __html: badges }} />
  }

  /**
   * Triggered when interacting with the context menu.
   * @param nextOpenState - `true` when opening.
   */
  private onToggleContextMenu = (nextOpenState: boolean) => {
    const { isContextMenuOpened } = this.state

    this.setState(() => ({ isContextMenuOpened: nextOpenState }))

    if (isContextMenuOpened !== nextOpenState) {
      this.props.onToggleContextMenu(nextOpenState)
    }
  }

  /**
   * Triggered when a message is double clicked.
   */
  private onDoubleClick = () => {
    const { copyMessageOnDoubleClick, copyMessageToClipboard, message } = this.props

    if (copyMessageOnDoubleClick) {
      copyMessageToClipboard(message)
    }
  }

  /**
   * Triggered when a username is clicked and we should show details for him.
   */
  private onClickUsername = () => {
    const { focusChatter, message } = this.props

    focusChatter(message.user)
  }

  /**
   * Copy the message to the clipboard.
   */
  private copyMessage = () => {
    const { copyMessageToClipboard, message } = this.props

    copyMessageToClipboard(message)
  }

  /**
   * Copy the username to the clipboard.
   */
  private onCopyUsername = () => {
    const { message } = this.props

    this.props.copyToClipboard(message.user.displayName)
  }

  /**
   * Triggered when purge menu item is clicked.
   */
  private onClickPurge = () => {
    this.timeout(1)
  }

  /**
   * Triggered when 10 minutes timeout menu item is clicked.
   */
  private onClickTimeout10M = () => {
    this.timeout(600)
  }

  /**
   * Triggered when 1 hour timeout menu item is clicked.
   */
  private onClickTimeout1H = () => {
    this.timeout(3600)
  }

  /**
   * Triggered when 6 hours timeout menu item is clicked.
   */
  private onClickTimeout6H = () => {
    this.timeout(21600)
  }

  /**
   * Triggered when 24 hours timeout menu item is clicked.
   */
  private onClickTimeout24H = () => {
    this.timeout(86400)
  }

  /**
   * Timeouts a user.
   * @param duration - The duration of the timeout in seconds.
   */
  private timeout(duration: number) {
    const { message, timeout } = this.props

    timeout(message.user.userName, duration)
  }

  /**
   * Triggered when the ban menu item is clicked.
   */
  private onClickBan = () => {
    const { ban, message } = this.props

    ban(message.user.userName)
  }

  /**
   * Triggered when the unban menu item is clicked.
   */
  private onClickUnban = () => {
    const { message, unban } = this.props

    unban(message.user.userName)
  }

  /**
   * Triggered when the whisper menu item is clicked.
   */
  private onClickWhisper = () => {
    const { whisper, message } = this.props

    whisper(message.user.userName)
  }
}

/**
 * React Props.
 */
type Props = {
  actionHandler: ActionHandler
  ban: (username: string) => void
  canModerate: (chatter: SerializedChatter) => boolean
  copyMessageOnDoubleClick: boolean
  copyMessageToClipboard: (message: SerializedMessage) => void
  copyToClipboard: (message: string) => void
  focusChatter: (chatter: SerializedChatter) => void
  message: SerializedMessage
  onToggleContextMenu: (open: boolean) => void
  showContextMenu: boolean
  showUnbanContextMenuItem: boolean
  style: React.CSSProperties
  timeout: (username: string, duration: number) => void
  unban: (username: string) => void
  whisper: (username: string) => void
}

/**
 * React Props.
 */
type WrapperProps = {
  highlighted: boolean
  mentionned: boolean
  purged: boolean
}

/**
 * React Props.
 */
type NameProps = {
  color: string
}
