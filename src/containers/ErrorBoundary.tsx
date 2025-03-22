import { Button, Intent } from '@blueprintjs/core'
import _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'

import NonIdealState from 'components/NonIdealState'
import Page from 'constants/page'
import { resetUser } from 'store/ducks/user'
import { ApplicationState } from 'store/reducers'
import styled from 'styled'
import { reportError } from 'utils/bugs'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  height: 100vh;
`

/**
 * Extra component.
 */
const Extra = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 10px;

  & > button {
    display: block;
    margin-bottom: 10px;
  }
`

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
    const messageNormalized = message.toLowerCase()

    if (
      messageNormalized.includes('invalid oauth token') ||
      messageNormalized.includes('missing token for authenticated request') ||
      messageNormalized.includes('login authentication failed')
    ) {
      this.props.resetUser()

      window.location.replace(Page.Login)
    } else {
      this.setState(() => ({ hasError: true, error }))

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
      return (
        <Wrapper>
          <NonIdealState
            details="Try reloading the application."
            extra={
              <Extra>
                <Button icon="refresh" text="Reload & Report" intent={Intent.PRIMARY} onClick={this.reloadAndReport} />
                <Button icon="refresh" text="Reload" onClick={this.reload} />
              </Extra>
            }
          />
        </Wrapper>
      )
    }

    return this.props.children
  }

  /**
   * Reloads the application and prepare a bug report.
   */
  private reloadAndReport = () => {
    const { error } = this.state

    if (!_.isNil(error)) {
      reportError(error)
    }

    this.reload()
  }

  /**
   * Reloads the application.
   */
  private reload = () => {
    window.location.reload()
  }
}

export default connect<{}, DispatchProps, OwnProps, ApplicationState>(null, { resetUser })(ErrorBoundary)

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
