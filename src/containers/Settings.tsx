import { Classes, Dialog, Switch } from '@blueprintjs/core'
import * as React from 'react'
import { connect } from 'react-redux'

import Theme from 'Constants/theme'
import { SettingsState, toggleTheme } from 'Store/ducks/settings'
import { ApplicationState } from 'Store/reducers'
import { getTheme } from 'Store/selectors/settings'

/**
 * Settings Component.
 */
class Settings extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    return (
      <Dialog isOpen={this.props.visible} onClose={this.props.toggle} icon="cog" title="Settings">
        <div className={Classes.DIALOG_BODY}>
          <Switch checked={this.props.theme === Theme.Dark} label="Dark theme" onChange={this.props.toggleTheme} />
        </div>
      </Dialog>
    )
  }
}

export default connect<StateProps, DispatchProps, OwnProps, ApplicationState>(
  (state) => ({
    theme: getTheme(state),
  }),
  { toggleTheme }
)(Settings)

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
type OwnProps = {
  toggle: () => void
  visible: boolean
}

/**
 * React Props.
 */
type Props = StateProps & DispatchProps & OwnProps
