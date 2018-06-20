import { Alignment, Button, Navbar, NavbarGroup, NavbarHeading } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import { Helmet } from 'react-helmet'

import { AppState } from 'Store/ducks/app'

/**
 * Header Component.
 */
export default class Header extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { channel, isLoggedIn, toggleSettings } = this.props

    const title = `${!_.isNil(channel) ? `${channel} - ` : ''}YaTA`

    return (
      <Navbar>
        <NavbarGroup align={Alignment.LEFT}>
          <Helmet>
            <title>{title}</title>
          </Helmet>
          <NavbarHeading>{title}</NavbarHeading>
        </NavbarGroup>
        <NavbarGroup align={Alignment.RIGHT}>
          <Button disabled={!isLoggedIn} onClick={toggleSettings} icon="cog" minimal />
        </NavbarGroup>
      </Navbar>
    )
  }
}

/**
 * React Props.
 */
type Props = {
  channel: AppState['channel']
  isLoggedIn: boolean
  toggleSettings: () => void
}
