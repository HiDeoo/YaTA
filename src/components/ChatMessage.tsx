import { Button, Intent, Menu, MenuDivider, MenuItem, Popover } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import styled from 'styled-components'

import ChatClip from 'Components/ChatClip'
import ChatMessageContent from 'Components/ChatMessageContent'
import { SerializedChatter } from 'Libs/Chatter'
import { SerializedMessage } from 'Libs/Message'
import { Clip } from 'Libs/Twitch'
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
  padding: 4px ${size('log.hPadding')}px 4px 7px;

  & > .pt-popover-wrapper {
    .pt-button {
      margin-top: -4px;
    }
  }
`

/**
 * Time component.
 */
const Time = styled.span`
  color: ${color('message.time.color')};
  font-size: 0.77rem;
  padding-right: 2px;
`

/**
 * Badges component.
 */
const Badges = styled.span`
  .badge {
    display: inline-block;
    padding-right: 4px;
    vertical-align: middle;

    &:last-of-type {
      padding-right: 6px;
    }
  }
`

/**
 * Username component.
 */
const Username = withSCProps<UsernameProps, HTMLSpanElement>(styled.span)`
  color: ${(props) => props.color};
  cursor: pointer;
  font-weight: bold;
  padding-right: 2px;
`

/**
 * ChatMessage Component.
 */
export default class ChatMessage extends React.Component<Props> {
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
        <Username color={usernameColor} onClick={this.onClickUsername}>
          {message.user.displayName}
        </Username>{' '}
        <ChatMessageContent message={message} />
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
    ) as { [key: string]: Clip }

    return _.map(clips, (clip) => {
      return <ChatClip key={clip.slug} clip={clip} />
    })
  }

  /**
   * Renders the context menu when enabled.
   * @return Element to render.
   */
  private renderContextMenu() {
    const { canModerate, message, showContextMenu } = this.props

    if (!showContextMenu) {
      return null
    }

    const menu = (
      <Menu>
        <MenuItem icon="clipboard" text="Copy message" onClick={this.copyMessage} />
        <MenuItem icon="clipboard" text="Copy username" onClick={this.onCopyUsername} />
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
        <Button icon="menu" minimal />
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

    timeout(message.user.name, duration)
  }

  /**
   * Triggered when the ban menu item is clicked.
   */
  private onClickBan = () => {
    const { ban, message } = this.props

    ban(message.user.name)
  }
}

/**
 * React Props.
 */
type Props = {
  ban: (username: string) => void
  canModerate: (chatter: SerializedChatter) => boolean
  copyMessageOnDoubleClick: boolean
  copyToClipboard: (message: string) => void
  focusChatter: (chatter: SerializedChatter) => void
  message: SerializedMessage
  showContextMenu: boolean
  style: React.CSSProperties
  timeout: (username: string, duration: number) => void
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
type UsernameProps = {
  color: string
}
