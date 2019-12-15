import { Slider } from '@blueprintjs/core'
import * as React from 'react'
import styled from 'styled'

import Switch from 'components/Switch'
import Sound, { SoundId } from 'libs/Sound'
import { SoundSettings } from 'store/ducks/settings'

/**
 * VolumeWrapper component.
 */
const VolumeWrapper = styled.div`
  padding: 0 20px 10px 20px;
`

/**
 * SettingsSoundControl Component.
 */
export default class SettingsSoundControl extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { description, label, settings, soundId } = this.props

    return (
      <div>
        <Switch
          checked={settings.enabled}
          description={description}
          onChange={this.toggle}
          checkSound={soundId}
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
    Sound.manager().play(this.props.soundId)
  }

  /**
   * Triggered when the volume is changed.
   * @param value - The new volume.
   */
  private onChangeVolume = (value: number) => {
    const { changeVolume, soundId } = this.props

    changeVolume(soundId, value)
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
    const { soundId, toggle } = this.props

    toggle(soundId)
  }
}

/**
 * React Props.
 */
interface Props {
  changeVolume: (soundId: SoundId, volume: number) => void
  description?: string
  label: string
  soundId: SoundId
  settings: SoundSettings
  toggle: (soundId: SoundId) => void
}
