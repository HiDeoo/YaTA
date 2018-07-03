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
  public userName: string
  public isMod: boolean
  private displayName: string
  private showUserName: boolean
  private ignored: boolean = false

  /**
   * Creates a new chatter instance.
   * @class
   * @param userstate - The associated user state.
   */
  constructor(userstate: UserState) {
    this.displayName = userstate['display-name']
    this.id = userstate['user-id']
    this.userName = userstate.username
    this.color = userstate.color
    this.isMod = userstate.mod
    this.showUserName = this.displayName.toLocaleLowerCase() !== this.userName.toLocaleLowerCase()
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
      ignored: this.ignored,
      isMod: this.isMod,
      showUsername: this.showUserName,
      userName: this.userName,
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
  ignored: boolean
  isMod: boolean
  showUsername: boolean
  userName: string
}
