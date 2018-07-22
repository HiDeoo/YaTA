import { Button, Colors, Intent, Menu, MenuDivider, MenuItem, Popover } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import styled from 'styled-components'

import Clip from 'Components/Clip'
import MessageContent from 'Components/MessageContent'
import ActionMenuItems from 'Containers/ActionMenuItems'
import { ActionHandler } from 'Libs/Action'
import { SerializedChatter } from 'Libs/Chatter'
import { SerializedMessage } from 'Libs/Message'
import { RawClip } from 'Libs/Twitch'
import { replaceImgTagByAlt } from 'Utils/html'
import { withSCProps } from 'Utils/react'
import { color, ifProp, size } from 'Utils/styled'

/**
 * Wrapper component.
 */
const Wrapper = withSCProps<WrapperProps, HTMLDivElement>(styled.div)`
  background-color: ${ifProp('mentionned', color('log.mention.self.background'), 'inherit')};
  border-left: 3px solid ${ifProp('mentionned', color('log.mention.self.color'), 'transparent')};
  opacity: ${ifProp('purged', 0.5, 1.0)};
  padding: 4px ${size('log.hPadding')} 1px 7px;
`

/**
 * MenuButton component.
 */
const MenuButton = styled(Button)`
  &.pt-button.pt-minimal,
  .pt-dark &.pt-button.pt-minimal {
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

    &.pt-active,
    &:active,
    &:hover {
      background: initial;

      & > svg {
        color: ${Colors.LIGHT_GRAY1};
      }
    }
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
    display: inline-block;
    margin-top: -1px;
    padding-right: 4px;
    vertical-align: middle;

    &:last-of-type {
      padding-right: 6px;
    }
  }
`

/**
 * Name component.
 */
const Name = withSCProps<NameProps, HTMLSpanElement>(styled.span)`
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
 * Message Component.
 */
export default class Message extends React.Component<Props> {
  /**
   * Lifecycle: shouldComponentUpdate.
   * @param  nextProps - The next props.
   * @return A boolean to indicate if the component should update on state or props change.
   */
  public shouldComponentUpdate(nextProps: Props) {
    const { message, style } = this.props
    const { message: nextMessage, style: nextStyle } = nextProps

    return message.id !== nextMessage.id || message.purged !== nextMessage.purged || !_.isEqual(style, nextStyle)
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { message, style } = this.props

    const usernameColor = message.user.color as string

    return (
      <Wrapper style={style} onDoubleClick={this.onDoubleClick} mentionned={message.mentionned} purged={message.purged}>
        {this.renderContextMenu()}
        <Time>{message.time} </Time>
        {this.renderBadges()}
        <Name color={usernameColor} onClick={this.onClickUsername}>
          {message.user.displayName}
          {message.user.showUsername && <Username> ({message.user.userName})</Username>}
        </Name>{' '}
        <MessageContent message={message} />
        {this.renderClips()}
      </Wrapper>
    )
  }

  /**
   * Renders the clips preview if necessary.
   * @return Element to render.
   */
  private renderClips() {
    const { message } = this.props

    if (!message.hasClip) {
      return null
    }

    const clips = _.reduce(
      message.clips,
      (validClips, clip) => {
        if (!_.isNil(clip)) {
          validClips[clip.slug] = clip
        }

        return validClips
      },
      {}
    ) as { [key: string]: RawClip }

    return _.map(clips, (clip) => {
      return <Clip key={clip.slug} clip={clip} />
    })
  }

  /**
   * Renders the context menu when enabled.
   * @return Element to render.
   */
  private renderContextMenu() {
    const { actionHandler, canModerate, message, showContextMenu } = this.props

    if (!showContextMenu) {
      return null
    }

    const menu = (
      <Menu>
        {!message.user.isSelf && (
          <>
            <MenuItem icon="envelope" text="Whisper" onClick={this.onClickWhisper} />
            <MenuDivider />
          </>
        )}
        <MenuItem icon="clipboard" text="Copy message" onClick={this.copyMessage} />
        <MenuItem icon="clipboard" text="Copy username" onClick={this.onCopyUsername} />
        <ActionMenuItems startDivider actionHandler={actionHandler} chatter={message.user} />
        {canModerate(message.user) && (
          <>
            <MenuDivider />
            <MenuItem icon="trash" text="Purge" onClick={this.onClickPurge} />
            <MenuItem icon="time" text="Timeout">
              <MenuItem text="10m" onClick={this.onClickTimeout10M} />
              <MenuItem text="1h" onClick={this.onClickTimeout1H} />
              <MenuItem text="6h" onClick={this.onClickTimeout6H} />
              <MenuItem text="24h" onClick={this.onClickTimeout24H} />
            </MenuItem>
            <MenuItem icon="disable" text="Ban" intent={Intent.DANGER} onClick={this.onClickBan} />
          </>
        )}
      </Menu>
    )

    return (
      <Popover content={menu} lazy>
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
   * Triggered when a message is doubled clicked.
   */
  private onDoubleClick = () => {
    if (this.props.copyMessageOnDoubleClick) {
      this.copyMessage()
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
    const { message } = this.props

    const tmpDiv = document.createElement('div')
    tmpDiv.innerHTML = replaceImgTagByAlt(message.message)

    const sanitizedMessage = tmpDiv.textContent || tmpDiv.innerText || ''

    this.props.copyToClipboard(`[${message.time}] ${message.user.displayName}: ${sanitizedMessage}`)
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
  copyToClipboard: (message: string) => void
  focusChatter: (chatter: SerializedChatter) => void
  message: SerializedMessage
  showContextMenu: boolean
  style: React.CSSProperties
  timeout: (username: string, duration: number) => void
  whisper: (username: string) => void
}

/**
 * React Props.
 */
type WrapperProps = {
  mentionned: boolean
  purged: boolean
}

/**
 * React Props.
 */
type NameProps = {
  color: string
}
