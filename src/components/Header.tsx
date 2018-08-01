import {
  Button,
  Classes,
  Colors,
  Intent,
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

import HeaderTooltip from 'Components/HeaderTooltip'
import Page from 'Constants/page'
import Status from 'Constants/status'
import { AppState } from 'Store/ducks/app'
import { enumIncludes } from 'Utils/typescript'

/**
 * NavBar component.
 */
const HeaderNavbar = styled(Navbar)`
  align-items: center;
  display: flex;
`

/**
 * NavbarGroup component.
 */
const HeaderNavbarGroup = styled(NavbarGroup)`
  &.${Classes.NAVBAR_GROUP}.${Classes.ALIGN_LEFT} {
    float: unset;
    flex-shrink: 0;
  }
`

/**
 * NavbarSpacer component.
 */
const NavbarSpacer = styled.div`
  flex-grow: 2;
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
  &.${Classes.BUTTON} svg.${Classes.ICON}, .${Classes.DARK} &.${Classes.BUTTON} svg.${Classes.ICON} {
    color: ${Colors.GOLD5};
  }
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
    const { highlightChangelog, isLoggedIn, logout, page, reportBug, toggleChangelog, toggleSettings } = this.props

    return (
      <HeaderNavbar>
        <Helmet>
          <title>YaTA</title>
        </Helmet>
        <HeaderNavbarGroup>
          <NavbarHeading>
            <HeaderConsumer>
              {({ titleComponent }) => (!_.isNil(titleComponent) ? <span>{titleComponent} - </span> : null)}
            </HeaderConsumer>
            YaTA
          </NavbarHeading>
          {this.renderStatus()}
        </HeaderNavbarGroup>
        <NavbarSpacer />
        <HeaderNavbarGroup>
          <HeaderConsumer>{({ rightComponent }) => (!_.isNil(rightComponent) ? rightComponent : null)}</HeaderConsumer>
          <HeaderTooltip content="Report bug">
            <Button onClick={reportBug} icon="issue" minimal />
          </HeaderTooltip>
          {page !== Page.Home && (
            <HeaderTooltip content="Home">
              <Button onMouseUp={this.onMouseUpHome} icon="home" minimal />
            </HeaderTooltip>
          )}
          {highlightChangelog && (
            <HeaderTooltip content="New version available! Check the changelog.">
              <Changelog onClick={toggleChangelog} icon="lightbulb" minimal />
            </HeaderTooltip>
          )}
          <HeaderTooltip content="Settings">
            <Button disabled={!isLoggedIn} onClick={toggleSettings} icon="cog" minimal />
          </HeaderTooltip>
          {isLoggedIn && (
            <HeaderTooltip content="Log out">
              <Button onClick={logout} icon="log-out" minimal />
            </HeaderTooltip>
          )}
        </HeaderNavbarGroup>
      </HeaderNavbar>
    )
  }

  /**
   * Triggered on the mouse up event on the home button.
   * @param event - The associated event.
   */
  private onMouseUpHome = (event: React.MouseEvent<HTMLElement>) => {
    this.props.goHome(event)
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
        <StatusSpinner className={Classes.SMALL} intent={Intent.PRIMARY} />
        <StatusMessage>{connectionStr}</StatusMessage>
      </>
    )
  }
}

/**
 * React Props.
 */
type Props = {
  goHome: (event: React.MouseEvent<HTMLElement>) => void
  highlightChangelog: boolean
  isLoggedIn: boolean
  logout: () => void
  page: string
  reportBug: () => void
  status: AppState['status']
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
