import {
  Alignment,
  Button,
  Colors,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
  Spinner,
} from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import { Helmet } from 'react-helmet'
import styled from 'styled-components'

import Status from 'Constants/status'
import { AppState } from 'Store/ducks/app'

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
 * Header Component.
 */
export default class Header extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { channel, isLoggedIn, logout, toggleSettings } = this.props

    const title = `${!_.isNil(channel) ? `${channel} - ` : ''}YaTA`

    return (
      <Navbar>
        <NavbarGroup align={Alignment.LEFT}>
          <Helmet>
            <title>{title}</title>
          </Helmet>
          <NavbarHeading>{title}</NavbarHeading>
          {this.renderStatus()}
        </NavbarGroup>
        <NavbarGroup align={Alignment.RIGHT}>
          <Button disabled={!isLoggedIn} onClick={toggleSettings} icon="cog" minimal title="Settings" />
          {isLoggedIn && <Button onClick={logout} icon="log-out" minimal title="Log out" />}
        </NavbarGroup>
      </Navbar>
    )
  }

  /**
   * Render the status indicator if necessary.
   * @return Element to render.
   */
  private renderStatus() {
    const { status } = this.props

    if (status === Status.Default || status === Status.Connected) {
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
  isLoggedIn: boolean
  status: AppState['status']
  toggleSettings: () => void
  logout: () => void
}
