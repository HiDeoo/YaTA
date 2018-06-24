import * as _ from 'lodash'
import { UserState } from 'twitch-js'

import base from 'Styled/base'
import { Serializable } from 'Utils/typescript'

/**
 * Chatter class.
 */
export default class Chatter implements Serializable<SerializedChatter> {
  public id: string
  public color: string | null
  public name: string
  private displayName: string

  /**
   * Creates a new chatter instance.
   * @class
   */
  constructor(userstate: UserState) {
    this.displayName = userstate['display-name']
    this.id = userstate['user-id']
    this.name = userstate.username
    this.color = userstate.color
  }

  /**
   * Generates a random color for the chatter.
   * @return The new random color.
   */
  public generateRandomColor() {
    const color = _.sample(base.chatters) || null

    this.color = color

    return color
  }

  /**
   * Serializes a chatter.
   * @return The serialized chatter.
   */
  public serialize() {
    return {
      color: this.color,
      displayName: this.displayName,
      id: this.id,
      name: this.name,
    }
  }
}

/**
 * Serialized chat message.
 */
export type SerializedChatter = {
  color: string | null
  displayName: string
  id: string
  name: string
}
