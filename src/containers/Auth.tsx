import { Spinner } from '@blueprintjs/core'
import * as React from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'

import Center from 'Components/Center'
import Twitch from 'Libs/Twitch'
import { setTokens } from 'Store/ducks/user'
import { ApplicationState } from 'Store/reducers'
import { getIsLoggedIn } from 'Store/selectors/user'

/**
 * Auth Component.
 */
class Auth extends React.Component<Props> {
  /**
   * Lifecycle: componentDidMount.
   */
  public componentDidMount() {
    const tokens = Twitch.getAuthTokens(this.props.location.hash)

    this.props.setTokens(tokens.access, tokens.id)
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    if (this.props.isLoggedIn) {
      return <Redirect to="/" />
    }

    return (
      <Center>
        <Spinner large />
      </Center>
    )
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
type StateProps = {
  isLoggedIn: ReturnType<typeof getIsLoggedIn>
}

/**
 * React Props.
 */
type DispatchProps = {
  setTokens: typeof setTokens
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
