import * as _ from 'lodash'
import { Emotes } from 'twitch-js'
import { Word } from 'unistring'

/**
 * Various emotes providers.
 */
export enum EmoteProviderPrefix {
  Bttv = 'bttv',
  Twitch = 'twitch',
}

/**
 * Twitch RegExp emotes map.
 */
const TwitchRegExpEmotesMap = {
  'B-?\\)': 'B)',
  'R-?\\)': 'R)',
  '[oO](_|\\.)[oO]': 'O_o',
  '\\&gt\\;\\(': '>(',
  '\\&lt\\;3': '<3',
  '\\:-?(o|O)': ':O',
  '\\:-?(p|P)': ':P',
  '\\:-?D': ':D',
  '\\:-?[\\\\/]': ':/',
  '\\:-?[z|Z|\\|]': ':|',
  '\\:-?\\(': ':(',
  '\\:-?\\)': ':)',
  '\\;-?(p|P)': ';P',
  '\\;-?\\)': ';)',
}

/**
 * EmotesProvider class.
 */
export default class EmotesProvider<ExternalEmote extends Emote> {
  /**
   * Sanitizes Twitch emotes by removing RegExp emotes code.
   * @param  emotes - The emotes to sanitize.
   * @return The sanitized emotes.
   */
  public static sanitizeTwitchEmotes(emotes: Emote[]): Emote[] {
    return _.map(emotes, (emote) => {
      if (!_.has(TwitchRegExpEmotesMap, emote.code)) {
        return emote
      }

      return { ...emote, code: TwitchRegExpEmotesMap[emote.code] }
    })
  }

  private urlCompiledTemplate: _.TemplateExecutor

  /**
   * Creates a new emotes provider.
   * @class
   * @param prefix - Provider prefix.
   * @param emotes - The additional emotes.
   * @param urlTemplate - The provider url template.
   * @param sizePrefix - The size prefix.
   */
  constructor(
    public prefix: EmoteProviderPrefix,
    public emotes: ExternalEmote[],
    urlTemplate: string,
    private sizePrefix: string
  ) {
    _.templateSettings.interpolate = /{{([\s\S]+?)}}/g

    this.urlCompiledTemplate = _.template(urlTemplate)
  }

  /**
   * Returns the emotes included in a message.
   * @param  words - The message words.
   * @return The emotes.
   */
  public getMessageEmotes(words: Word[]): Emotes {
    return _.reduce(
      this.emotes,
      (emotes, emote) => {
        const wordsMatchingEmote = _.filter(words, (word, index) => {
          if (word.text === '(' || word.text === ':') {
            return this.getPotentialNextWord(words, index) === emote.code
          }

          return word.text === emote.code
        })

        if (wordsMatchingEmote.length === 0) {
          return emotes
        }

        const ranges = _.map(wordsMatchingEmote, (word) => [word.index, word.index + emote.code.length - 1].join('-'))

        emotes[`${this.prefix}-${emote.id}`] = ranges

        return emotes
      },
      {}
    )
  }

  /**
   * Returns the HTML tag for an emote.
   * @param  id - The emote id.
   * @param  name - The emote name.
   * @return The emote tag.
   */
  public getEmoteTag(id: string, name: string) {
    const { src, srcset } = this.getEmoteTagUrls(id)

    return `<img class="emote" data-tip="${name}" src="${src}" srcset="${srcset}" alt="${name}" />`
  }

  /**
   * Returns the URLs used by the HTML tag for an emote.
   * @param  id - The emote id.
   * @return The emote tag URLs.
   */
  public getEmoteTagUrls(id: string): EmoteTagUrls {
    const url1x = this.urlCompiledTemplate({ id, image: this.getSizePath(1) })
    const url2x = this.urlCompiledTemplate({ id, image: this.getSizePath(2) })
    const url4x = this.urlCompiledTemplate({ id, image: this.getSizePath(3) })

    return {
      '1x': url1x,
      '2x': url2x,
      '4x': url4x,
      src: url1x,
      srcset: `${url1x} 1x,${url2x} 2x,${url4x} 4x`,
    }
  }

  /**
   * Returns the size path used by the provider.
   * @param  size - The size.
   * @return The size path.
   */
  private getSizePath(size: number) {
    return `${size.toString()}${this.sizePrefix}`
  }

  /**
   * Returns a potentially splitted word.
   * @param  words - The message words.
   * @param  index - The starting index.
   * @return The potentially splitted word.
   */
  private getPotentialNextWord(words: Word[], index: number) {
    return `${_.get(words[index], 'text')}${_.get(words[index + 1], 'text')}${_.get(words[index + 2], 'text')}`
  }
}

/**
 * Base Twitch emote.
 */
export type Emote = {
  id: string
  code: string
}

/**
 * URLs used by an emote HTML tag.
 */
export type EmoteTagUrls = {
  '1x': string
  '2x': string
  '4x': string
  src: string
  srcset: string
}
