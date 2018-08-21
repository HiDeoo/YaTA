import { Classes, Colors } from '@blueprintjs/core'
import bowser from 'bowser'
import { History } from 'history'
import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { Redirect, Route, Switch } from 'react-router-dom'
import * as semCompare from 'semver-compare'

import FlexContent from 'Components/FlexContent'
import FlexLayout from 'Components/FlexLayout'
import Header, { defaultHeaderConfiguration, HeaderProvider } from 'Components/Header'
import Login from 'Components/Login'
import Settings, { SettingsTab } from 'Components/Settings'
import Page from 'Constants/page'
import Theme from 'Constants/theme'
import { ToggleableUI } from 'Constants/toggleable'
import Auth from 'Containers/Auth'
import Channel from 'Containers/Channel'
import Follows from 'Containers/Follows'
import Twitch from 'Libs/Twitch'
import { setShouldReadChangelog } from 'Store/ducks/app'
import { setVersion } from 'Store/ducks/settings'
import { resetUser } from 'Store/ducks/user'
import { ApplicationState } from 'Store/reducers'
import { getShouldReadChangelog, getStatus } from 'Store/selectors/app'
import { getLastKnownVersion, getTheme } from 'Store/selectors/settings'
import { getIsLoggedIn, getLoginDetails } from 'Store/selectors/user'
import { ThemeProvider } from 'Styled'
import dark from 'Styled/dark'
import light from 'Styled/light'

/**
 * React State.
 */
const initialState = {
  headerConfiguration: defaultHeaderConfiguration,
  settingSelectedTab: SettingsTab.General,
  [ToggleableUI.Settings]: false,
}
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

    this.state = {
      ...initialState,
      headerConfiguration: {
        ...initialState.headerConfiguration,
        setRightComponent: (component) => {
          this.setState(({ headerConfiguration }) => ({
            headerConfiguration: { ...headerConfiguration, rightComponent: component },
          }))
        },
        setTitleComponent: (component) => {
          this.setState(({ headerConfiguration }) => ({
            headerConfiguration: { ...headerConfiguration, titleComponent: component },
          }))
        },
      },
    }

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
    const { isLoggedIn, location, shouldReadChangelog, status, theme } = this.props
    const { settingSelectedTab, [ToggleableUI.Settings]: showSettings } = this.state
    const { pathname } = location

    const isLoggingIn = pathname === Page.Login || pathname === Page.Auth

    if (!isLoggedIn && !isLoggingIn) {
      return <Redirect to={Page.Login} />
    } else if (isLoggedIn && isLoggingIn) {
      return <Redirect to={Page.Home} />
    }

    return (
      <ThemeProvider theme={theme === Theme.Dark ? dark : light}>
        <HeaderProvider value={this.state.headerConfiguration}>
          <FlexLayout vertical>
            <Header
              goHome={this.goHome}
              highlightChangelog={shouldReadChangelog}
              isLoggedIn={isLoggedIn}
              logout={this.props.resetUser}
              page={pathname}
              reportBug={this.reportBug}
              status={status}
              toggleChangelog={this.toggleChangelog}
              toggleSettings={this.toggleSettings}
            />
            <Settings visible={showSettings} toggle={this.toggleSettings} defaultTab={settingSelectedTab} />
            <FlexContent>
              <Switch>
                <Route exact path={Page.Home} component={Follows} />
                <Route path={Page.Auth} component={Auth} />
                <Route path={Page.Login} component={Login} />
                <Route path={Page.Channel} component={Channel} />
              </Switch>
            </FlexContent>
          </FlexLayout>
        </HeaderProvider>
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
    this.setState(({ [ToggleableUI.Settings]: showSettings }) => ({
      settingSelectedTab: SettingsTab.General,
      [ToggleableUI.Settings]: !showSettings,
    }))
  }

  /**
   * Toggles the changelog panel.
   */
  private toggleChangelog = () => {
    this.setState(({ [ToggleableUI.Settings]: showSettings }) => ({
      settingSelectedTab: SettingsTab.Changelog,
      [ToggleableUI.Settings]: !showSettings,
    }))
  }

  /**
   * Navigates to the homepage.
   * @param event - The associated event.
   */
  private goHome = (event: React.MouseEvent<HTMLElement>) => {
    if (event.ctrlKey || event.metaKey || event.button === 1) {
      window.open('/')
    } else {
      this.props.history.push(Page.Home)
    }
  }

  /**
   * Opens the report issue page on Github.
   */
  private reportBug = () => {
    const { REACT_APP_BUGS_URL, REACT_APP_VERSION } = process.env
    const {
      parsedResult: { browser, os },
    } = bowser.getParser(window.navigator.userAgent)

    const body = `<!---
Thanks for filing an issue 😄 !
Please provide as much details as possible, including screenshots if necessary.
-->

**Describe the bug**

A clear and concise description of what the bug is.

**To Reproduce**

Steps to reproduce the behavior:

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**

A clear and concise description of what you expected to happen.

**Screenshots**

If applicable, add screenshots to help explain your problem.

**Environment**

| Software         | Version
| ---------------- | -------
| YaTA             | ${REACT_APP_VERSION}
| Browser          | ${browser.name} ${browser.version}
| Operating System | ${os.name} ${os.version || ''}`

    window.open(`${REACT_APP_BUGS_URL}/new?body=${encodeURIComponent(body)}`)
  }
}

export default connect<StateProps, DispatchProps, OwnProps, ApplicationState>(
  (state) => ({
    isLoggedIn: getIsLoggedIn(state),
    lastKnownVersion: getLastKnownVersion(state),
    loginDetails: getLoginDetails(state),
    shouldReadChangelog: getShouldReadChangelog(state),
    status: getStatus(state),
    theme: getTheme(state),
  }),
  { resetUser, setVersion, setShouldReadChangelog }
)(App)

/**
 * React Props.
 */
interface StateProps {
  isLoggedIn: ReturnType<typeof getIsLoggedIn>
  lastKnownVersion: ReturnType<typeof getLastKnownVersion>
  loginDetails: ReturnType<typeof getLoginDetails>
  shouldReadChangelog: ReturnType<typeof getShouldReadChangelog>
  status: ReturnType<typeof getStatus>
  theme: ReturnType<typeof getTheme>
}

/**
 * React Props.
 */
interface DispatchProps {
  resetUser: typeof resetUser
  setShouldReadChangelog: typeof setShouldReadChangelog
  setVersion: typeof setVersion
}

/**
 * React Props.
 */
interface OwnProps {
  history: History
  location: Location
}

/**
 * React Props.
 */
type Props = StateProps & DispatchProps & OwnProps
