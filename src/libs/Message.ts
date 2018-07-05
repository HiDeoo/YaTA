import linkifyHtml from 'linkifyjs/html'
import * as _ from 'lodash'
import { Emotes, UserState } from 'twitch-js'

import LogType from 'Constants/logType'
import Theme from 'Constants/theme'
import Chatter, { SerializedChatter } from 'Libs/Chatter'
import { EmotesProviders } from 'Libs/EmotesProvider'
import { CheermoteImageBackground, RawBadges, RawCheermote, RawCheermoteImage, RawClip } from 'Libs/Twitch'
import { Highlights } from 'Store/ducks/settings'
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
  public static badges: RawBadges | null = null
  public static emotesProviders: EmotesProviders = {}
  public static bots: string[] = []
  public static cheermotes: RawCheermote[] | null = null
  public static highlights: Highlights = {}

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
  private parseOptions: MessageParseOptions

  /**
   * Creates and parses a new chat message instance.
   * @class
   * @param message - The received message.
   * @param userstate - The associated user state.
   * @param self - Defines if the message was sent by ourself.
   * @param currentUsername - The name of the current user.
   * @param parseOptions - Parsing options.
   */
  constructor(
    message: string,
    userstate: UserState,
    self: boolean,
    currentUsername: string,
    parseOptions: MessageParseOptions
  ) {
    this.parseOptions = parseOptions

    this.self = self
    this.id = userstate.id
    this.color = userstate.color
    this.date = userstate['tmi-sent-ts']
    this.user = new Chatter(userstate)
    this.type = userstate['message-type']

    const date = new Date(parseInt(this.date, 10))
    this.time = `${_.padStart(date.getHours().toString(), 2, '0')}:${_.padStart(date.getMinutes().toString(), 2, '0')}`

    this.badges = this.parseBadges(userstate)
    this.message = this.parseMessage(message, userstate, currentUsername)
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
   * @return Parsed badges.
   */
  private parseBadges(userstate: UserState) {
    const parsedBadges: string[] = []

    if (_.includes(Message.bots, userstate.username)) {
      parsedBadges.push('<img class="badge" data-tip="Bot" src="https://cdn.betterttv.net/tags/bot.png" />')
    }

    if (!_.isNil(Message.badges) && _.size(userstate.badges)) {
      _.forEach(userstate.badges, (version, name) => {
        const set = _.get(Message.badges, name)

        if (_.isNil(set)) {
          return
        }

        const badge = _.get(set.versions, version)

        if (_.isNil(badge)) {
          return
        }

        const srcset = `${badge.image_url_1x} 1x,${badge.image_url_2x} 2x,${badge.image_url_4x} 4x`

        parsedBadges.push(
          `<img class="badge" data-tip="${badge.title}" src="${badge.image_url_1x}" srcset="${srcset}" />`
        )

        return
      })
    }

    return escape(parsedBadges).join('')
  }

  /**
   * Parses a message for emotes, mentions, links, etc.
   * @param message - The message to parse.
   * @param userstate - The userstate.
   * @param currentUsername - The name of the current user.
   */
  private parseMessage(message: string, userstate: UserState, currentUsername: string) {
    const emotes = userstate.emotes || {}

    this.parseClips(message)
    this.parseAdditionalEmotes(message, emotes)

    const parsedMessage = message.split('')

    this.parseEmotes(parsedMessage, emotes)
    this.parseHighlights(message, parsedMessage)
    this.parseMentions(message, parsedMessage, currentUsername)

    let parsedMessageStr = escape(parsedMessage).join('')

    if (!_.isNil(userstate.bits) && !_.isNil(Message.cheermotes) && userstate.bits > 0) {
      parsedMessageStr = this.parseCheermotes(parsedMessageStr, userstate.bits)
    }

    return linkifyHtml(parsedMessageStr, {
      attributes: {
        'data-tip': '',
      },
    })
  }

  /**
   * Parses a message for additional emotes.
   * @param message - The message to parse.
   * @param emotes - The message emotes.
   */
  private parseAdditionalEmotes(message: string, emotes: Emotes) {
    _.forEach(Message.emotesProviders, (provider) => {
      const providerEmotes = provider.getMessageEmotes(message)

      if (_.size(providerEmotes) > 0) {
        _.merge(emotes, providerEmotes)
      }
    })
  }

  /**
   * Parses a message for cheermotes.
   * @param message - The message to parse.
   * @param totalBits - The number of bits in the message.
   */
  private parseCheermotes(message: string, totalBits: number) {
    const parsedMessage = message.split('')

    const cheermoteBackground: CheermoteImageBackground = this.parseOptions.theme === Theme.Dark ? 'dark' : 'light'

    const replacements: Array<{ str: string; start: number; end: number }> = []

    let usedBits = 0

    _.forEach(Message.cheermotes, (cheermote) => {
      const pattern = `(^|\\b)(${cheermote.prefix}(\\d+))(\\b|$)`
      const regExp = new RegExp(pattern, 'gmi')
      let match

      // tslint:disable-next-line:no-conditional-assignment
      while ((match = regExp.exec(message)) != null) {
        const bits = parseInt(match[3], 10)
        let currentBits = bits

        if (bits > totalBits || usedBits > totalBits) {
          continue
        }

        let color = null as string | null
        let images = null as RawCheermoteImage | null

        _.forEach(cheermote.tiers, (tier) => {
          if (tier.min_bits <= bits) {
            color = tier.color
            images = tier.images[cheermoteBackground].animated

            currentBits = tier.min_bits
          }
        })

        if (!_.isNil(color) && !_.isNil(images)) {
          const potentialUsedBits = usedBits + currentBits

          if (potentialUsedBits <= totalBits) {
            const beforeStr = match[1]
            const cheerName = match[2]
            const afterStr = match[4]

            const start = match.index + beforeStr.length
            const end = start + cheerName.length + (afterStr.length === 0 ? afterStr.length : afterStr.length - 1)

            const url = images['1']
            const srcset = `${images['1']} 1x,${images['2']} 2x,${images['4']} 4x`

            const str = `<img class="emote cheer" src="${url}" srcset="${srcset}" alt="${cheerName}" /><span class="cheer" style="color: ${color}">${bits}</span>`

            replacements.push({ str, start, end })

            usedBits = potentialUsedBits
          }
        }
      }
    })

    _.forEach(replacements, ({ str, start, end }) => {
      for (let i = start; i < end; ++i) {
        parsedMessage[i] = ''
      }

      parsedMessage[start] = str
    })

    return parsedMessage.join('')
  }

  /**
   * Parses a message for emotes.
   * @param parsedMessage - The message being parsed.
   * @param emotes - The message emotes.
   */
  private parseEmotes(parsedMessage: string[], emotes: Emotes) {
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
          ] = `<img class="emote" data-tip="${emoteName}" src="${url}${id}/1.0" srcset="${srcset}" alt="${emoteName}" />`
        } else {
          parsedMessage[indexes[0]] = Message.emotesProviders[providerPrefix].getEmoteTag(emoteId, emoteName)
        }
      })
    })
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
      const mentionStr = match[0]
      const username = match[1]

      if (username.toLowerCase() !== currentUsername.toLowerCase()) {
        const startIndex = match.index
        const endIndex = startIndex + mentionStr.length

        for (let i = startIndex; i < endIndex; ++i) {
          parsedMessage[i] = ''
        }

        parsedMessage[startIndex] = `<span class="mention">${mentionStr}</span>`
      }
    }
  }

  /**
   * Parses a message for highlights.
   * @param message - The raw message.
   * @param parsedMessage - The message being parsed.
   */
  private parseHighlights(message: string, parsedMessage: string[]) {
    if (!this.self) {
      _.forEach(Message.highlights, (highlight) => {
        const pattern = `(?<!\\S)(${highlight.pattern})(?!\\S)`
        const regExp = new RegExp(pattern, 'gmi')
        let match

        // tslint:disable-next-line:no-conditional-assignment
        while ((match = regExp.exec(message)) != null) {
          const highlightStr = match[1]

          const startIndex = match.index
          const endIndex = startIndex + highlightStr.length

          for (let i = startIndex; i < endIndex; ++i) {
            parsedMessage[i] = ''
          }

          parsedMessage[startIndex] = `<span class="highlight">${highlightStr}</span>`
        }
      })
    }
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
  [key: string]: RawClip | null
}

/**
 * Message parse options.
 */
type MessageParseOptions = {
  theme: Theme
}
