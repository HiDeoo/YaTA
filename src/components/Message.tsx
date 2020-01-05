import { Button, Classes, Colors, Intent, Menu, Popover } from '@blueprintjs/core'
import _ from 'lodash'
import * as React from 'react'

import MessageContent from 'components/MessageContent'
import Preview from 'components/Preview'
import ActionMenuItems from 'containers/ActionMenuItems'
import { ActionHandler } from 'libs/Action'
import { SerializedChatter, WithNameColorProps } from 'libs/Chatter'
import { SerializedMessage } from 'libs/Message'
import styled, { ifProp, prop, size, theme } from 'styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div<WrapperProps>`
  background-color: ${ifProp(
    'highlighted',
    theme('log.permanent.background'),
    ifProp('mentioned', theme('log.mention.self.background'), ifProp('alternate', theme('log.alternate'), 'inherit'))
  )};
  border-left: 3px solid
    ${ifProp(
      'highlighted',
      theme('log.permanent.border'),
      ifProp(
        'mentioned',
        theme('log.mention.self.color'),
        ifProp('read', ifProp('twitchHighlighted', theme('twitch.purple'), 'transparent'), Colors.BLUE4)
      )
    )};
  opacity: ${ifProp('purged', 0.5, 1.0)};
  padding: 4px ${size('log.hPadding')} 1px 7px;
  white-space: pre-wrap;

  ${(props) =>
    props.twitchHighlighted &&
    props.increaseTwitchHighlight &&
    `
      background-color: ${theme('twitch.lightPurple')(props)};
      `};
`

/**
 * HistoricalWrapper component.
 */
const HistoricalWrapper = styled.div`
  border-left: 3px solid transparent;
  color: ${theme('message.time.color')};
  font-style: italic;
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

    & svg {
      color: ${Colors.GRAY2};
      position: absolute;
      left: 0;
      top: 3px;
    }

    &:active,
    &:hover,
    &.${Classes.ACTIVE} {
      background: initial;

      & svg {
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
  color: ${theme('message.time.color')};
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
const Name = styled.span<WithNameColorProps>`
  color: ${prop('color')};
  cursor: pointer;
  font-weight: bold;
  padding-right: 2px;
`

/**
 * HistoricalName component.
 */
const HistoricalName = styled.span`
  color: ${theme('message.time.color')};
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

    const { markNewAsUnread, message, showUnbanContextMenuItem, style } = this.props
    const {
      markNewAsUnread: prevMarkNewAsUnread,
      message: nextMessage,
      showUnbanContextMenuItem: prevShowUnbanContextMenuItem,
      style: nextStyle,
    } = nextProps

    return (
      isContextMenuOpened !== nextIsContextMenuOpened ||
      message.id !== nextMessage.id ||
      message.purged !== nextMessage.purged ||
      message.read !== nextMessage.read ||
      showUnbanContextMenuItem !== prevShowUnbanContextMenuItem ||
      markNewAsUnread !== prevMarkNewAsUnread ||
      !_.isEqual(style, nextStyle)
    )
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { focusEmote, increaseTwitchHighlight, markNewAsUnread, message, style, useAlternate } = this.props

    if (message.historical) {
      return this.renderHistoricalMessage()
    }

    const usernameColor = message.user.color as string

    return (
      <Wrapper
        increaseTwitchHighlight={increaseTwitchHighlight}
        twitchHighlighted={message.twitchHighlighted}
        read={!markNewAsUnread || message.read}
        onDoubleClick={this.onDoubleClick}
        highlighted={message.highlighted}
        mentioned={message.mentioned}
        alternate={useAlternate}
        purged={message.purged}
        onClick={this.onClick}
        style={style}
      >
        {this.renderContextMenu()}
        <Time>{message.time} </Time>
        {this.renderBadges()}
        <Name color={usernameColor} onClick={this.onClickUsername}>
          {message.user.displayName}
          {message.user.showUserName && <Username> ({message.user.userName})</Username>}
        </Name>{' '}
        <MessageContent message={message} focusEmote={focusEmote} withEmoteDetails />
        {'\n'}
        {this.renderPreviews()}
      </Wrapper>
    )
  }

  /**
   * Renders an historical message.
   * @return Element to render.
   */
  private renderHistoricalMessage() {
    const { message, style } = this.props

    return (
      <HistoricalWrapper style={style} onDoubleClick={this.onDoubleClick} onClick={this.onClick}>
        <Time>{message.time} </Time>
        <HistoricalName>
          {message.user.displayName}
          {message.user.showUserName && <Username> ({message.user.userName})</Username>}
        </HistoricalName>{' '}
        <MessageContent message={message} />
        {'\n'}
      </HistoricalWrapper>
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

    const isHighlighted =
      message.highlighted ||
      message.mentioned ||
      message.twitchHighlighted ||
      _.includes(message.message, 'class="highlight')

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
        {isHighlighted && (
          <Menu.Item
            text={`Stop highlighting ${message.user.displayName}`}
            onClick={this.onClickStopHighlights}
            icon="delete"
          />
        )}
        <ActionMenuItems startDivider actionHandler={actionHandler} chatter={message.user} />
        {canModerate(message.user) && (
          <>
            <Menu.Divider />
            <Menu.Item icon="remove" text="Delete message" onClick={this.onClickDelete} />
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
   * Triggered when a message is clicked.
   * @param event - The associated event.
   */
  private onClick = (event: React.MouseEvent<HTMLElement>) => {
    const { message, onClick, quoteMessage } = this.props

    onClick(message.id)

    if (event.altKey) {
      quoteMessage(message)
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
   * Triggered when the stop highlights menu item is clicked.
   */
  private onClickStopHighlights = () => {
    const { addHighlightsIgnoredUser, message } = this.props

    addHighlightsIgnoredUser(message.user.userName)
  }

  /**
   * Triggered when the delete message menu item is clicked.
   */
  private onClickDelete = () => {
    const { deleteMessage, message } = this.props

    deleteMessage(message.id)
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
interface Props {
  actionHandler: ActionHandler
  addHighlightsIgnoredUser: (username: string) => void
  ban: (username: string) => void
  canModerate: (chatter: SerializedChatter) => boolean
  copyMessageOnDoubleClick: boolean
  copyMessageToClipboard: (message: SerializedMessage) => void
  copyToClipboard: (message: string) => void
  deleteMessage: (id: string) => void
  focusChatter: (chatter: SerializedChatter) => void
  focusEmote: (id: string, name: string, provider: string) => void
  increaseTwitchHighlight: boolean
  markNewAsUnread: boolean
  message: SerializedMessage
  onClick: (id: string) => void
  onToggleContextMenu: (open: boolean) => void
  quoteMessage: (message: SerializedMessage) => void
  showContextMenu: boolean
  showUnbanContextMenuItem: boolean
  style: React.CSSProperties
  timeout: (username: string, duration: number) => void
  unban: (username: string) => void
  useAlternate: boolean
  whisper: (username: string) => void
}

/**
 * React Props.
 */
interface WrapperProps {
  alternate: boolean
  highlighted: boolean
  increaseTwitchHighlight: boolean
  mentioned: boolean
  purged: boolean
  read: boolean
  twitchHighlighted: boolean
}
