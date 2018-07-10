import * as _ from 'lodash'
import { Emotes } from 'twitch-js'
import { Word } from 'unistring'

/**
 * EmotesProvider class.
 */
export default class EmotesProvider<ExternalEmote extends Emote> {
  public prefix: string
  public emotes: ExternalEmote[]
  private sizePrefix: string
  private urlTemplate: string
  private urlCompiledTemplate: _.TemplateExecutor

  /**
   * Creates a new emotes provider.
   * @class
   * @param prefix - Provider prefix.
   * @param emotes - The additional emotes.
   * @param urlTemplate - The provider url template.
   * @param sizePrefix - The size prefix.
   */
  constructor(prefix: string, emotes: ExternalEmote[], urlTemplate: string, sizePrefix: string) {
    this.prefix = prefix
    this.emotes = emotes
    this.sizePrefix = sizePrefix
    this.urlTemplate = urlTemplate

    _.templateSettings.interpolate = /{{([\s\S]+?)}}/g

    this.urlCompiledTemplate = _.template(this.urlTemplate)
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
        const wordsMatchingEmote = _.filter(words, (word) => word.text === emote.code)

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
   * Returns the HTML emotes tag for an emote.
   * @param  id - The emote id.
   * @param  name - The emote name.
   * @return The emote tag.
   */
  public getEmoteTag(id: string, name: string) {
    const url1x = this.urlCompiledTemplate({ id, image: this.getSizePath(1) })
    const url2x = this.urlCompiledTemplate({ id, image: this.getSizePath(2) })
    const url4x = this.urlCompiledTemplate({ id, image: this.getSizePath(3) })

    const srcset = `${url1x} 1x,${url2x} 2x,${url4x} 4x`

    return `<img class="emote" data-tip="${name}" src="${url1x}" srcset="${srcset}" alt="${name}" />`
  }

  /**
   * Returns the size path used by the provider.
   * @param  size - The size.
   * @return The size path.
   */
  private getSizePath(size: number) {
    return `${size.toString()}${this.sizePrefix}`
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
 * List of emotes providers keyed by prefix.
 */
export type EmotesProviders = {
  [key: string]: EmotesProvider<Emote>
}
