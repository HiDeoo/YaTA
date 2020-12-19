import { Component } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'

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
      const tokens = Twitch.getAuthTokens(this.props.location.hash)

      const idToken = await Twitch.verifyIdToken(tokens.id)

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
    } else if (this.props.isLoggedIn) {
      return <Redirect to={Page.Home} />
    }

    return <Spinner large />
  }
}

export default connect<StateProps, DispatchProps, OwnProps, ApplicationState>(
  (state) => ({
    isLoggedIn: getIsLoggedIn(state),
  }),
  { setTokens }
)(Auth)

/**
 * React Props.
 */
interface StateProps {
  isLoggedIn: ReturnType<typeof getIsLoggedIn>
}

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
type Props = StateProps & DispatchProps & OwnProps
