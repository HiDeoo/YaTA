import { Classes, Colors, Slider } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'

import NumericInput from 'Components/NumericInput'
import SettingsNotificationSound from 'Components/SettingsNotificationSound'
import SettingsView from 'Components/SettingsView'
import SettingsViewSection from 'Components/SettingsViewSection'
import Switch from 'Components/Switch'
import SoundNotification from 'Constants/soundNotification'
import {
  togglePlayMessageSoundOnlyInOwnChannel,
  toggleSoundNotification,
  updateAutoHostThreshold,
  updateDelayBetweenThrottledSounds,
  updateHostThreshold,
  updateSoundNotificationVolume,
} from 'Store/ducks/settings'
import { ApplicationState } from 'Store/reducers'
import {
  getAutoHostThreshold,
  getDelayBetweenThrottledSounds,
  getHostThreshold,
  getPlayMessageSoundOnlyInOwnChannel,
  getSoundSettings,
} from 'Store/selectors/settings'
import styled, { ifProp } from 'Styled'

/**
 * SoundDelayWrapper component.
 */
const SoundDelayWrapper = styled.div`
  padding: 0 20px 10px 20px;
`

/**
 * SoundDelayLabel component.
 */
const SoundDelayLabel = styled.div<SoundDelayLabelProps>`
  color: ${ifProp('disabled', 'rgba(92, 112, 128, 0.5)', Colors.DARK_GRAY1)};
  margin-bottom: 13px;
  margin-left: -15px;

  .${Classes.DARK} & {
    color: ${ifProp('disabled', 'rgba(191, 204, 214, 0.5)', Colors.WHITE)};
  }

  & > small {
    color: ${Colors.GRAY1};
    display: block;
    font-size: 12px;
    margin-top: 5px;

    .${Classes.DARK} & {
      color: ${Colors.GRAY3};
    }
  }
`

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
    const {
      autoHostThreshold,
      delayBetweenThrottledSounds,
      hostThreshold,
      playMessageSoundOnlyInOwnChannel,
      soundSettings,
    } = this.props

    return (
      <SettingsView>
        <SettingsViewSection title="Alerts">
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
        <SettingsViewSection title="Sounds">
          <Switch
            description="This setting does not affect mentions & whispers sounds."
            onChange={this.props.togglePlayMessageSoundOnlyInOwnChannel}
            disabled={!soundSettings[SoundNotification.Message].enabled}
            label="Play sound on messages only in my channel"
            checked={playMessageSoundOnlyInOwnChannel}
          />
          <SoundDelayWrapper>
            <SoundDelayLabel disabled={!soundSettings[SoundNotification.Message].enabled}>
              Delay between message sounds
              <small>This setting does not affect mentions & whispers sounds.</small>
            </SoundDelayLabel>
            <Slider
              disabled={!soundSettings[SoundNotification.Message].enabled}
              onChange={this.props.updateDelayBetweenThrottledSounds}
              labelRenderer={this.soundDelayLabelRenderer}
              value={delayBetweenThrottledSounds}
              labelStepSize={58}
              stepSize={1}
              max={60}
              min={2}
            />
          </SoundDelayWrapper>
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
   * Renders the sound delay label.
   * @param value - The value to format.
   */
  private soundDelayLabelRenderer(value: number) {
    const isOneMinute = value === 60

    const hRValue = isOneMinute ? 1 : value
    const hRUnit = isOneMinute ? 'min' : 's'

    return `${hRValue}${hRUnit}`
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
    delayBetweenThrottledSounds: getDelayBetweenThrottledSounds(state),
    hostThreshold: getHostThreshold(state),
    playMessageSoundOnlyInOwnChannel: getPlayMessageSoundOnlyInOwnChannel(state),
    soundSettings: getSoundSettings(state),
  }),
  {
    togglePlayMessageSoundOnlyInOwnChannel,
    toggleSoundNotification,
    updateAutoHostThreshold,
    updateDelayBetweenThrottledSounds,
    updateHostThreshold,
    updateSoundNotificationVolume,
  }
)(SettingsNotifications)

/**
 * React Props.
 */
interface StateProps {
  autoHostThreshold: ReturnType<typeof getAutoHostThreshold>
  delayBetweenThrottledSounds: ReturnType<typeof getDelayBetweenThrottledSounds>
  hostThreshold: ReturnType<typeof getHostThreshold>
  playMessageSoundOnlyInOwnChannel: ReturnType<typeof getPlayMessageSoundOnlyInOwnChannel>
  soundSettings: ReturnType<typeof getSoundSettings>
}

/**
 * React Props.
 */
interface DispatchProps {
  togglePlayMessageSoundOnlyInOwnChannel: typeof togglePlayMessageSoundOnlyInOwnChannel
  toggleSoundNotification: typeof toggleSoundNotification
  updateAutoHostThreshold: typeof updateAutoHostThreshold
  updateDelayBetweenThrottledSounds: typeof updateDelayBetweenThrottledSounds
  updateHostThreshold: typeof updateHostThreshold
  updateSoundNotificationVolume: typeof updateSoundNotificationVolume
}

/**
 * React Props.
 */
type Props = StateProps & DispatchProps

/**
 * React Props.
 */
interface SoundDelayLabelProps {
  disabled: boolean
}
