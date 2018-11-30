import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'

import NumericInput from 'Components/NumericInput'
import SettingsNotificationSound from 'Components/SettingsNotificationSound'
import SettingsView from 'Components/SettingsView'
import SettingsViewSection from 'Components/SettingsViewSection'
import SoundNotification from 'Constants/soundNotification'
import {
  toggleSoundNotification,
  updateAutoHostThreshold,
  updateHostThreshold,
  updateSoundNotificationVolume,
} from 'Store/ducks/settings'
import { ApplicationState } from 'Store/reducers'
import { getAutoHostThreshold, getHostThreshold, getSoundSettings } from 'Store/selectors/settings'

/**
 * SettingsNotifications Component.
 */
class SettingsNotifications extends React.Component<Props> {
  private hostThresholdInput = React.createRef<NumericInput>()
  private autoHostThresholdInput = React.createRef<NumericInput>()

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { autoHostThreshold, hostThreshold, soundSettings } = this.props

    return (
      <SettingsView>
        <SettingsViewSection title="Sound">
          <SettingsNotificationSound
            changeVolume={this.props.updateSoundNotificationVolume}
            settings={soundSettings[SoundNotification.Mention]}
            toggle={this.props.toggleSoundNotification}
            notification={SoundNotification.Mention}
            label="Play sound on mentions"
          />
          <SettingsNotificationSound
            changeVolume={this.props.updateSoundNotificationVolume}
            settings={soundSettings[SoundNotification.Whisper]}
            toggle={this.props.toggleSoundNotification}
            notification={SoundNotification.Whisper}
            label="Play sound on whispers"
          />
          <SettingsNotificationSound
            changeVolume={this.props.updateSoundNotificationVolume}
            description="Your own messages and bots will not trigger any sound."
            settings={soundSettings[SoundNotification.Message]}
            toggle={this.props.toggleSoundNotification}
            notification={SoundNotification.Message}
            label="Play sound on messages"
          />
        </SettingsViewSection>
        <SettingsViewSection title="Hosts">
          <NumericInput
            description="Hosts with less viewers will be ignored."
            onValueChange={this.onChangeHostThreshold}
            onBlur={this.onBlurHostThreshold}
            ref={this.hostThresholdInput}
            label="Host threshold"
            value={hostThreshold}
            minorStepSize={1}
            min={0}
          />
          <NumericInput
            description="Auto-hosts with less viewers will be ignored."
            onValueChange={this.onChangeAutoHostThreshold}
            onBlur={this.onBlurAutoHostThreshold}
            ref={this.autoHostThresholdInput}
            label="Auto-host threshold"
            value={autoHostThreshold}
            minorStepSize={1}
            min={0}
          />
        </SettingsViewSection>
      </SettingsView>
    )
  }

  /**
   * Triggered when the host threshold input is blurred.
   */
  private onBlurHostThreshold = () => {
    if (!_.isNil(this.hostThresholdInput.current)) {
      this.hostThresholdInput.current.forceUpdate()
    }
  }

  /**
   * Triggered when the host threshold is changed.
   * @param numberValue - The new numeric value.
   */
  private onChangeHostThreshold = (numberValue: number) => {
    if (!_.isNaN(numberValue) && _.isInteger(numberValue) && numberValue > 0) {
      this.props.updateHostThreshold(numberValue)
    }
  }

  /**
   * Triggered when the auto-host threshold input is blurred.
   */
  private onBlurAutoHostThreshold = () => {
    if (!_.isNil(this.autoHostThresholdInput.current)) {
      this.autoHostThresholdInput.current.forceUpdate()
    }
  }

  /**
   * Triggered when the auto-host threshold is changed.
   * @param numberValue - The new numeric value.
   */
  private onChangeAutoHostThreshold = (numberValue: number) => {
    if (!_.isNaN(numberValue) && _.isInteger(numberValue) && numberValue > 0) {
      this.props.updateAutoHostThreshold(numberValue)
    }
  }
}

export default connect<StateProps, DispatchProps, {}, ApplicationState>(
  (state) => ({
    autoHostThreshold: getAutoHostThreshold(state),
    hostThreshold: getHostThreshold(state),
    soundSettings: getSoundSettings(state),
  }),
  {
    toggleSoundNotification,
    updateAutoHostThreshold,
    updateHostThreshold,
    updateSoundNotificationVolume,
  }
)(SettingsNotifications)

/**
 * React Props.
 */
interface StateProps {
  autoHostThreshold: ReturnType<typeof getAutoHostThreshold>
  hostThreshold: ReturnType<typeof getHostThreshold>
  soundSettings: ReturnType<typeof getSoundSettings>
}

/**
 * React Props.
 */
interface DispatchProps {
  toggleSoundNotification: typeof toggleSoundNotification
  updateAutoHostThreshold: typeof updateAutoHostThreshold
  updateHostThreshold: typeof updateHostThreshold
  updateSoundNotificationVolume: typeof updateSoundNotificationVolume
}

/**
 * React Props.
 */
type Props = StateProps & DispatchProps
