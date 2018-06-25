import * as _ from 'lodash'
import { Emotes, UserState } from 'twitch-js'

import LogType from 'Constants/logType'
import Chatter, { SerializedChatter } from 'Libs/Chatter'
import { escape } from 'Utils/html'
import { Serializable } from 'Utils/typescript'

/**
 * Message class representing either a chat message, an action (/me) or a whisper.
 */
export default class Message implements Serializable<SerializedMessage> {
  public user: Chatter
  public color: string | null
  public isMod: boolean
  private badges: string[]
  private id: string
  private date: string
  private self: boolean
  private message: string
  private type: LogType
  private time: string
  private purged: boolean = false

  /**
   * Creates and parses a new chat message instance.
   * @class
   */
  constructor(message: string, userstate: UserState, self: boolean) {
    this.self = self
    this.id = userstate.id
    this.badges = _.keys(userstate.badges)
    this.color = userstate.color
    this.date = userstate['tmi-sent-ts']
    this.user = new Chatter(userstate)
    this.type = userstate['message-type']
    this.isMod = userstate.mod

    const date = new Date(parseInt(this.date, 10))
    this.time = `${date.getHours()}:${date.getMinutes()}`

    this.message = !_.isNil(userstate.emotes) ? this.parseEmotes(message, userstate.emotes) : escape(message)

    // TODO badges
    // TODO mod? Might need to serialize that to prevent mod controls to show on a mod if you're only a mod & not the broadcast
    // TODO room-id?
    // TODO subscriber?
    // TODO turbo?
  }

  /**
   * Updates the message color.
   * @param newColor - The new color.
   */
  public updateColor(newColor: string | null) {
    this.color = newColor
    this.user.color = newColor
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
      purged: this.purged,
      self: this.self,
      time: this.time,
      type: this.type,
      user: this.user.serialize(),
    }
  }

  /**
   * Parses a message for emotes.
   * @param message - The message to parse.
   * @param emotes - The message emotes.
   */
  private parseEmotes(message: string, emotes: Emotes) {
    const parsedMessage = message.split('')

    _.forEach(emotes, (ranges, id) => {
      _.forEach(ranges, (range) => {
        const strIndexes = range.split('-')
        const indexes = [parseInt(strIndexes[0], 10), parseInt(strIndexes[1], 10)]
        const name = []

        for (let i = indexes[0]; i <= indexes[1]; ++i) {
          name.push(parsedMessage[i])
          parsedMessage[i] = ''
        }

        const emoteName = name.join('')
        const srcset = `https://static-cdn.jtvnw.net/emoticons/v1/${id}/1.0 1x,https://static-cdn.jtvnw.net/emoticons/v1/${id}/2.0 2x,https://static-cdn.jtvnw.net/emoticons/v1/${id}/3.0 4x`

        parsedMessage[
          indexes[0]
        ] = `<img class="emote" src="https://static-cdn.jtvnw.net/emoticons/v1/${id}/1.0" srcset=${srcset} alt="${emoteName}" />`
      })
    })

    return escape(parsedMessage).join('')
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
  purged: boolean
  time: string
}
