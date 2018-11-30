import { Slider } from '@blueprintjs/core'
import * as React from 'react'
import styled from 'Styled'

import Switch from 'Components/Switch'
import SoundNotification from 'Constants/soundNotification'
import Sound from 'Libs/Sound'
import { SoundNotificationSettings } from 'Store/ducks/settings'

/**
 * VolumeWrapper component.
 */
const VolumeWrapper = styled.div`
  padding: 0 20px 10px 20px;
`

/**
 * SettingsNotificationSound Component.
 */
export default class SettingsNotificationSound extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { description, label, notification, settings } = this.props

    return (
      <div>
        <Switch
          checkSoundNotification={notification}
          checked={settings.enabled}
          description={description}
          onChange={this.toggle}
          label={label}
        />
        <VolumeWrapper>
          <Slider
            labelRenderer={this.volumeLabelRenderer}
            onRelease={this.onReleaseVolumeHandle}
            onChange={this.onChangeVolume}
            disabled={!settings.enabled}
            value={settings.volume}
            labelStepSize={0.5}
            stepSize={0.01}
            min={0}
            max={1}
          />
        </VolumeWrapper>
      </div>
    )
  }

  /**
   * Triggered when a volume slider handle is released.
   */
  private onReleaseVolumeHandle = () => {
    Sound.manager().playSoundNotification(this.props.notification)
  }

  /**
   * Triggered when the volume is changed.
   * @param value - The new volume.
   */
  private onChangeVolume = (value: number) => {
    const { changeVolume, notification } = this.props

    changeVolume(notification, value)
  }

  /**
   * Renders the volume label in percent.
   * @param value - The value to format.
   */
  private volumeLabelRenderer(value: number) {
    return `${Math.round(value * 100)}%`
  }

  /**
   * Triggered when the sound is toggled.
   */
  private toggle = () => {
    const { notification, toggle } = this.props

    toggle(notification)
  }
}

/**
 * React Props.
 */
interface Props {
  changeVolume: (notification: SoundNotification, volume: number) => void
  description?: string
  label: string
  notification: SoundNotification
  settings: SoundNotificationSettings
  toggle: (notification: SoundNotification) => void
}
