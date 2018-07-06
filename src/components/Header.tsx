import {
  Alignment,
  Button,
  Colors,
  Icon,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
  Position,
  Spinner,
  Switch as _Switch,
  Tooltip,
} from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import { Helmet } from 'react-helmet'
import styled from 'styled-components'

import Page from 'Constants/page'
import Status from 'Constants/status'
import { SerializedRoomState } from 'Libs/RoomState'
import { AppState } from 'Store/ducks/app'

/**
 * ChannelLink component.
 */
const ChannelLink = styled.a`
  color: inherit !important;
`

/**
 * StatusSpinner component.
 */
const StatusSpinner = styled(Spinner)`
  margin-right: 10px;
`

/**
 * Status component.
 */
const StatusMessage = styled(NavbarHeading)`
  color: ${Colors.GRAY3};
  font-style: italic;
`

/**
 * Changelog component.
 */
const Changelog = styled(Button)`
  svg {
    color: ${Colors.GOLD5} !important;
  }
`

/**
 * Switch component.
 */
const Switch = styled(_Switch)`
  margin-left: 6px;
  margin-top: 9px;
`

/**
 * StateTooltip component.
 */
const StateTooltip = styled(Tooltip)`
  margin-right: 10px;

  & + .pt-navbar-divider {
    margin-left: 0;
  }
`

/**
 * Header Component.
 */
export default class Header extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const {
      channel,
      goHome,
      highlightChangelog,
      isLoggedIn,
      logout,
      page,
      toggleChangelog,
      toggleSettings,
    } = this.props

    const showChannelName = page !== Page.Home && !_.isNil(channel)

    const headerTitle = `${showChannelName ? `${channel} - ` : ''}YaTA`

    const title = (
      <span>
        {showChannelName && (
          <>
            <ChannelLink target="_blank" href={`https://twitch.tv/${channel}`}>
              {channel}
            </ChannelLink>{' '}
            -{' '}
          </>
        )}Yata
      </span>
    )

    return (
      <Navbar>
        <NavbarGroup align={Alignment.LEFT}>
          <Helmet>
            <title>{headerTitle}</title>
          </Helmet>
          <NavbarHeading>{title}</NavbarHeading>
          {this.renderStatus()}
        </NavbarGroup>
        <NavbarGroup align={Alignment.RIGHT}>
          {this.renderChannelState()}
          {this.renderChannelControls()}
          {this.renderDebugTools()}
          {page !== Page.Home && (
            <Tooltip content="Home" position={Position.BOTTOM}>
              <Button onClick={goHome} icon="home" minimal title="Home" />
            </Tooltip>
          )}
          {highlightChangelog && (
            <Tooltip content="New version available! Check the changelog." position={Position.BOTTOM}>
              <Changelog onClick={toggleChangelog} icon="lightbulb" minimal title="Changelog" />
            </Tooltip>
          )}
          <Tooltip content="Settings" position={Position.BOTTOM}>
            <Button disabled={!isLoggedIn} onClick={toggleSettings} icon="cog" minimal title="Settings" />
          </Tooltip>
          {isLoggedIn && (
            <Tooltip content="Log out" position={Position.BOTTOM}>
              <Button onClick={logout} icon="log-out" minimal title="Log out" />
            </Tooltip>
          )}
        </NavbarGroup>
      </Navbar>
    )
  }

  /**
   * Render the channel state if necessary.
   * @return Element to render.
   */
  private renderChannelState() {
    if (!this.shouldRenderChannelELements()) {
      return null
    }

    const { pauseAutoScroll, roomState } = this.props.channelState

    const r9k = _.get(roomState, 'r9k', false)
    const emoteOnly = _.get(roomState, 'emoteOnly', false)
    const followersOnly = _.get(roomState, 'followersOnly', false)
    const followersOnlyDuration = _.get(roomState, 'followersOnlyDuration', 0) as number
    const slow = _.get(roomState, 'slow', false)
    const slowDuration = _.get(roomState, 'slowDuration', 0) as number
    const subsOnly = _.get(roomState, 'subsOnly', false)

    if (!pauseAutoScroll && !r9k && !emoteOnly && !followersOnly && !slow && !subsOnly) {
      return null
    }

    return (
      <>
        {pauseAutoScroll && (
          <StateTooltip content="Auto scrolling disabled" position={Position.BOTTOM}>
            <Icon icon="pause" color={Colors.RED4} />
          </StateTooltip>
        )}
        {subsOnly && (
          <StateTooltip content="Subscriber-only" position={Position.BOTTOM}>
            <Icon icon="dollar" />
          </StateTooltip>
        )}
        {slow && (
          <StateTooltip content={`Slow mode (${slowDuration}s)`} position={Position.BOTTOM}>
            <Icon icon="outdated" />
          </StateTooltip>
        )}
        {followersOnly && (
          <StateTooltip
            content={`Follower-only${followersOnlyDuration > 0 ? ` (${followersOnlyDuration}m)` : ''}`}
            position={Position.BOTTOM}
          >
            <Icon icon="follower" />
          </StateTooltip>
        )}
        {emoteOnly && (
          <StateTooltip content="Emote-only" position={Position.BOTTOM}>
            <Icon icon="media" />
          </StateTooltip>
        )}
        {r9k && (
          <StateTooltip content="R9K" position={Position.BOTTOM}>
            <Icon icon="multi-select" />
          </StateTooltip>
        )}
        <NavbarDivider />
      </>
    )
  }

  /**
   * Render the channel controls if necessary.
   * @return Element to render.
   */
  private renderChannelControls() {
    const { toggleChatters } = this.props

    if (!this.shouldRenderChannelELements()) {
      return null
    }

    return (
      <>
        <Tooltip content="Chatters List" position={Position.BOTTOM}>
          <Button onClick={toggleChatters} icon="people" minimal title="Chatters List" />
        </Tooltip>
        <NavbarDivider />
      </>
    )
  }

  /**
   * Render the debug tools if necessary.
   * @return Element to render.
   */
  private renderDebugTools() {
    if (process.env.NODE_ENV !== 'development') {
      return null
    }

    const { autoConnectInDev, toggleAutoConnectInDev } = this.props

    return (
      <>
        <Tooltip content="Auto-Connect (dev only)" position={Position.BOTTOM}>
          <Switch checked={autoConnectInDev} onChange={toggleAutoConnectInDev} />
        </Tooltip>
        <NavbarDivider />
      </>
    )
  }

  /**
   * Render the status indicator if necessary.
   * @return Element to render.
   */
  private renderStatus() {
    const { page, status } = this.props

    if (page === Page.Home || status === Status.Default || status === Status.Connected) {
      return null
    }

    let connectionStr: string

    switch (status) {
      case Status.Connecting: {
        connectionStr = 'Connecting…'
        break
      }
      case Status.Logon: {
        connectionStr = 'Logging on…'
        break
      }
      case Status.Disconnected: {
        connectionStr = 'Disconnected'
        break
      }
      case Status.Reconnecting: {
        connectionStr = 'Reconnecting…'
        break
      }
      default: {
        connectionStr = ''
        break
      }
    }

    return (
      <>
        <NavbarDivider />
        <StatusSpinner small />
        <StatusMessage>{connectionStr}</StatusMessage>
      </>
    )
  }

  /**
   * Determines if we should render channel specific elements.
   * @return `true` when we should render them.
   */
  private shouldRenderChannelELements() {
    const { page } = this.props

    return page !== Page.Home && page !== Page.Auth && page !== Page.Login
  }
}

/**
 * React Props.
 */
type Props = {
  autoConnectInDev: boolean
  channel: AppState['channel']
  channelState: ChannelState
  goHome: () => void
  highlightChangelog: boolean
  isLoggedIn: boolean
  logout: () => void
  page: string
  status: AppState['status']
  toggleAutoConnectInDev: () => void
  toggleChangelog: () => void
  toggleChatters: () => void
  toggleSettings: () => void
}

/**
 * Channel state.
 */
type ChannelState = {
  pauseAutoScroll: boolean
  roomState: SerializedRoomState | null
}
