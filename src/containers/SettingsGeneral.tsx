import { Button, Classes, Code, H5, Intent, Popover } from '@blueprintjs/core'
import { Component } from 'react'
import { connect } from 'react-redux'

import SettingsView from 'components/SettingsView'
import SettingsViewSection from 'components/SettingsViewSection'
import Switch from 'components/Switch'
import Theme from 'constants/theme'
import {
  toggleAddWhispersToHistory,
  toggleAlternateMessageBackgrounds,
  toggleAutoFocusInput,
  toggleCopyMessageOnDoubleClick,
  toggleDisableDialogAnimations,
  toggleHideVIPBadges,
  toggleHighlightAllMentions,
  toggleMarkNewAsUnread,
  togglePrioritizeUsernames,
  toggleShowContextMenu,
  toggleTheme,
} from 'store/ducks/settings'
import { ApplicationState } from 'store/reducers'
import {
  getAddWhispersToHistory,
  getAlternateMessageBackgrounds,
  getAutoFocusInput,
  getCopyMessageOnDoubleClick,
  getDisableDialogAnimations,
  getHideVIPBadges,
  getHighlightAllMentions,
  getMarkNewAsUnread,
  getPrioritizeUsernames,
  getShowContextMenu,
  getTheme,
} from 'store/selectors/settings'
import styled from 'styled'

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
class SettingsGeneral extends Component<Props, State> {
  public state: State = initialState

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const {
      addWhispersToHistory,
      alternateMessageBackgrounds,
      autoFocusInput,
      copyMessageOnDoubleClick,
      disableDialogAnimations,
      hideVIPBadges,
      highlightAllMentions,
      markNewAsUnread,
      prioritizeUsernames,
      showContextMenu,
      theme,
    } = this.props
    const { isThemeConfirmationOpened } = this.state

    return (
      <SettingsView>
        <SettingsViewSection title="Features">
          <Switch
            onChange={this.props.toggleCopyMessageOnDoubleClick}
            label="Copy message on double click"
            checked={copyMessageOnDoubleClick}
          />
          <Switch
            description="Menu next to each message to quickly access various actions."
            onChange={this.props.toggleShowContextMenu}
            checked={showContextMenu}
            label="Show context menu"
          />
          <Switch
            description="This only happens when focusing the application."
            label="Automatically focus the input field"
            onChange={this.props.toggleAutoFocusInput}
            checked={autoFocusInput}
          />
          <Switch
            description="Other people mentioned are highlighted differently from yourself."
            checked={highlightAllMentions}
            onChange={this.props.toggleHighlightAllMentions}
            label="Highlight all mentions"
          />
          <Switch
            description="Usernames will be auto-completed before emotes when enabled."
            label="Prioritize usernames when auto-completing"
            onChange={this.props.togglePrioritizeUsernames}
            checked={prioritizeUsernames}
          />
          <Switch
            description="When enabled, VIP badges are hidden except in your own channel."
            onChange={this.props.toggleHideVIPBadges}
            checked={hideVIPBadges}
            label="Hide VIP badges"
          />
          <Switch
            description={
              <>
                The <Code>⬆</Code> & <Code>⬇</Code> history will include your manually sent whispers.
              </>
            }
            onChange={this.props.toggleAddWhispersToHistory}
            checked={addWhispersToHistory}
            label="Add whispers to history"
          />
          <Switch
            description="Interacting or clicking on a message will mark it (and all previous unread messages) as read."
            onChange={this.props.toggleMarkNewAsUnread}
            checked={markNewAsUnread}
            label="Mark new messages as unread"
          />
        </SettingsViewSection>
        <SettingsViewSection title="UI">
          <Popover
            popoverClassName={Classes.POPOVER_CONTENT_SIZING}
            isOpen={isThemeConfirmationOpened}
            usePortal={false}
          >
            <Switch checked={theme === Theme.Dark} label="Dark theme" onChange={this.onToggleTheme} />
            {this.renderThemeConfirmation()}
          </Popover>
          <Switch
            onChange={this.props.toggleAlternateMessageBackgrounds}
            label="Alternate message background colors"
            checked={alternateMessageBackgrounds}
          />
          <Switch
            description="Dialogs include the chatter details & chatters list."
            onChange={this.props.toggleDisableDialogAnimations}
            checked={disableDialogAnimations}
            label="Disable dialog animations"
          />
        </SettingsViewSection>
      </SettingsView>
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
    addWhispersToHistory: getAddWhispersToHistory(state),
    alternateMessageBackgrounds: getAlternateMessageBackgrounds(state),
    autoFocusInput: getAutoFocusInput(state),
    copyMessageOnDoubleClick: getCopyMessageOnDoubleClick(state),
    disableDialogAnimations: getDisableDialogAnimations(state),
    hideVIPBadges: getHideVIPBadges(state),
    highlightAllMentions: getHighlightAllMentions(state),
    markNewAsUnread: getMarkNewAsUnread(state),
    prioritizeUsernames: getPrioritizeUsernames(state),
    showContextMenu: getShowContextMenu(state),
    theme: getTheme(state),
  }),
  {
    toggleAddWhispersToHistory,
    toggleAlternateMessageBackgrounds,
    toggleAutoFocusInput,
    toggleCopyMessageOnDoubleClick,
    toggleDisableDialogAnimations,
    toggleHideVIPBadges,
    toggleHighlightAllMentions,
    toggleMarkNewAsUnread,
    togglePrioritizeUsernames,
    toggleShowContextMenu,
    toggleTheme,
  }
)(SettingsGeneral)

/**
 * React Props.
 */
interface StateProps {
  addWhispersToHistory: ReturnType<typeof getAddWhispersToHistory>
  alternateMessageBackgrounds: ReturnType<typeof getAlternateMessageBackgrounds>
  autoFocusInput: ReturnType<typeof getAutoFocusInput>
  copyMessageOnDoubleClick: ReturnType<typeof getCopyMessageOnDoubleClick>
  disableDialogAnimations: ReturnType<typeof getDisableDialogAnimations>
  hideVIPBadges: ReturnType<typeof getHideVIPBadges>
  highlightAllMentions: ReturnType<typeof getHighlightAllMentions>
  markNewAsUnread: ReturnType<typeof getMarkNewAsUnread>
  prioritizeUsernames: ReturnType<typeof getPrioritizeUsernames>
  showContextMenu: ReturnType<typeof getShowContextMenu>
  theme: ReturnType<typeof getTheme>
}

/**
 * React Props.
 */
interface DispatchProps {
  toggleAddWhispersToHistory: typeof toggleAddWhispersToHistory
  toggleAlternateMessageBackgrounds: typeof toggleAlternateMessageBackgrounds
  toggleAutoFocusInput: typeof toggleAutoFocusInput
  toggleCopyMessageOnDoubleClick: typeof toggleCopyMessageOnDoubleClick
  toggleDisableDialogAnimations: typeof toggleDisableDialogAnimations
  toggleHideVIPBadges: typeof toggleHideVIPBadges
  toggleHighlightAllMentions: typeof toggleHighlightAllMentions
  toggleMarkNewAsUnread: typeof toggleMarkNewAsUnread
  togglePrioritizeUsernames: typeof togglePrioritizeUsernames
  toggleShowContextMenu: typeof toggleShowContextMenu
  toggleTheme: typeof toggleTheme
}

/**
 * React Props.
 */
type Props = StateProps & DispatchProps
