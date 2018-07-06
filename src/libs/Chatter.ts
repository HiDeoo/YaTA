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
  private isSelf: boolean
  private isBroadcaster: boolean

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
    this.isBroadcaster = _.has(userstate.badges, 'broadcaster')
    this.isMod = userstate.mod || this.isBroadcaster
    this.showUserName = this.displayName.toLocaleLowerCase() !== this.userName.toLocaleLowerCase()
    this.isSelf = userstate['user-id'] === 'self'
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
      isBroadcaster: this.isBroadcaster,
      isMod: this.isMod,
      isSelf: this.isSelf,
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
  isBroadcaster: boolean
  isMod: boolean
  isSelf: boolean
  showUsername: boolean
  userName: string
}
