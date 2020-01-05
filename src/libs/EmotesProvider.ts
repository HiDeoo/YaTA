import _ from 'lodash'
import { Emotes } from 'twitch-js'
import { Word } from 'unistring'

import { FfzEmote } from 'libs/Ffz'
import Resources from 'libs/Resources'

/**
 * Various emotes providers.
 */
export enum EmoteProviderPrefix {
  Bttv = 'bttv',
  Ffz = 'ffz',
  Twitch = 'twitch',
}

/**
 * Twitch RegExp emotes map.
 */
export const TwitchRegExpEmotesMap = {
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
 * Specific widths map for emotes known to be larger than the default width (28px).
 */
const EmotesWidthsMap = {
  '54fab45f633595ca4c713abc': 36,
  '54fab7d2633595ca4c713abf': 42,
  '54fbefeb01abde735115de5b': 87,
  '54fbf00a01abde735115de5c': 46,
  '5502874d135896936880fdd2': 36,
  '55189a5062e6bd0027aee082': 60,
  '5622aaef3286c42e57d8e4ab': 32,
  '566c9fc265dbbdab32ec053b': 30,
  '566c9fde65dbbdab32ec053e': 30,
  '566c9ff365dbbdab32ec0541': 53,
  '566ca00f65dbbdab32ec0544': 56,
  '566ca06065dbbdab32ec054e': 38,
  '566ca1a365dbbdab32ec055b': 84,
  '566ca38765dbbdab32ec0560': 35,
  '573d38b50ffbf6cc5cc38dc9': 37,
  1900: 33,
  28: 39,
  30: 29,
  36: 36,
  52: 32,
  65: 40,
  69: 41,
  86: 36,
}

/**
 * Characters triggering a next word look-up when parsing emotes.
 */
const nextWordLookUpTriggers = [';', '<', '>', '(', ':', 'B', 'D', 'R']

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
      if (EmotesProvider.isTwitchRegExpEmote(emote.code)) {
        return { ...emote, code: TwitchRegExpEmotesMap[emote.code] }
      }

      return emote
    })
  }

  /**
   * Defines if a provider prefix is valid.
   * @param prefix - The prefix.
   * @return `true` when the prefix is valid.
   */
  public static isValidPrefix(prefix: string): prefix is EmoteProviderPrefix {
    return _.some(EmoteProviderPrefix, (value) => value === prefix)
  }

  /**
   * Defines if a prefix is the Twitch one.
   * @param prefix - The prefix.
   * @return `true` when the prefix is the Twitch one.
   */
  public static isTwitchPrefix(prefix: string): prefix is EmoteProviderPrefix.Twitch {
    return prefix === EmoteProviderPrefix.Twitch
  }

  /**
   * Defines if an emote code matches a Twitch RegExp emote.
   * @param code - The emote code.
   * @return `true` when the code matches a Twitch RegExp emote.
   */
  private static isTwitchRegExpEmote(code: string): code is keyof typeof TwitchRegExpEmotesMap {
    return code in TwitchRegExpEmotesMap
  }

  /**
   * Defines if an emote id matches a fixed width emote.
   * @param id - The emote id.
   * @return `true` when the id matches a fixed width emote.
   */
  private static isFixedWidthEmote(id: string | number): id is keyof typeof EmotesWidthsMap {
    return id in TwitchRegExpEmotesMap
  }

  private urlCompiledTemplate: Optional<_.TemplateExecutor>

  /**
   * Creates a new emotes provider.
   * @class
   * @param prefix - Provider prefix.
   * @param emotes - The additional emotes.
   * @param [urlTemplate] - The provider url template if any.
   * @param [sizePrefix] - The size prefix if any.
   */
  constructor(
    public prefix: EmoteProviderPrefix,
    public emotes: ExternalEmote[],
    urlTemplate?: string,
    private sizePrefix?: string
  ) {
    if (!_.isNil(urlTemplate)) {
      _.templateSettings.interpolate = /{{([\s\S]+?)}}/g

      this.urlCompiledTemplate = _.template(urlTemplate)
    }
  }

  /**
   * Determines if the emote provider is the official Twitch one.
   * @return `true` if Twitch.
   */
  public isTwitch() {
    return EmotesProvider.isTwitchPrefix(this.prefix)
  }

  /**
   * Returns the emotes included in a message.
   * @param  words - The message words.
   * @return The emotes.
   */
  public getMessageEmotes(words: Word[]): Emotes {
    return _.reduce(
      this.isTwitch() ? [...this.emotes, ..._.values(Resources.manager().getEmoticonsMap())] : this.emotes,
      (emotes, emote) => {
        const wordsMatchingEmote = _.filter(words, (word, index) => {
          if (_.includes(nextWordLookUpTriggers, word.text)) {
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
      {} as Emotes
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
    const minWidth = this.getSpecificWidth(id)

    return `<span class="emoteWrapper"${minWidth}><img class="emote" data-tip="${name}" data-id="${id}" data-provider="${this.prefix}" src="${src}" srcset="${srcset}" alt="${name}" /></span>`
  }

  /**
   * Returns the URLs used by the HTML tag for an emote.
   * @param  id - The emote id.
   * @return The emote tag URLs.
   */
  public getEmoteTagUrls(id: string): EmoteTagUrls {
    let url1x
    let url2x
    let url4x
    let srcset

    if (this.urlCompiledTemplate) {
      url1x = this.urlCompiledTemplate({ id, image: this.getSizePath(1) })
      url2x = this.urlCompiledTemplate({ id, image: this.getSizePath(2) })
      url4x = this.urlCompiledTemplate({ id, image: this.getSizePath(3) })
      srcset = `${url1x} 1x,${url2x} 2x,${url4x} 4x`
    } else if (this.isFfz()) {
      const emote = this.getFfzEmote(id)

      if (_.isNil(emote)) {
        throw new Error(`Unknown Ffz emote (id: ${id}).`)
      }

      url1x = emote.urls[1]
      url2x = emote.urls[2]
      url4x = emote.urls[4]

      srcset = `${url1x} 1x${!_.isNil(url2x) ? `,${url2x} 2x` : ''}${!_.isNil(url4x) ? `,${url4x} 4x` : ''}`
    } else {
      throw new Error('Unable to generate emote tag URLs.')
    }

    return {
      '1x': url1x,
      '2x': url2x,
      '4x': url4x,
      src: url1x,
      srcset,
    }
  }

  /**
   * Returns the emote URL at a specific size.
   * If the size do not exists, the `1x` URL will be returned.
   * @param  id - The emote ID.
   * @param  size - The size.
   * @return The emote URL.
   */
  public getEmoteUrlWithSize(id: string, size: '1x' | '2x' | '4x') {
    const urls = this.getEmoteTagUrls(id)

    return _.get(urls, size, urls['1x'])
  }

  /**
   * Determines if the emote provider is the Ffz one.
   * @return `true` if Ffz.
   */
  private isFfz() {
    return this.prefix === EmoteProviderPrefix.Ffz
  }

  /**
   * Returns a specific Ffz emote based on its ID.
   * @param  id - The emote ID.
   * @return The emote if existing.
   */
  private getFfzEmote(id: string) {
    return _.find(this.emotes, (emote) => emote.id === id) as Optional<FfzEmote>
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
    return _.get(words[index], 'text')
      .concat(_.get(words[index + 1], 'text', ''))
      .concat(_.get(words[index + 2], 'text', ''))
      .trim()
  }

  /**
   * Returns the specific min-width of an emote if necessary.
   * @param  id - The emote id.
   * @return The minimum width or an empty string.
   */
  private getSpecificWidth(id: string) {
    let width: Optional<number>

    if (!this.isFfz() && EmotesProvider.isFixedWidthEmote(id)) {
      width = EmotesWidthsMap[id]
    } else if (this.isFfz()) {
      const emote = this.getFfzEmote(id)
      width = emote?.width
    }

    return !_.isNil(width) ? `  style="min-width: ${width}px;"` : ''
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
  '2x'?: string
  '4x'?: string
  src: string
  srcset: string
}
