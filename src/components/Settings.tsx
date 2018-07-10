import { Dialog, Navbar, Tab, Tabs } from '@blueprintjs/core'
import * as React from 'react'
import styled from 'styled-components'

import { size } from 'Utils/styled'

import SettingsActions from 'Containers/SettingsActions'
import SettingsChangelog from 'Containers/SettingsChangelog'
import SettingsGeneral from 'Containers/SettingsGeneral'
import SettingsHighlights from 'Containers/SettingsHighlights'

/**
 * SettingsDialog component.
 */
const SettingsDialog = styled(Dialog)`
  height: ${size('settings.height')};
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
  Actions = 'actions',
  Changelog = 'changelog',
}

/**
 * Settings Component.
 */
export default class Settings extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { defaultTab, toggle, visible } = this.props

    return (
      <SettingsDialog isOpen={visible} onClose={toggle} icon="cog" title="Settings">
        <SettingsNavbar>
          <Tabs id="settings-navbar" large defaultSelectedTabId={defaultTab}>
            <Tab id={SettingsTab.General} title="General" panel={<SettingsGeneral />} />
            <Tab id={SettingsTab.Highlights} title="Highlights" panel={<SettingsHighlights />} />
            <Tab id={SettingsTab.Actions} title="Actions" panel={<SettingsActions />} />
            <Tab id={SettingsTab.Changelog} title="Changelog" panel={<SettingsChangelog />} />
          </Tabs>
        </SettingsNavbar>
      </SettingsDialog>
    )
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
