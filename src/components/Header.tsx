import {
  Alignment,
  Button,
  Colors,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
  Position,
  Spinner,
  Tooltip,
} from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import { Helmet } from 'react-helmet'
import styled from 'styled-components'

import Page from 'Constants/page'
import Status from 'Constants/status'
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
          {this.renderChannelControls()}
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
   * Render the channel controls if necessary.
   * @return Element to render.
   */
  private renderChannelControls() {
    const { page, toggleChattersList } = this.props

    if (page === Page.Home || page === Page.Auth || page === Page.Login) {
      return null
    }

    return (
      <>
        <Tooltip content="Chatters List" position={Position.BOTTOM}>
          <Button onClick={toggleChattersList} icon="people" minimal title="Chatters List" />
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
}

/**
 * React Props.
 */
type Props = {
  channel: AppState['channel']
  goHome: () => void
  highlightChangelog: boolean
  isLoggedIn: boolean
  page: string
  status: AppState['status']
  toggleChangelog: () => void
  toggleSettings: () => void
  toggleChattersList: () => void
  logout: () => void
}
