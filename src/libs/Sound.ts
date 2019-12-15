import _ from 'lodash'

import { SoundData, SoundId, SoundIdToNameMap, SoundName } from 'constants/sound'
import { SettingsState } from 'store/ducks/settings'

/**
 * Re-exports sound list.
 */
export { SoundId }

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
  private audios: Partial<Record<SoundName, HTMLAudioElement>> = {}
  private volumes: Partial<Record<SoundId, number>> = {}
  private delayBetweenThrottledSoundsInMs = 2000
  private lastThrottledSoundTimestamp = Date.now()

  /**
   * Creates a new instance of the class.
   * @class
   */
  private constructor() {
    _.forEach(SoundName, (name) => {
      this.audios[name] = new Audio(SoundData[name])
    })
  }

  /**
   * Updates the sound volumes.
   * @param settings - The new settings.
   */
  public udpateVolumes(settings: SettingsState['sounds']) {
    _.forEach(settings, ({ volume }, soundIdStr) => {
      const soundId: SoundId = parseInt(soundIdStr, 10)
      this.volumes[soundId] = volume
    })
  }

  /**
   * Updates the delay between throttled sounds.
   * @param delay - The new delay in seconds.
   */
  public updateDelayBetweenThrottledSounds(delay: number) {
    this.delayBetweenThrottledSoundsInMs = delay * 1000
    this.lastThrottledSoundTimestamp = Date.now()
  }

  /**
   * Gets a specific sound details.
   * @param  sound - The id of the sound.
   * @return The sound audio & volume.
   */
  public getSoundDetails(soundId: SoundId) {
    const soundName = SoundIdToNameMap[soundId]

    return {
      audio: _.get(this.audios, soundName),
      volume: _.get(this.volumes, soundId) || 0,
    }
  }

  /**
   * Plays a specific sound.
   * @param soundId - The sound id.
   * @param [throttled] - Defines if the sound should be throttled or not.
   */
  public play(soundId: SoundId, throttled: boolean = false) {
    if (!throttled) {
      this.playSound(soundId)
    } else {
      const now = Date.now()

      if (now - this.lastThrottledSoundTimestamp > this.delayBetweenThrottledSoundsInMs) {
        this.playSound(soundId)

        this.lastThrottledSoundTimestamp = now
      }
    }
  }

  /**
   * Plays a specific sound.
   * @param soundId - The sound id.
   * @see `play`
   */
  private async playSound(soundId: SoundId) {
    const { audio, volume } = this.getSoundDetails(soundId)

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
