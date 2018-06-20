import { Button, Classes } from '@blueprintjs/core'
import * as React from 'react'
import { connect } from 'react-redux'

import Theme from 'Constants/theme'
import { SettingsState, toggleTheme } from 'Store/ducks/settings'
import { ApplicationState } from 'Store/reducers'
import { getTheme } from 'Store/selectors/settings'

/**
 * App Component.
 */
class App extends React.Component<Props> {
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
    return (
      <div>
        <Button onClick={this.props.toggleTheme}>{this.props.theme}</Button>
      </div>
    )
  }

  /**
   * Installs the proper theme.
   */
  private installTheme() {
    if (this.props.theme === Theme.Dark) {
      document.body.classList.add(Classes.DARK)
    } else {
      document.body.classList.remove(Classes.DARK)
    }
  }
}

export default connect<StateProps, DispatchProps, {}, ApplicationState>(
  (state) => ({
    theme: getTheme(state),
  }),
  { toggleTheme }
)(App)

/**
 * React Props.
 */
type StateProps = {
  theme: SettingsState['theme']
}

/**
 * React Props.
 */
type DispatchProps = {
  toggleTheme: typeof toggleTheme
}

/**
 * React Props.
 */
type Props = StateProps & DispatchProps
