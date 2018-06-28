import { Classes, Colors } from '@blueprintjs/core'
import * as React from 'react'
import { connect } from 'react-redux'
import { Redirect, Route, Switch } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'

import Channels from 'Components/Channels'
import FlexContent from 'Components/FlexContent'
import FlexLayout from 'Components/FlexLayout'
import Header from 'Components/Header'
import Login from 'Components/Login'
import Theme from 'Constants/theme'
import Auth from 'Containers/Auth'
import Channel from 'Containers/Channel'
import Settings from 'Containers/Settings'
import { AppState } from 'Store/ducks/app'
import { SettingsState } from 'Store/ducks/settings'
import { resetUser } from 'Store/ducks/user'
import { ApplicationState } from 'Store/reducers'
import { getChannel, getStatus } from 'Store/selectors/app'
import { getTheme } from 'Store/selectors/settings'
import { getIsLoggedIn } from 'Store/selectors/user'
import dark from 'Styled/dark'
import light from 'Styled/light'

/**
 * React State.
 */
const initialState = { showSettings: false }
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
    const { showSettings } = this.state
    const { isLoggedIn, theme } = this.props

    const isLoggingIn = this.isLoginPage() || this.isAuthPage()

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
            isLoggedIn={isLoggedIn}
            channel={this.props.channel}
            logout={this.props.resetUser}
            status={this.props.status}
          />
          <Settings visible={showSettings} toggle={this.toggleSettings} />
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
    this.setState(({ showSettings }) => ({ showSettings: !showSettings }))
  }

  /**
   * Returns if the user is currently browsing the login page.
   * @return `true` if on the login page.
   */
  private isLoginPage() {
    return this.props.location.pathname === '/login'
  }

  /**
   * Returns if the user is currently browsing the auth page.
   * @return `true` if on the auth page.
   */
  private isAuthPage() {
    return this.props.location.pathname === '/auth'
  }
}

export default connect<StateProps, DispatchProps, OwnProps, ApplicationState>(
  (state) => ({
    channel: getChannel(state),
    isLoggedIn: getIsLoggedIn(state),
    status: getStatus(state),
    theme: getTheme(state),
  }),
  { resetUser }
)(App)

/**
 * React Props.
 */
type StateProps = {
  channel: AppState['channel']
  isLoggedIn: ReturnType<typeof getIsLoggedIn>
  status: AppState['status']
  theme: SettingsState['theme']
}

/**
 * React Props.
 */
type DispatchProps = {
  resetUser: typeof resetUser
}

/**
 * React Props.
 */
type OwnProps = {
  location: Location
}

/**
 * React Props.
 */
type Props = StateProps & DispatchProps & OwnProps
