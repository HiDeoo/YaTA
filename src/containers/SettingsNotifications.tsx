import { Classes, Colors, Slider } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'

import NumericInput from 'Components/NumericInput'
import SettingsSoundControl from 'Components/SettingsSoundControl'
import SettingsView from 'Components/SettingsView'
import SettingsViewSection from 'Components/SettingsViewSection'
import Switch from 'Components/Switch'
import { SoundId } from 'Libs/Sound'
import {
  togglePlayMessageSoundOnlyInOwnChannel,
  toggleSound,
  updateAutoHostThreshold,
  updateDelayBetweenThrottledSounds,
  updateHostThreshold,
  updateSoundVolume,
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
        <SettingsViewSection title="Sounds">
          <SettingsSoundControl
            changeVolume={this.props.updateSoundVolume}
            settings={soundSettings[SoundId.Mention]}
            toggle={this.props.toggleSound}
            label="Play sound on mentions"
            soundId={SoundId.Mention}
          />
          <SettingsSoundControl
            changeVolume={this.props.updateSoundVolume}
            settings={soundSettings[SoundId.Whisper]}
            toggle={this.props.toggleSound}
            label="Play sound on whispers"
            soundId={SoundId.Whisper}
          />
          <SettingsSoundControl
            changeVolume={this.props.updateSoundVolume}
            description="Your own messages and bots will not trigger any sound."
            settings={soundSettings[SoundId.Message]}
            toggle={this.props.toggleSound}
            label="Play sound on messages"
            soundId={SoundId.Message}
          />
        </SettingsViewSection>
        <SettingsViewSection title="Sound options">
          <Switch
            description="This setting does not affect mentions & whispers sounds."
            onChange={this.props.togglePlayMessageSoundOnlyInOwnChannel}
            disabled={!soundSettings[SoundId.Message].enabled}
            label="Play sound on messages only in my channel"
            checked={playMessageSoundOnlyInOwnChannel}
          />
          <SoundDelayWrapper>
            <SoundDelayLabel disabled={!soundSettings[SoundId.Message].enabled}>
              Delay between message sounds
              <small>This setting does not affect mentions & whispers sounds.</small>
            </SoundDelayLabel>
            <Slider
              onChange={this.props.updateDelayBetweenThrottledSounds}
              disabled={!soundSettings[SoundId.Message].enabled}
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
    toggleSound,
    updateAutoHostThreshold,
    updateDelayBetweenThrottledSounds,
    updateHostThreshold,
    updateSoundVolume,
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
  toggleSound: typeof toggleSound
  updateAutoHostThreshold: typeof updateAutoHostThreshold
  updateDelayBetweenThrottledSounds: typeof updateDelayBetweenThrottledSounds
  updateHostThreshold: typeof updateHostThreshold
  updateSoundVolume: typeof updateSoundVolume
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
