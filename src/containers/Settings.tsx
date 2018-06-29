import { Button, Classes, Dialog, Intent, Navbar, Popover, Spinner, Switch, Tab, TabId, Tabs } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import FlexLayout from 'Components/FlexLayout'
import Theme from 'Constants/theme'
import { setShouldReadChangelog } from 'Store/ducks/app'
import { SettingsState, setVersion, toggleTheme } from 'Store/ducks/settings'
import { ApplicationState } from 'Store/reducers'
import { getTheme } from 'Store/selectors/settings'

/**
 * SettingsDialog component.
 */
const SettingsDialog = styled(Dialog)`
  height: 400px;
`

/**
 * SettingsNavbar component.
 */
const SettingsNavbar = styled(Navbar)`
  height: 40px !important;
`

/**
 * SettingsPanel component.
 */
const SettingsPanel = styled.div`
  height: 320px;
  margin: -20px -15px 0 -15px;
  overflow-y: scroll;
  padding: 20px;
`

/**
 * ConfirmationControls component.
 */
const ConfirmationControls = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
`

/**
 * ConfirmationCancelButton component.
 */
const ConfirmationCancelButton = styled(Button)`
  margin-right: 10px;
`

/**
 * LoadingChangelog component.
 */
const LoadingChangelog = styled(FlexLayout)`
  justify-content: center;
  padding-top: 70px;
`

/**
 * Changelog component.
 */
const Changelog = styled.div`
  font-size: 0.8rem;
  line-height: 1.2rem;
  overflow-y: scroll;

  & h1,
  & h2,
  .pt-dark & h1,
  .pt-dark & h3 {
    margin: 0;
    padding: 0;
  }

  & h1,
  .pt-dark & h1 {
    font-size: 1.2rem;
    margin-top: 20px;

    &:first-child {
      margin-top: 0;
    }
  }

  & h3,
  .pt-dark & h3 {
    border: 0;
    font-size: 1rem;
    margin: 20px 0;
  }
`

/**
 * Settings tab ids.
 */
export enum SettingsTab {
  General = 'general',
  Changelog = 'changelog',
}

/**
 * React State.
 */
const initialState = { isThemeConfirmationOpened: false, changelog: null as string | null }
type State = Readonly<typeof initialState>

/**
 * Settings Component.
 */
class Settings extends React.Component<Props, State> {
  public state: State = initialState

  /**
   * Lifecycle: componentDidMount.
   */
  public async componentDidMount() {
    if (this.props.defaultTab === SettingsTab.Changelog) {
      this.loadChangelog()
    }
  }

  /**
   * Lifecycle: componentDidUpdate.
   * @param prevProps - The previous props.
   */
  public componentDidUpdate(prevProps: Props) {
    if (prevProps.defaultTab !== this.props.defaultTab && this.props.defaultTab === SettingsTab.Changelog) {
      this.loadChangelog()
    }
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { visible, defaultTab } = this.props

    return (
      <SettingsDialog isOpen={visible} onClose={this.onClose} icon="cog" title="Settings">
        <SettingsNavbar>
          <Tabs id="settings-navbar" large defaultSelectedTabId={defaultTab} onChange={this.onChangeTab}>
            <Tab id={SettingsTab.General} title="General" panel={this.renderTabGeneral()} />
            <Tab id={SettingsTab.Changelog} title="Changelog" panel={this.renderTabChangelog()} />
          </Tabs>
        </SettingsNavbar>
      </SettingsDialog>
    )
  }

  /**
   * Loads the changelog.
   */
  private async loadChangelog() {
    if (_.isNil(this.state.changelog)) {
      // @ts-ignore
      const changelogUrl = await import('../CHANGELOG.md')
      const marked = await import('marked')

      const response = await fetch(changelogUrl)
      let changelog = await response.text()
      changelog = marked(changelog)

      this.setState(() => ({ changelog }))

      this.props.setVersion(process.env.REACT_APP_VERSION)
      this.props.setShouldReadChangelog(false)
    }
  }

  /**
   * Triggered when the settings tab is changed.
   */
  private onChangeTab = (tabId: TabId) => {
    if (tabId === SettingsTab.Changelog) {
      this.loadChangelog()
    }
  }

  /**
   * Renders the general tab.
   * @return Element to render.
   */
  private renderTabGeneral() {
    const { theme } = this.props

    return (
      <SettingsPanel>
        <Popover isOpen={this.state.isThemeConfirmationOpened} popoverClassName={Classes.POPOVER_CONTENT_SIZING}>
          <Switch checked={theme === Theme.Dark} label="Dark theme" onChange={this.onToggleTheme} />
          {this.renderThemeConfirmation()}
        </Popover>
      </SettingsPanel>
    )
  }

  /**
   * Renders the changelog tab.
   * @return Element to render.
   */
  private renderTabChangelog() {
    const { changelog } = this.state

    if (_.isNil(changelog)) {
      return (
        <SettingsPanel>
          <LoadingChangelog>
            <Spinner />
          </LoadingChangelog>
        </SettingsPanel>
      )
    }

    return (
      <SettingsPanel>
        <Changelog dangerouslySetInnerHTML={{ __html: changelog }} />
      </SettingsPanel>
    )
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

  /**
   * Renders the theme confirmation.
   * @return Element to render.
   */
  private renderThemeConfirmation() {
    return (
      <div>
        <h5>Confirm</h5>
        <p>Are you sure you want to switch to the light theme? You might lose your eyes.</p>
        <ConfirmationControls>
          <ConfirmationCancelButton className={Classes.POPOVER_DISMISS} onClick={this.onCancelToggleTheme}>
            Cancel
          </ConfirmationCancelButton>
          <Button intent={Intent.DANGER} className={Classes.POPOVER_DISMISS} onClick={this.onConfirmToggleTheme}>
            Confirm
          </Button>
        </ConfirmationControls>
      </div>
    )
  }

  /**
   * Triggered when the theme toggling is confirmed.
   */
  private onConfirmToggleTheme = () => {
    this.setState(() => ({ isThemeConfirmationOpened: false }))
    this.props.toggleTheme()
  }

  /**
   * Triggered when the theme toggling is cancelled.
   */
  private onCancelToggleTheme = () => {
    this.setState(() => ({ isThemeConfirmationOpened: false }))
  }

  /**
   * Triggered when the theme is toggled.
   */
  private onToggleTheme = () => {
    if (this.props.theme === Theme.Dark) {
      this.setState(() => ({ isThemeConfirmationOpened: true }))
    } else {
      this.props.toggleTheme()
    }
  }
}

export default connect<StateProps, DispatchProps, OwnProps, ApplicationState>(
  (state) => ({
    theme: getTheme(state),
  }),
  { toggleTheme, setVersion, setShouldReadChangelog }
)(Settings)

/**
 * React Props.
 */
type StateProps = {
  theme: SettingsState['theme']
}

/**
 * React Props.
 */
type DispatchProps = {
  setShouldReadChangelog: typeof setShouldReadChangelog
  setVersion: typeof setVersion
  toggleTheme: typeof toggleTheme
}

/**
 * React Props.
 */
type OwnProps = {
  defaultTab: SettingsTab
  toggle: () => void
  visible: boolean
}

/**
 * React Props.
 */
type Props = StateProps & DispatchProps & OwnProps
