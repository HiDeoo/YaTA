import * as React from 'react'

import Switch from 'Components/Switch'
import SoundNotification from 'Constants/soundNotification'
import { Sounds } from 'Libs/Sound'
import { SoundNotificationSettings } from 'Store/ducks/settings'

/**
 * SettingsNotificationSound Component.
 */
export default class SettingsNotificationSound extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { description, label, settings, sound } = this.props

    return (
      <Switch
        checked={settings.enabled}
        description={description}
        onChange={this.toggle}
        checkSound={sound}
        label={label}
      />
    )
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
  description?: string
  label: string
  notification: SoundNotification
  settings: SoundNotificationSettings
  sound: Sounds
  toggle: (notification: SoundNotification) => void
}
