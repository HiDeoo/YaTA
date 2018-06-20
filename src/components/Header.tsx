import { Alignment, Button, Navbar, NavbarGroup, NavbarHeading } from '@blueprintjs/core'
import * as React from 'react'

/**
 * Header Component.
 */
export default class Header extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { isLoggedIn, toggleSettings } = this.props

    return (
      <Navbar>
        <NavbarGroup align={Alignment.LEFT}>
          <NavbarHeading>YaTA</NavbarHeading>
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
  isLoggedIn: boolean
  toggleSettings: () => void
}
