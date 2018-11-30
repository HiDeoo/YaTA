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
   * @param  id - The sound id.
   * @return The sound.
   */
  public getSound(id: Sounds) {
    return _.get(this.sounds, id)
  }

  /**
   * Plays a specific sound.
   * @param id - The sound id.
   */
  public async playSound(id: Sounds) {
    const sound = this.getSound(id)

    if (!_.isNil(sound)) {
      try {
        await sound.play()
      } catch (error) {
        //
      }
    }
  }
}
