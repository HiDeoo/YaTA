import { Classes, Colors } from '@blueprintjs/core'
import { HotkeysTarget } from '@blueprintjs/core/lib/esnext/components/hotkeys/hotkeysTarget'
import type { History, Location } from 'history'
import _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { Redirect, Route, Switch } from 'react-router-dom'
import { compose } from 'recompose'
import semCompare from 'semver-compare'

import FlexContent from 'components/FlexContent'
import FlexLayout from 'components/FlexLayout'
import GlobalStyle from 'components/GlobalStyle'
import Header, { defaultHeaderConfiguration, HeaderProvider } from 'components/Header'
import Login from 'components/Login'
import Settings, { SettingsViewName } from 'components/Settings'
import Page from 'constants/page'
import { ShortcutImplementations, ShortcutType } from 'constants/shortcut'
import Theme from 'constants/theme'
import { ToggleableUI } from 'constants/toggleable'
import Auth from 'containers/Auth'
import Channel from 'containers/Channel'
import StreamList from 'containers/StreamList'
import Twitch from 'libs/Twitch'
import { setShouldReadChangelog } from 'store/ducks/app'
import { setVersion, toggleHideHeader } from 'store/ducks/settings'
import { resetUser } from 'store/ducks/user'
import { ApplicationState } from 'store/reducers'
import { getShouldReadChangelog, getStatus } from 'store/selectors/app'
import { getHideHeader, getLastKnownVersion, getShortcuts, getTheme } from 'store/selectors/settings'
import { getIsLoggedIn, getLoginDetails } from 'store/selectors/user'
import { ThemeProvider } from 'styled'
import dark from 'styled/dark'
import light from 'styled/light'
import { reportBug } from 'utils/bugs'
import { renderShorcuts } from 'utils/shortcuts'

/**
 * React State.
 */
const initialState = {
  headerConfiguration: defaultHeaderConfiguration,
  settingDefaultView: undefined as Optional<SettingsViewName>,
  [ToggleableUI.Settings]: false,
}
type State = Readonly<typeof initialState>

/**
 * App Component.
 */
class App extends React.Component<Props, State> {
  public state: State = initialState
  private shortcuts: ShortcutImplementations

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

    this.shortcuts = [
      { type: ShortcutType.OpenSettings, action: this.toggleSettings },
      { type: ShortcutType.NavigateHome, action: this.goHome },
      { type: ShortcutType.NavigateOwnChannel, action: this.goOwnChannel },
      { type: ShortcutType.HiDeHeader, action: this.toggleHeader },
    ]

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
    const { hideHeader, isLoggedIn, location, shouldReadChangelog, status, theme } = this.props
    const { settingDefaultView, [ToggleableUI.Settings]: showSettings } = this.state
    const { pathname } = location

    const isLoggingIn = pathname === Page.Login || pathname === Page.Auth

    if (!isLoggedIn && !isLoggingIn) {
      return (
        <Redirect
          to={{
            pathname: Page.Login,
            state: pathname !== Page.Home ? { redirect: pathname } : undefined,
          }}
        />
      )
    } else if (isLoggedIn && isLoggingIn) {
      return <Redirect to={location.state?.redirect ?? Page.Home} />
    }

    return (
      <ThemeProvider theme={theme === Theme.Dark ? dark : light}>
        <HeaderProvider value={this.state.headerConfiguration}>
          <GlobalStyle />
          <FlexLayout vertical>
            <Header
              goHome={this.goHome}
              highlightChangelog={shouldReadChangelog}
              isLoggedIn={isLoggedIn}
              logout={this.props.resetUser}
              page={pathname}
              status={status}
              toggleChangelog={this.toggleChangelog}
              toggleSettings={this.toggleSettings}
              hidden={hideHeader}
            />
            <Settings
              defaultView={settingDefaultView}
              toggle={this.toggleSettings}
              visible={showSettings}
              reportBug={reportBug}
            />
            <FlexContent>
              <Switch>
                <Route exact path={Page.Home} component={StreamList} />
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
   * Renders the shortcuts.
   * @return Element to render.
   */
  public renderHotkeys() {
    return renderShorcuts(this.props.shortcuts, this.shortcuts, true, this.state[ToggleableUI.Settings])
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
      settingDefaultView: undefined,
      [ToggleableUI.Settings]: !showSettings,
    }))
  }

  /**
   * Toggles the header.
   */
  private toggleHeader = () => {
    this.props.toggleHideHeader()
  }

  /**
   * Toggles the changelog panel.
   */
  private toggleChangelog = () => {
    this.setState(({ [ToggleableUI.Settings]: showSettings }) => ({
      settingDefaultView: SettingsViewName.Changelog,
      [ToggleableUI.Settings]: !showSettings,
    }))
  }

  /**
   * Navigates to the homepage.
   * @param event - The associated event.
   */
  private goHome = (event?: React.MouseEvent<HTMLElement>) => {
    if (!_.isNil(event) && (event.ctrlKey || event.metaKey || event.button === 1)) {
      window.open('/')
    } else {
      this.props.history.push(Page.Home)
    }
  }

  /**
   * Navigates to your own channel.
   */
  private goOwnChannel = () => {
    const { history, loginDetails } = this.props

    if (!_.isNil(loginDetails)) {
      const path = `/${loginDetails.username}`

      if (history.location.pathname !== path) {
        history.push(`/${loginDetails.username}`)
      }
    }
  }
}

/**
 * Component enhancer.
 */
const enhance = compose<Props, {}>(
  connect<StateProps, DispatchProps, OwnProps, ApplicationState>(
    (state) => ({
      hideHeader: getHideHeader(state),
      isLoggedIn: getIsLoggedIn(state),
      lastKnownVersion: getLastKnownVersion(state),
      loginDetails: getLoginDetails(state),
      shortcuts: getShortcuts(state),
      shouldReadChangelog: getShouldReadChangelog(state),
      status: getStatus(state),
      theme: getTheme(state),
    }),
    { resetUser, setVersion, setShouldReadChangelog, toggleHideHeader }
  ),
  HotkeysTarget
)

export default enhance(App)

/**
 * React Props.
 */
interface StateProps {
  hideHeader: ReturnType<typeof getHideHeader>
  isLoggedIn: ReturnType<typeof getIsLoggedIn>
  lastKnownVersion: ReturnType<typeof getLastKnownVersion>
  loginDetails: ReturnType<typeof getLoginDetails>
  shortcuts: ReturnType<typeof getShortcuts>
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
  toggleHideHeader: typeof toggleHideHeader
}

/**
 * React Props.
 */
interface OwnProps {
  history: History
  location: Location<Optional<{ redirect: string }>>
}

/**
 * React Props.
 */
type Props = StateProps & DispatchProps & OwnProps
