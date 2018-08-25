import * as _ from 'lodash'

import { Data, Sounds } from 'Constants/sound'

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

  /**
   * Creates a new instance of the class.
   * @class
   */
  private constructor() {
    _.forEach(Sounds, (event) => {
      this.sounds[event] = new Audio(Data[event])
    })
  }

  /**
   * Gets a specific sound.
   * @param  event - The sound event.
   * @return The sound.
   */
  public getSound(event: Sounds) {
    return _.get(this.sounds, event)
  }

  /**
   * Plays a specific sound.
   * @param event - The sound event.
   */
  public playSound(event: Sounds) {
    const sound = this.getSound(event)

    if (!_.isNil(sound)) {
      sound.play()
    }
  }
}
