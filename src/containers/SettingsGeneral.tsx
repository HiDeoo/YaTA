import { Button, Classes, H5, Intent, Popover } from '@blueprintjs/core'
import * as React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import SettingsPanel from 'Components/SettingsPanel'
import SettingsPanelSection from 'Components/SettingsPanelSection'
import Switch from 'Components/Switch'
import Theme from 'Constants/theme'
import {
  toggleAutoFocusInput,
  toggleCopyMessageOnDoubleClick,
  toggleDisableDialogAnimations,
  toggleHideWhispers,
  toggleShowContextMenu,
  toggleShowViewerCount,
  toggleTheme,
} from 'Store/ducks/settings'
import { ApplicationState } from 'Store/reducers'
import {
  getAutoFocusInput,
  getCopyMessageOnDoubleClick,
  getDisableDialogAnimations,
  getHideWhispers,
  getShowContextMenu,
  getShowViewerCount,
  getTheme,
} from 'Store/selectors/settings'

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
 * SettingsGeneral Component.
 */
class SettingsGeneral extends React.Component<Props> {
  public state: State = initialState

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const {
      autoFocusInput,
      copyMessageOnDoubleClick,
      disableDialogAnimations,
      hideWhispers,
      showContextMenu,
      showViewerCount,
      theme,
    } = this.props
    const { isThemeConfirmationOpened } = this.state

    return (
      <SettingsPanel>
        <SettingsPanelSection title="Features">
          <Switch
            checked={copyMessageOnDoubleClick}
            label="Copy message on double click"
            onChange={this.props.toggleCopyMessageOnDoubleClick}
          />
          <Switch
            description="Menu next to each message to quickly access various actions."
            checked={showContextMenu}
            label="Show context menu"
            onChange={this.props.toggleShowContextMenu}
          />
          <Switch
            description="This only happens when focusing the application."
            checked={autoFocusInput}
            label="Automatically focus the input field"
            onChange={this.props.toggleAutoFocusInput}
          />
        </SettingsPanelSection>
        <SettingsPanelSection title="UI">
          <Popover
            isOpen={isThemeConfirmationOpened}
            popoverClassName={Classes.POPOVER_CONTENT_SIZING}
            usePortal={false}
          >
            <Switch checked={theme === Theme.Dark} label="Dark theme" onChange={this.onToggleTheme} />
            {this.renderThemeConfirmation()}
          </Popover>
          <Switch
            description="Dialogs include the chatter details & chatters list."
            checked={disableDialogAnimations}
            label="Disable dialog animations"
            onChange={this.props.toggleDisableDialogAnimations}
          />
        </SettingsPanelSection>
        <SettingsPanelSection title="Streamer mode">
          <Switch
            description="You will still be able to send whispers."
            checked={hideWhispers}
            label="Hide whispers"
            onChange={this.props.toggleHideWhispers}
          />
          <Switch
            description="Updated every 2mins."
            checked={showViewerCount}
            label="Show viewer count"
            onChange={this.props.toggleShowViewerCount}
          />
        </SettingsPanelSection>
      </SettingsPanel>
    )
  }

  /**
   * Renders the theme confirmation.
   * @return Element to render.
   */
  private renderThemeConfirmation() {
    return (
      <div>
        <H5>Confirm</H5>
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

  /**
   * Triggered when the theme toggling is confirmed.
   */
  private onConfirmToggleTheme = () => {
    this.setState(() => ({ isThemeConfirmationOpened: false }))

    this.props.toggleTheme()
  }
}

export default connect<StateProps, DispatchProps, {}, ApplicationState>(
  (state) => ({
    autoFocusInput: getAutoFocusInput(state),
    copyMessageOnDoubleClick: getCopyMessageOnDoubleClick(state),
    disableDialogAnimations: getDisableDialogAnimations(state),
    hideWhispers: getHideWhispers(state),
    showContextMenu: getShowContextMenu(state),
    showViewerCount: getShowViewerCount(state),
    theme: getTheme(state),
  }),
  {
    toggleAutoFocusInput,
    toggleCopyMessageOnDoubleClick,
    toggleDisableDialogAnimations,
    toggleHideWhispers,
    toggleShowContextMenu,
    toggleShowViewerCount,
    toggleTheme,
  }
)(SettingsGeneral)

/**
 * React Props.
 */
type StateProps = {
  autoFocusInput: ReturnType<typeof getAutoFocusInput>
  copyMessageOnDoubleClick: ReturnType<typeof getCopyMessageOnDoubleClick>
  disableDialogAnimations: ReturnType<typeof getDisableDialogAnimations>
  hideWhispers: ReturnType<typeof getHideWhispers>
  showContextMenu: ReturnType<typeof getShowContextMenu>
  showViewerCount: ReturnType<typeof getShowViewerCount>
  theme: ReturnType<typeof getTheme>
}

/**
 * React Props.
 */
type DispatchProps = {
  toggleAutoFocusInput: typeof toggleAutoFocusInput
  toggleCopyMessageOnDoubleClick: typeof toggleCopyMessageOnDoubleClick
  toggleDisableDialogAnimations: typeof toggleDisableDialogAnimations
  toggleHideWhispers: typeof toggleHideWhispers
  toggleShowContextMenu: typeof toggleShowContextMenu
  toggleShowViewerCount: typeof toggleShowViewerCount
  toggleTheme: typeof toggleTheme
}

/**
 * React Props.
 */
type Props = StateProps & DispatchProps
