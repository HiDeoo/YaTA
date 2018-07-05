import { Dialog, Navbar, Tab, Tabs } from '@blueprintjs/core'
import * as React from 'react'
import styled from 'styled-components'

import { size } from 'Utils/styled'

import SettingsChangelog from 'Containers/SettingsChangelog'
import SettingsGeneral from 'Containers/SettingsGeneral'
import SettingsHighlights from 'Containers/SettingsHighlights'

/**
 * SettingsDialog component.
 */
const SettingsDialog = styled(Dialog)`
  height: ${size('settings.height')}px;
`

/**
 * SettingsNavbar component.
 */
const SettingsNavbar = styled(Navbar)`
  height: 40px !important;
`

/**
 * Settings tab ids.
 */
export enum SettingsTab {
  General = 'general',
  Highlights = 'highlights',
  Changelog = 'changelog',
}

/**
 * React State.
 */
const initialState = { isThemeConfirmationOpened: false }
type State = Readonly<typeof initialState>

/**
 * Settings Component.
 */
export default class Settings extends React.Component<Props, State> {
  public state: State = initialState

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { isThemeConfirmationOpened } = this.state
    const { visible, defaultTab } = this.props

    return (
      <SettingsDialog isOpen={visible} onClose={this.onClose} icon="cog" title="Settings">
        <SettingsNavbar>
          <Tabs id="settings-navbar" large defaultSelectedTabId={defaultTab}>
            <Tab
              id={SettingsTab.General}
              title="General"
              panel={
                <SettingsGeneral
                  isThemeConfirmationOpened={isThemeConfirmationOpened}
                  setThemeConfirmationOpened={this.setThemeConfirmationOpened}
                />
              }
            />
            <Tab id={SettingsTab.Highlights} title="Highlights" panel={<SettingsHighlights />} />
            <Tab id={SettingsTab.Changelog} title="Changelog" panel={<SettingsChangelog />} />
          </Tabs>
        </SettingsNavbar>
      </SettingsDialog>
    )
  }

  /**
   * Sets the opened status of the theme confirmation.
   * @param opened - Defines if the confirmation is opened or not.
   */
  private setThemeConfirmationOpened = (opened: boolean) => {
    this.setState(() => ({ isThemeConfirmationOpened: opened }))
  }

  /**
   * Triggered when the settings should be closed.
   */
  private onClose = () => {
    if (!this.state.isThemeConfirmationOpened) {
      this.setState(() => initialState)

      this.props.toggle()
    }
  }
}

/**
 * React Props.
 */
type Props = {
  defaultTab: SettingsTab
  toggle: () => void
  visible: boolean
}
