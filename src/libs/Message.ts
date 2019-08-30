import linkifyHtml from 'linkifyjs/html'
import * as _ from 'lodash'
import { Emotes, UserState } from 'twitch-js'
import Unistring, { Word } from 'unistring'

import LogType from 'Constants/logType'
import Theme from 'Constants/theme'
import Chatter, { SerializedChatter } from 'Libs/Chatter'
import { EmoteProviderPrefix } from 'Libs/EmotesProvider'
import { Previews } from 'Libs/PreviewProvider'
import Resources from 'Libs/Resources'
import { CheermoteImageBackground, RawCheermoteImage } from 'Libs/Twitch'
import { escape } from 'Utils/html'
import { padTimeUnit } from 'Utils/time'

/**
 * Message class representing either a chat message, an action (/me) or a whisper.
 */
export default class Message implements Serializable<SerializedMessage> {
  public user: Chatter
  public color: string | null
  private badges: string | null
  private id: string
  private date: string
  private message: string
  private type: LogType
  private time: string
  private purged: boolean = false
  private mentionned: boolean = false
  private previews: Previews = {}
  private ignoreHighlight: boolean
  private highlighted: boolean
  private text: string
  private read: boolean

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
    private self: boolean,
    currentUsername: string,
    private parseOptions: MessageParseOptions
  ) {
    this.id = userstate.id
    this.color = userstate.color
    this.date = userstate['tmi-sent-ts']
    this.user = new Chatter(userstate, this.parseOptions.theme)
    this.type = userstate['message-type']
    this.text = message.trim()
    this.highlighted = !self && Resources.manager().shouldAlwaysHighlight(this.user.userName)
    this.read = self

    this.ignoreHighlight = self || Resources.manager().shouldIgnoreHighlights(this.user.userName)

    const date = new Date(parseInt(this.date, 10))
    this.time = `${padTimeUnit(date.getHours())}:${padTimeUnit(date.getMinutes())}`

    this.badges = this.parseBadges(userstate, parseOptions.hideVIPBadge)
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
      color: this.color,
      date: this.date,
      highlighted: this.highlighted,
      id: this.id,
      mentionned: this.mentionned,
      message: this.message,
      previews: this.previews,
      purged: this.purged,
      read: this.read,
      self: this.self,
      text: this.text,
      time: this.time,
      type: this.type,
      user: this.user.serialize(),
    }
  }

  /**
   * Parses badges.
   * @param  userstate - The userstate.
   * @param  hideVIP - Defines if the VIP badge should be hidden or not.
   * @return Parsed badges.
   */
  private parseBadges(userstate: UserState, hideVIP: boolean) {
    const parsedBadges: string[] = []

    if (Resources.manager().isBot(userstate.username)) {
      parsedBadges.push('<img class="badge" data-tip="Bot" src="https://cdn.betterttv.net/tags/bot.png" />')
    }

    if (_.size(userstate.badges) > 0) {
      _.forEach(userstate.badges, (version, name) => {
        if (hideVIP && name === 'vip') {
          return
        }

        const set = _.get(Resources.manager().getBadges(), name)

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
    const words = Unistring.getWords(message)

    const parsedMessage = Array.from(message)

    const emotes = this.parseAdditionalEmotes(words, userstate.emotes || {})
    this.parseEmotes(parsedMessage, emotes)
    this.parseHighlights(words, parsedMessage)
    this.parseMentions(words, parsedMessage, currentUsername)
    this.parsePreviews(message)

    let parsedMessageStr = escape(parsedMessage).join('')

    if (!_.isNil(userstate.bits) && userstate.bits > 0) {
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
   * @param words - The message words.
   * @param emotes - The message emotes.
   */
  private parseAdditionalEmotes(words: Word[], emotes: Emotes) {
    const parsedEmotes = {}

    Resources.manager()
      .getEmotesProviders()
      .forEach((provider) => {
        if (provider.isTwitch() && !this.self) {
          _.merge(parsedEmotes, emotes)

          return
        }

        const providerEmotes = provider.getMessageEmotes(words)

        if (_.size(providerEmotes) > 0) {
          _.merge(parsedEmotes, providerEmotes)
        }
      })

    return parsedEmotes
  }

  /**
   * Parses a message for cheermotes.
   * @param  message - The message to parse.
   * @param  totalBits - The number of bits in the message.
   * @return The message with cheermotes parsed.
   */
  private parseCheermotes(message: string, totalBits: number) {
    const parsedMessage = Array.from(message)

    const cheermoteBackground: CheermoteImageBackground = this.parseOptions.theme === Theme.Dark ? 'dark' : 'light'

    const replacements: Array<{ str: string; start: number; end: number }> = []

    let usedBits = 0

    _.forEach(Resources.manager().getCheermotes(), (cheermote) => {
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

            const str = `<span class="emoteWrapper"><img class="emote cheer" src="${url}" srcset="${srcset}" alt="${cheerName}" /></span><span class="cheer" style="color: ${color}">${bits}</span>`

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

        const isTwitchEmote = _.isNil(emoteId)

        const provider = Resources.manager().getEmotesProvider(
          isTwitchEmote ? EmoteProviderPrefix.Twitch : (providerPrefix as EmoteProviderPrefix)
        )

        if (!_.isNil(provider)) {
          parsedMessage[indexes[0]] = provider.getEmoteTag(isTwitchEmote ? id : emoteId, emoteName)
        }
      })
    })
  }

  /**
   * Parses a message for mentions.
   * @param words - The message words.
   * @param parsedMessage - The message being parsed.
   * @param currentUsername - The name of the current user.
   */
  private parseMentions(words: Word[], parsedMessage: string[], currentUsername: string) {
    _.forEach(words, (word, index) => {
      if (!this.ignoreHighlight && word.text.toLowerCase() === currentUsername) {
        this.mentionned = true

        const previousWord = index > 0 ? words[index - 1] : null

        if (!_.isNil(previousWord) && previousWord.text.trim().length > 0 && previousWord.text !== '@') {
          return
        }

        const withAtSign = !_.isNil(previousWord) && previousWord.text === '@'

        const startIndex = withAtSign ? word.index - 1 : word.index
        const endIndex = word.index + currentUsername.length

        for (let i = startIndex; i < endIndex; ++i) {
          parsedMessage[i] = ''
        }

        parsedMessage[startIndex] = `<span class="mention self">${withAtSign ? '@' : ''}${word.text}</span>`
      } else if (Resources.manager().shouldHighlightAllMentions() && word.text === '@') {
        const previousWord = index > 0 ? words[index - 1] : null

        if (!_.isNil(previousWord) && previousWord.text.trim().length > 0 && previousWord.text !== '') {
          return
        }

        const nextWord = index < words.length - 1 ? words[index + 1] : null

        if (!_.isNil(nextWord) && nextWord.text.trim().length > 0) {
          const startIndex = word.index
          const endIndex = nextWord.index + nextWord.length

          for (let i = startIndex; i < endIndex; ++i) {
            parsedMessage[i] = ''
          }

          parsedMessage[startIndex] = `<span class="mention">${word.text}${nextWord.text}</span>`
        }
      }
    })
  }

  /**
   * Parses a message for highlights.
   * @param words - The message words.
   * @param parsedMessage - The message being parsed.
   */
  private parseHighlights(words: Word[], parsedMessage: string[]) {
    if (!this.ignoreHighlight) {
      _.forEach(Resources.manager().getHighlights(), (highlight) => {
        const wordsMatchingHighlight = _.filter(words, (word, index) => {
          const couldMatch = word.text.toLowerCase() === highlight.pattern

          if (!couldMatch) {
            return false
          }

          const previousWord = index > 0 ? words[index - 1] : null

          if (!_.isNil(previousWord) && previousWord.text.trim().length > 0 && previousWord.text !== '') {
            return false
          }

          const nextWord = index < words.length - 1 ? words[index + 1] : null

          if (!_.isNil(nextWord) && nextWord.text.trim().length > 0) {
            return false
          }

          return true
        })

        _.forEach(wordsMatchingHighlight, (word) => {
          const highlightStr = word.text

          const startIndex = word.index
          const endIndex = startIndex + highlightStr.length

          for (let i = startIndex; i < endIndex; ++i) {
            parsedMessage[i] = ''
          }

          parsedMessage[startIndex] = `<span class="highlight ${highlight.color}">${highlightStr}</span>`
        })
      })
    }
  }

  /**
   * Parses the message for potential previews.
   * @param message - The message to parse.
   */
  private parsePreviews(message: string) {
    _.forEach(Resources.manager().getPreviewProviders(), (provider) => {
      const previews = provider.parse(message)

      if (_.size(previews) > 0) {
        _.merge(this.previews, provider.parse(message))
      }
    })
  }
}

/**
 * Serialized message.
 */
export type SerializedMessage = {
  badges: string | null
  color: string | null
  user: SerializedChatter
  highlighted: boolean
  id: string
  date: string
  self: boolean
  type: LogType
  mentionned: boolean
  message: string
  purged: boolean
  text: string
  time: string
  previews: Previews
  read: boolean
}

/**
 * Message parse options.
 */
type MessageParseOptions = {
  hideVIPBadge: boolean
  theme: Theme
}
