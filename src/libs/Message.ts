import * as _ from 'lodash'
import { UserState } from 'twitch-js'

import LogType from 'Constants/logType'
import Chatter, { SerializedChatter } from 'Libs/Chatter'
import { Serializable } from 'Utils/typescript'

/**
 * Message class representing either a chat message, an action (/me) or a whisper.
 */
export default class Message implements Serializable<SerializedMessage> {
  public user: Chatter
  public color: string | null
  private badges: string[]
  private id: string
  private date: string
  private self: boolean
  private message: string
  private type: LogType

  /**
   * Creates and parses a new chat message instance.
   * @class
   */
  constructor(message: string, userstate: UserState, self: boolean) {
    this.message = message
    this.self = self
    this.id = userstate.id
    this.badges = _.keys(userstate.badges)
    this.color = userstate.color
    this.date = userstate['tmi-sent-ts']
    this.user = new Chatter(userstate)
    this.type = userstate['message-type']

    // TODO emotes
    // TODO badges
    // TODO mod?
    // TODO room-id?
    // TODO subscriber?
    // TODO turbo?
  }

  /**
   * Serializes a chat message.
   * @return The serialized chat message.
   */
  public serialize() {
    return {
      badges: this.badges,
      color: this.color,
      date: this.date,
      id: this.id,
      message: this.message,
      self: this.self,
      type: this.type,
      user: this.user.serialize(),
    }
  }
}

/**
 * Serialized message.
 */
export type SerializedMessage = {
  badges: string[]
  color: string | null
  user: SerializedChatter
  id: string
  date: string
  self: boolean
  type: LogType
  message: string
}
