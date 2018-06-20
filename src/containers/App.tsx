import { Button } from '@blueprintjs/core'
import * as React from 'react'
import { connect } from 'react-redux'

import { AppState, updateTest } from 'Store/ducks/app'
import { ApplicationState } from 'Store/reducers'
import { getTest } from 'Store/selectors/app'

/**
 * App Component.
 */
class App extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    return (
      <div>
        <Button onClick={this.props.updateTest}>{this.props.test}</Button>
      </div>
    )
  }
}

/**
 * React Props.
 */
type Props = {
  test: AppState['test']
  updateTest: typeof updateTest
}

export default connect(
  (state: ApplicationState) => ({
    test: getTest(state),
  }),
  { updateTest }
)(App)
