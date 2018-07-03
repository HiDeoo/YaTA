import linkifyHtml from 'linkifyjs/html'
import * as _ from 'lodash'
import { Emotes, UserState } from 'twitch-js'

import LogType from 'Constants/logType'
import Chatter, { SerializedChatter } from 'Libs/Chatter'
import { EmotesProviders } from 'Libs/EmotesProvider'
import { Badges, Clip } from 'Libs/Twitch'
import { escape } from 'Utils/html'
import { Serializable } from 'Utils/typescript'

/**
 * RegExp used to identify any mention (starting with @).
 */
const MentionRegExp = /@([a-zA-Z\d_]+)/g

/**
 * RegExp used to identify a clip link.
 */
const ClipRegExp = /https:\/\/clips\.twitch\.tv\/(\w+)/g

/**
 * Message class representing either a chat message, an action (/me) or a whisper.
 */
export default class Message implements Serializable<SerializedMessage> {
  public user: Chatter
  public color: string | null
  private badges: string | null
  private id: string
  private date: string
  private self: boolean
  private message: string
  private type: LogType
  private time: string
  private purged: boolean = false
  private mentionned: boolean = false
  private hasClip: boolean = false
  private clips: Clips = {}

  /**
   * Creates and parses a new chat message instance.
   * @class
   * @param message - The received message.
   * @param userstate - The associated user state.
   * @param self - Defines if the message was sent by ourself.
   * @param badges - The known badges if any.
   * @param emotesProviders - Additional emotes providers.
   * @param currentUsername - The name of the current user.
   * @param bots - Known bots.
   */
  constructor(
    message: string,
    userstate: UserState,
    self: boolean,
    badges: Badges | null,
    emotesProviders: EmotesProviders,
    currentUsername: string,
    bots: string[]
  ) {
    this.self = self
    this.id = userstate.id
    this.color = userstate.color
    this.date = userstate['tmi-sent-ts']
    this.user = new Chatter(userstate)
    this.type = userstate['message-type']

    const date = new Date(parseInt(this.date, 10))
    this.time = `${_.padStart(date.getHours().toString(), 2, '0')}:${_.padStart(date.getMinutes().toString(), 2, '0')}`

    this.badges = this.parseBadges(userstate, badges, bots)
    this.message = this.parseMessage(message, userstate.emotes || {}, emotesProviders, currentUsername)
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
      clips: this.clips,
      color: this.color,
      date: this.date,
      hasClip: this.hasClip,
      id: this.id,
      mentionned: this.mentionned,
      message: this.message,
      purged: this.purged,
      self: this.self,
      time: this.time,
      type: this.type,
      user: this.user.serialize(),
    }
  }

  /**
   * Parses badges.
   * @param  userstate - The userstate.
   * @param  badges - The known badges for the associated channeL.
   * @param  bots - Known bots.
   * @return Parsed badges.
   */
  private parseBadges(userstate: UserState, badges: Badges | null, bots: string[]) {
    const parsedBadges: string[] = []

    if (_.includes(bots, userstate.username)) {
      parsedBadges.push('<img class="badge" src="https://cdn.betterttv.net/tags/bot.png" />')
    }

    if (!_.isNil(badges) && _.size(userstate.badges)) {
      _.forEach(userstate.badges, (version, name) => {
        const set = _.get(badges, name)

        if (_.isNil(set)) {
          return
        }

        const badge = _.get(set.versions, version)

        if (_.isNil(badge)) {
          return
        }

        const srcset = `${badge.image_url_1x} 1x,${badge.image_url_2x} 2x,${badge.image_url_4x} 4x`

        parsedBadges.push(`<img class="badge" src="${badge.image_url_1x}" srcset="${srcset}" />`)

        return
      })
    }

    return escape(parsedBadges).join('')
  }

  /**
   * Parses a message for emotes, mentions, links, etc.
   * @param message - The message to parse.
   * @param emotes - The message emotes.
   * @param emotesProviders - Additional emotes providers.
   * @param currentUsername - The name of the current user.
   */
  private parseMessage(message: string, emotes: Emotes, emotesProviders: EmotesProviders, currentUsername: string) {
    this.parseClips(message)
    this.parseAdditionalEmotes(message, emotes, emotesProviders)

    let parsedMessage = message.split('')

    parsedMessage = this.parseEmotes(parsedMessage, emotes, emotesProviders)
    parsedMessage = this.parseMentions(message, parsedMessage, currentUsername)

    return linkifyHtml(escape(parsedMessage).join(''), {
      attributes: {
        'data-tip': '',
      },
    })
  }

  /**
   * Parses a message for additional emotes.
   * @param message - The message to parse.
   * @param emotes - The message emotes.
   * @param emotesProviders - Additional emotes providers.
   */
  private parseAdditionalEmotes(message: string, emotes: Emotes, emotesProviders: EmotesProviders) {
    _.forEach(emotesProviders, (provider) => {
      const providerEmotes = provider.getMessageEmotes(message)

      if (_.size(providerEmotes) > 0) {
        _.merge(emotes, providerEmotes)
      }
    })
  }

  /**
   * Parses a message for emotes.
   * @param parsedMessage - The message being parsed.
   * @param emotes - The message emotes.
   * @param emotesProviders - Additional emotes providers.
   */
  private parseEmotes(parsedMessage: string[], emotes: Emotes, emotesProviders: EmotesProviders) {
    _.forEach(emotes, (ranges, id) => {
      const [providerPrefix, emoteId] = id.split('-')

      _.forEach(ranges, (range) => {
        const strIndexes = range.split('-')
        const indexes = [parseInt(strIndexes[0], 10), parseInt(strIndexes[1], 10)]
        const name = []

        for (let i = indexes[0]; i <= indexes[1]; ++i) {
          name.push(parsedMessage[i])
          parsedMessage[i] = ''
        }

        const emoteName = name.join('')

        if (_.isNil(emoteId)) {
          const url = 'https://static-cdn.jtvnw.net/emoticons/v1/'
          const srcset = `${url}${id}/1.0 1x,${url}${id}/2.0 2x,${url}${id}/3.0 4x`

          parsedMessage[
            indexes[0]
          ] = `<img class="emote" src="${url}${id}/1.0" srcset="${srcset}" alt="${emoteName}" />`
        } else {
          parsedMessage[indexes[0]] = emotesProviders[providerPrefix].getEmoteTag(emoteId, emoteName)
        }
      })
    })

    return parsedMessage
  }

  /**
   * Parses a message for mentions.
   * @param message - The raw message.
   * @param parsedMessage - The message being parsed.
   * @param currentUsername - The name of the current user.
   */
  private parseMentions(message: string, parsedMessage: string[], currentUsername: string) {
    const pattern = `(?<!\\S)(@?${currentUsername})(?!\\S)`
    let regExp = new RegExp(pattern, 'gmi')
    let match

    if (!this.self) {
      // tslint:disable-next-line:no-conditional-assignment
      while ((match = regExp.exec(message)) != null) {
        this.mentionned = true

        const startIndex = match.index
        const withAtSign = message.charAt(match.index) === '@'
        const endIndex = startIndex + currentUsername.length + (withAtSign ? 1 : 0)

        for (let i = startIndex; i < endIndex; ++i) {
          parsedMessage[i] = ''
        }

        parsedMessage[startIndex] = `<span class="mention self">${withAtSign ? '@' : ''}${currentUsername}</span>`
      }
    }

    regExp = MentionRegExp

    // tslint:disable-next-line:no-conditional-assignment
    while ((match = regExp.exec(message)) != null) {
      if (match[1].toLowerCase() !== currentUsername.toLowerCase()) {
        const startIndex = match.index
        const endIndex = startIndex + match[0].length

        for (let i = startIndex; i < endIndex; ++i) {
          parsedMessage[i] = ''
        }

        parsedMessage[startIndex] = `<span class="mention">${match[0]}</span>`
      }
    }

    return parsedMessage
  }

  /**
   * Checks if the message contains any clip.
   * @param message - The message to parse.
   */
  private parseClips(message: string) {
    let match

    // tslint:disable-next-line:no-conditional-assignment
    while ((match = ClipRegExp.exec(message)) != null) {
      this.hasClip = true
      this.clips[match[1]] = null
    }
  }
}

/**
 * Serialized message.
 */
export type SerializedMessage = {
  badges: string | null
  color: string | null
  user: SerializedChatter
  id: string
  date: string
  self: boolean
  type: LogType
  mentionned: boolean
  message: string
  purged: boolean
  time: string
  hasClip: boolean
  clips: Clips
}

/**
 * Clips details.
 */
type Clips = {
  [key: string]: Clip | null
}
