import { Classes, Colors } from '@blueprintjs/core'
import { History } from 'history'
import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { Redirect, Route, Switch } from 'react-router-dom'
import * as semCompare from 'semver-compare'
import { ThemeProvider } from 'styled-components'

import Channels from 'Components/Channels'
import FlexContent from 'Components/FlexContent'
import FlexLayout from 'Components/FlexLayout'
import Header from 'Components/Header'
import Login from 'Components/Login'
import Page from 'Constants/page'
import Theme from 'Constants/theme'
import Auth from 'Containers/Auth'
import Channel from 'Containers/Channel'
import Settings, { SettingsTab } from 'Containers/Settings'
import { AppState, setShouldReadChangelog, toggleChattersList } from 'Store/ducks/app'
import { SettingsState, setVersion } from 'Store/ducks/settings'
import { resetUser } from 'Store/ducks/user'
import { ApplicationState } from 'Store/reducers'
import { getChannel, getShouldReadChangelog, getStatus } from 'Store/selectors/app'
import { getLastKnownVersion, getTheme } from 'Store/selectors/settings'
import { getIsLoggedIn } from 'Store/selectors/user'
import dark from 'Styled/dark'
import light from 'Styled/light'

/**
 * React State.
 */
const initialState = { showSettings: false, settingSelectedTab: SettingsTab.General }
type State = Readonly<typeof initialState>

/**
 * App Component.
 */
class App extends React.Component<Props, State> {
  public state: State = initialState

  /**
   * Lifecycle: componentDidMount.
   */
  public componentDidMount() {
    this.installTheme()

    if (_.isNil(this.props.lastKnownVersion)) {
      this.props.setVersion(process.env.REACT_APP_VERSION)
    } else if (semCompare(process.env.REACT_APP_VERSION, this.props.lastKnownVersion) === 1) {
      this.props.setShouldReadChangelog(true)
    }
  }

  /**
   * Lifecycle: componentDidUpdate.
   * @param prevProps - The previous props.
   */
  public componentDidUpdate(prevProps: Props) {
    if (prevProps.theme !== this.props.theme) {
      this.installTheme()
    }
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { showSettings, settingSelectedTab } = this.state
    const { channel, isLoggedIn, location, shouldReadChangelog, status, theme } = this.props
    const { pathname } = location

    const isLoggingIn = pathname === Page.Login || pathname === Page.Auth

    if (!isLoggedIn && !isLoggingIn) {
      return <Redirect to="/login" />
    } else if (isLoggedIn && isLoggingIn) {
      return <Redirect to="/" />
    }

    return (
      <ThemeProvider theme={theme === Theme.Dark ? dark : light}>
        <FlexLayout vertical>
          <Header
            toggleSettings={this.toggleSettings}
            toggleChangelog={this.toggleChangelog}
            toggleChattersList={this.props.toggleChattersList}
            isLoggedIn={isLoggedIn}
            channel={channel}
            logout={this.props.resetUser}
            status={status}
            highlightChangelog={shouldReadChangelog}
            goHome={this.goHome}
            page={pathname}
          />
          <Settings visible={showSettings} toggle={this.toggleSettings} defaultTab={settingSelectedTab} />
          <FlexContent>
            <Switch>
              <Route exact path="/" component={Channels} />
              <Route path="/auth" component={Auth} />
              <Route path="/login" component={Login} />
              <Route path="/:channel" component={Channel} />
            </Switch>
          </FlexContent>
        </FlexLayout>
      </ThemeProvider>
    )
  }

  /**
   * Installs the proper theme.
   */
  private installTheme() {
    if (this.props.theme === Theme.Dark) {
      document.body.classList.add(Classes.DARK)
      document.body.style.backgroundColor = Colors.DARK_GRAY3
    } else {
      document.body.classList.remove(Classes.DARK)
      document.body.style.backgroundColor = Colors.LIGHT_GRAY5
    }
  }

  /**
   * Toggles the settings panel.
   */
  private toggleSettings = () => {
    this.setState(({ showSettings }) => ({
      settingSelectedTab: SettingsTab.General,
      showSettings: !showSettings,
    }))
  }

  /**
   * Toggles the changelog panel.
   */
  private toggleChangelog = () => {
    this.setState(({ showSettings }) => ({
      settingSelectedTab: SettingsTab.Changelog,
      showSettings: !showSettings,
    }))
  }

  /**
   * Navigates to the homepage.
   */
  private goHome = () => {
    this.props.history.push(Page.Home)
  }
}

export default connect<StateProps, DispatchProps, OwnProps, ApplicationState>(
  (state) => ({
    channel: getChannel(state),
    isLoggedIn: getIsLoggedIn(state),
    lastKnownVersion: getLastKnownVersion(state),
    shouldReadChangelog: getShouldReadChangelog(state),
    status: getStatus(state),
    theme: getTheme(state),
  }),
  { resetUser, setVersion, setShouldReadChangelog, toggleChattersList }
)(App)

/**
 * React Props.
 */
type StateProps = {
  channel: AppState['channel']
  isLoggedIn: ReturnType<typeof getIsLoggedIn>
  lastKnownVersion: SettingsState['lastKnownVersion']
  shouldReadChangelog: AppState['shouldReadChangelog']
  status: AppState['status']
  theme: SettingsState['theme']
}

/**
 * React Props.
 */
type DispatchProps = {
  resetUser: typeof resetUser
  setShouldReadChangelog: typeof setShouldReadChangelog
  setVersion: typeof setVersion
  toggleChattersList: typeof toggleChattersList
}

/**
 * React Props.
 */
type OwnProps = {
  history: History
  location: Location
}

/**
 * React Props.
 */
type Props = StateProps & DispatchProps & OwnProps
