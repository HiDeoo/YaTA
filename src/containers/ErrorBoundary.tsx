import * as React from 'react'
import { connect } from 'react-redux'

import NonIdealState from 'Components/NonIdealState'
import Page from 'Constants/page'
import { resetUser } from 'Store/ducks/user'
import { ApplicationState } from 'Store/reducers'

/**
 * React State.
 */
const initialState = { hasError: false, error: undefined as Optional<Error> }
type State = Readonly<typeof initialState>

/**
 * ErrorBoundary Component.
 */
class ErrorBoundary extends React.Component<Props, State> {
  public state: State = initialState

  /**
   * Lifecycle: componentDidCatch.
   * @param error - The error.
   */
  public componentDidCatch(error: Error) {
    const { message } = error

    if (
      message.includes('invalid oauth token') ||
      message.includes('Missing token for authenticated request') ||
      message.includes('Login authentication failed')
    ) {
      this.props.resetUser()

      window.location.replace(Page.Login)
    } else {
      this.setState(() => ({ hasError: true, error }))

      // tslint:disable-next-line:no-console
      console.error(error)
    }
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { hasError } = this.state

    if (hasError) {
      return <NonIdealState details="Try reloading the application." />
    }

    return this.props.children
  }
}

export default connect<{}, DispatchProps, OwnProps, ApplicationState>(
  null,
  { resetUser }
)(ErrorBoundary)

/**
 * React Props.
 */
interface DispatchProps {
  resetUser: typeof resetUser
}

/**
 * React Props.
 */
interface OwnProps {
  children: React.ReactNode
}

/**
 * React Props.
 */
type Props = DispatchProps & OwnProps
