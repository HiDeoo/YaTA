import { Button, Classes, Dialog, Intent, Popover, Switch } from '@blueprintjs/core'
import * as React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import Theme from 'Constants/theme'
import { SettingsState, toggleTheme } from 'Store/ducks/settings'
import { ApplicationState } from 'Store/reducers'
import { getTheme } from 'Store/selectors/settings'

/**
 * ConfirmationControls component.
 */
const ConfirmationControls = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
`

/**
 * ConfirmationCancelButton component.
 */
const ConfirmationCancelButton = styled(Button)`
  margin-right: 10px;
`

/**
 * React State.
 */
const initialState = { isThemeConfirmationOpened: false }
type State = Readonly<typeof initialState>

/**
 * Settings Component.
 */
class Settings extends React.Component<Props, State> {
  public state: State = initialState

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { theme, visible } = this.props

    return (
      <Dialog isOpen={visible} onClose={this.onClose} icon="cog" title="Settings">
        <div className={Classes.DIALOG_BODY}>
          <Popover isOpen={this.state.isThemeConfirmationOpened} popoverClassName={Classes.POPOVER_CONTENT_SIZING}>
            <Switch checked={theme === Theme.Dark} label="Dark theme" onChange={this.onToggleTheme} />
            {this.renderThemeConfirmation()}
          </Popover>
        </div>
      </Dialog>
    )
  }

  /**
   * Triggered when the settings should be closed.
   */
  private onClose = () => {
    if (!this.state.isThemeConfirmationOpened) {
      this.setState(() => initialState)

      this.props.toggle()
    }
  }

  /**
   * Renders the theme confirmation.
   * @return Element to render.
   */
  private renderThemeConfirmation() {
    return (
      <div>
        <h5>Confirm</h5>
        <p>Are you sure you want to switch to the light theme? You might lose your eyes.</p>
        <ConfirmationControls>
          <ConfirmationCancelButton className={Classes.POPOVER_DISMISS} onClick={this.onCancelToggleTheme}>
            Cancel
          </ConfirmationCancelButton>
          <Button intent={Intent.DANGER} className={Classes.POPOVER_DISMISS} onClick={this.onConfirmToggleTheme}>
            Confirm
          </Button>
        </ConfirmationControls>
      </div>
    )
  }

  /**
   * Triggered when the theme toggling is confirmed.
   */
  private onConfirmToggleTheme = () => {
    this.setState(() => ({ isThemeConfirmationOpened: false }))
    this.props.toggleTheme()
  }

  /**
   * Triggered when the theme toggling is cancelled.
   */
  private onCancelToggleTheme = () => {
    this.setState(() => ({ isThemeConfirmationOpened: false }))
  }

  /**
   * Triggered when the theme is toggled.
   */
  private onToggleTheme = () => {
    if (this.props.theme === Theme.Dark) {
      this.setState(() => ({ isThemeConfirmationOpened: true }))
    } else {
      this.props.toggleTheme()
    }
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
