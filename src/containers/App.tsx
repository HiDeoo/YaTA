import { Classes, Colors } from '@blueprintjs/core'
import { History } from 'history'
import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { Redirect, Route, Switch } from 'react-router-dom'
import * as semCompare from 'semver-compare'
import { ThemeProvider } from 'styled-components'

import FlexContent from 'Components/FlexContent'
import FlexLayout from 'Components/FlexLayout'
import Follows from 'Components/Follows'
import Header from 'Components/Header'
import Login from 'Components/Login'
import Settings, { SettingsTab } from 'Components/Settings'
import Page from 'Constants/page'
import Theme from 'Constants/theme'
import Auth from 'Containers/Auth'
import Channel from 'Containers/Channel'
import Twitch from 'Libs/Twitch'
import { AppState, setShouldReadChangelog, toggleChatters } from 'Store/ducks/app'
import { SettingsState, setVersion, toggleAutoConnectInDev } from 'Store/ducks/settings'
import { resetUser } from 'Store/ducks/user'
import { ApplicationState } from 'Store/reducers'
import { getChannel, getRoomState, getShouldReadChangelog, getStatus } from 'Store/selectors/app'
import { getPauseAutoScroll } from 'Store/selectors/logs'
import { getAutoConnectInDev, getLastKnownVersion, getTheme } from 'Store/selectors/settings'
import { getIsLoggedIn, getLoginDetails } from 'Store/selectors/user'
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
   * Creates a new instance of the component.
   * @param props - The props of the component.
   */
  constructor(props: Props) {
    super(props)

    this.installTheme()
    this.setUpTwitchApi()
  }

  /**
   * Lifecycle: componentDidMount.
   */
  public componentDidMount() {
    const { lastKnownVersion } = this.props

    if (_.isNil(lastKnownVersion)) {
      this.props.setVersion(process.env.REACT_APP_VERSION)
    } else if (semCompare(process.env.REACT_APP_VERSION, lastKnownVersion) === 1) {
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

    if (prevProps.isLoggedIn !== this.props.isLoggedIn) {
      this.setUpTwitchApi()
    }
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { showSettings, settingSelectedTab } = this.state
    const {
      channel,
      isLoggedIn,
      location,
      autoConnectInDev,
      pauseAutoScroll,
      roomState,
      shouldReadChangelog,
      status,
      theme,
    } = this.props
    const { pathname } = location

    const isLoggingIn = pathname === Page.Login || pathname === Page.Auth

    if (!isLoggedIn && !isLoggingIn) {
      return <Redirect to="/login" />
    } else if (isLoggedIn && isLoggingIn) {
      return <Redirect to="/" />
    }

    const channelState = { pauseAutoScroll, roomState }

    return (
      <ThemeProvider theme={theme === Theme.Dark ? dark : light}>
        <FlexLayout vertical>
          <Header
            autoConnectInDev={autoConnectInDev}
            channel={channel}
            goHome={this.goHome}
            highlightChangelog={shouldReadChangelog}
            isLoggedIn={isLoggedIn}
            logout={this.props.resetUser}
            page={pathname}
            channelState={channelState}
            status={status}
            toggleAutoConnectInDev={this.props.toggleAutoConnectInDev}
            toggleChangelog={this.toggleChangelog}
            toggleChatters={this.props.toggleChatters}
            toggleSettings={this.toggleSettings}
          />
          <Settings visible={showSettings} toggle={this.toggleSettings} defaultTab={settingSelectedTab} />
          <FlexContent>
            <Switch>
              <Route exact path="/" component={Follows} />
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
   * Sets up the Twitch API.
   */
  private setUpTwitchApi() {
    const { loginDetails } = this.props

    if (!_.isNil(loginDetails)) {
      Twitch.setAuthDetails(loginDetails.id, loginDetails.password)
    } else {
      Twitch.setAuthDetails(null)
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
    autoConnectInDev: getAutoConnectInDev(state),
    channel: getChannel(state),
    isLoggedIn: getIsLoggedIn(state),
    lastKnownVersion: getLastKnownVersion(state),
    loginDetails: getLoginDetails(state),
    pauseAutoScroll: getPauseAutoScroll(state),
    roomState: getRoomState(state),
    shouldReadChangelog: getShouldReadChangelog(state),
    status: getStatus(state),
    theme: getTheme(state),
  }),
  { resetUser, setVersion, setShouldReadChangelog, toggleAutoConnectInDev, toggleChatters }
)(App)

/**
 * React Props.
 */
type StateProps = {
  autoConnectInDev: SettingsState['autoConnectInDev']
  channel: AppState['channel']
  isLoggedIn: ReturnType<typeof getIsLoggedIn>
  lastKnownVersion: SettingsState['lastKnownVersion']
  loginDetails: ReturnType<typeof getLoginDetails>
  pauseAutoScroll: ReturnType<typeof getPauseAutoScroll>
  roomState: ReturnType<typeof getRoomState>
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
  toggleAutoConnectInDev: typeof toggleAutoConnectInDev
  toggleChatters: typeof toggleChatters
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
