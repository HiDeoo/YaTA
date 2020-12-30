import { Component } from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import { Redirect } from 'react-router-dom'
import { compose } from 'recompose'

import Spinner from 'components/Spinner'
import Page from 'constants/page'
import Twitch from 'libs/Twitch'
import { setTokens } from 'store/ducks/user'
import { ApplicationState } from 'store/reducers'
import { getIsLoggedIn } from 'store/selectors/user'

/**
 * React State.
 */
const initialState = { authDidFail: false }
type State = Readonly<typeof initialState>

/**
 * Auth Component.
 */
class Auth extends Component<Props, State> {
  public state: State = initialState

  /**
   * Lifecycle: componentDidMount.
   */
  public async componentDidMount() {
    try {
      const tokens = await Twitch.getAuthTokens(this.props.location.hash)

      const idToken = await Twitch.verifyIdToken(tokens.id)

      if (tokens.redirect) {
        this.props.history.replace(Page.Auth, { redirect: tokens.redirect })
      }

      this.props.setTokens(tokens.access, idToken)
    } catch {
      this.setState(() => ({ authDidFail: true }))
    }
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    if (this.state.authDidFail) {
      return <Redirect to={Page.Login} />
    }

    return <Spinner large />
  }
}

/**
 * Component enhancer.
 */
const enhance = compose<Props, {}>(
  connect<{}, DispatchProps, OwnProps, ApplicationState>(
    (state) => ({
      isLoggedIn: getIsLoggedIn(state),
    }),
    { setTokens }
  ),
  withRouter
)

export default enhance(Auth)

/**
 * React Props.
 */
interface DispatchProps {
  setTokens: typeof setTokens
}

/**
 * React Props.
 */
interface OwnProps {
  location: Location
}

/**
 * React Props.
 */
type Props = DispatchProps & RouteComponentProps<{}>
