import {
  Alignment,
  Button,
  Colors,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
  Spinner,
  Switch as _Switch,
} from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import { Helmet } from 'react-helmet'
import styled from 'styled-components'

import HeaderTooltip from 'Components/HeaderTooltip'
import Page from 'Constants/page'
import Status from 'Constants/status'
import { AppState } from 'Store/ducks/app'
import { enumIncludes } from 'Utils/typescript'

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
 * Header configuration.
 */
export const defaultHeaderConfiguration: HeaderConfiguration = {
  rightComponent: null,
  setRightComponent: () => undefined,
  setTitleComponent: () => undefined,
  titleComponent: null,
}

/**
 * Header context
 */
const HeaderContext = React.createContext(defaultHeaderConfiguration)
export const HeaderProvider = HeaderContext.Provider
export const HeaderConsumer = HeaderContext.Consumer

/**
 * Header HOC wrapping a component and giving it access to header configuration setters.
 */
export function withHeader<OriginalProps extends object>(
  UnwrappedComponent: React.ComponentType<OriginalProps & WithHeaderProps>
) {
  return function WithHeaderConfiguration(props: OriginalProps) {
    return (
      <HeaderConsumer>
        {({ setRightComponent, setTitleComponent }) => (
          <UnwrappedComponent
            {...props}
            setHeaderRightComponent={setRightComponent}
            setHeaderTitleComponent={setTitleComponent}
          />
        )}
      </HeaderConsumer>
    )
  }
}

/**
 * Header Component.
 */
export default class Header extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { goHome, highlightChangelog, isLoggedIn, logout, page, toggleChangelog, toggleSettings } = this.props

    return (
      <Navbar>
        <Helmet>
          <title>YaTA</title>
        </Helmet>
        <NavbarGroup align={Alignment.LEFT}>
          <NavbarHeading>
            <HeaderConsumer>
              {({ titleComponent }) => (!_.isNil(titleComponent) ? <span>{titleComponent} - </span> : null)}
            </HeaderConsumer>YaTA
          </NavbarHeading>
          {this.renderStatus()}
        </NavbarGroup>
        <NavbarGroup align={Alignment.RIGHT}>
          <HeaderConsumer>{({ rightComponent }) => (!_.isNil(rightComponent) ? rightComponent : null)}</HeaderConsumer>
          {this.renderDebugTools()}
          {page !== Page.Home && (
            <HeaderTooltip content="Home">
              <Button onClick={goHome} icon="home" minimal title="Home" />
            </HeaderTooltip>
          )}
          {highlightChangelog && (
            <HeaderTooltip content="New version available! Check the changelog.">
              <Changelog onClick={toggleChangelog} icon="lightbulb" minimal title="Changelog" />
            </HeaderTooltip>
          )}
          <HeaderTooltip content="Settings">
            <Button disabled={!isLoggedIn} onClick={toggleSettings} icon="cog" minimal title="Settings" />
          </HeaderTooltip>
          {isLoggedIn && (
            <HeaderTooltip content="Log out">
              <Button onClick={logout} icon="log-out" minimal title="Log out" />
            </HeaderTooltip>
          )}
        </NavbarGroup>
      </Navbar>
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
        <HeaderTooltip content="Auto-Connect (dev only)">
          <Switch checked={autoConnectInDev} onChange={toggleAutoConnectInDev} />
        </HeaderTooltip>
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

    if (enumIncludes(Page, page) || status === Status.Default || status === Status.Connected) {
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
  autoConnectInDev: boolean
  goHome: () => void
  highlightChangelog: boolean
  isLoggedIn: boolean
  logout: () => void
  page: string
  status: AppState['status']
  toggleAutoConnectInDev: () => void
  toggleChangelog: () => void
  toggleSettings: () => void
}

/**
 * React Props.
 */
export type WithHeaderProps = {
  setHeaderRightComponent: HeaderConfiguration['setRightComponent']
  setHeaderTitleComponent: HeaderConfiguration['setTitleComponent']
}

/**
 * Header configuration.
 */
type HeaderConfiguration = {
  rightComponent: JSX.Element | null
  setRightComponent: (component: JSX.Element | null) => void
  setTitleComponent: (component: JSX.Element | null) => void
  titleComponent: JSX.Element | null
}
