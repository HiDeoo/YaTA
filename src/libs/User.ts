import { UserState } from 'twitch-js'

import { Serializable } from 'Utils/typescript'

/**
 * User class.
 */
export default class User implements Serializable<SerializedUser> {
  private displayName: string
  private id: string
  private name: string

  /**
   * Creates a new user instance.
   * @class
   */
  constructor(userstate: UserState) {
    this.displayName = userstate['display-name']
    this.id = userstate['user-id']
    this.name = userstate.username
  }

  /**
   * Serializes a user.
   * @return The serialized user.
   */
  public serialize() {
    return {
      displayName: this.displayName,
      id: this.id,
      name: this.name,
    }
  }
}

/**
 * Serialized chat message.
 */
export type SerializedUser = {
  displayName: string
  id: string
  name: string
}
