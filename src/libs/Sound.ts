import * as _ from 'lodash'

import { Data, Sounds } from 'Constants/sound'
import SoundNotification, { SoundNotificationAudioMap } from 'Constants/soundNotification'
import { SettingsState } from 'Store/ducks/settings'

/**
 * Re-exports sounds list.
 */
export { Sounds }

/**
 * Sound manager.
 */
export default class Sound {
  /**
   * Returns the manager instance.
   * @class
   */
  public static manager() {
    if (_.isNil(Sound.instance)) {
      Sound.instance = new Sound()
    }

    return Sound.instance
  }

  private static instance: Sound
  private sounds: Record<string, HTMLAudioElement> = {}
  private volumes: Partial<Record<SoundNotification, number>> = {}
  private delayBetweenThrottledSoundsInMs = 2000
  private lastThrottledSound = Date.now()

  /**
   * Creates a new instance of the class.
   * @class
   */
  private constructor() {
    _.forEach(Sounds, (id) => {
      this.sounds[id] = new Audio(Data[id])
    })
  }

  /**
   * Updates the sound volumes.
   * @param settings - The new settings.
   */
  public udpateVolumes(settings: SettingsState['sounds']) {
    _.forEach(settings, ({ volume }, notification) => {
      this.volumes[notification] = volume
    })
  }

  /**
   * Updates the delay between throttled sounds.
   * @param delay - The new delay in seconds.
   */
  public updateDelayBetweenThrottledSounds(delay: number) {
    this.delayBetweenThrottledSoundsInMs = delay * 1000
    this.lastThrottledSound = Date.now()
  }

  /**
   * Gets a specific sound for a notification.
   * @param  notification - The notification.
   * @return The sound audio & volume.
   */
  public getSoundForNotification(notification: SoundNotification) {
    const soundId = SoundNotificationAudioMap[notification]

    return {
      audio: _.get(this.sounds, soundId),
      volume: _.get(this.volumes, notification) || 0,
    }
  }

  /**
   * Plays a specific sound notification.
   * @param notification - The sound notification.
   * @param [throttled] - Defines if the sound should be throttled or not.
   */
  public playSoundNotification(notification: SoundNotification, throttled: boolean = false) {
    if (!throttled) {
      this._playSoundNotification(notification)
    } else {
      const now = Date.now()

      if (now - this.lastThrottledSound > this.delayBetweenThrottledSoundsInMs) {
        this._playSoundNotification(notification)

        this.lastThrottledSound = now
      }
    }
  }

  /**
   * Plays a specific sound notification.
   * @param notification - The sound notification.
   */
  private async _playSoundNotification(notification: SoundNotification) {
    const { audio, volume } = this.getSoundForNotification(notification)

    if (!_.isNil(audio)) {
      try {
        audio.volume = volume
        await audio.play()
      } catch (error) {
        //
      }
    }
  }
}
