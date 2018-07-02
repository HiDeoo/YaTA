import * as _ from 'lodash'
import { Emotes } from 'twitch-js'

import { getWordsIndexesMatching } from 'Utils/string'

/**
 * EmotesProvider class.
 */
export default class EmotesProvider<ExternalEmote extends Emote> {
  public prefix: string
  private emotes: ExternalEmote[]
  private urlTemplate: string
  private urlCompiledTemplate: _.TemplateExecutor

  /**
   * Creates a new emotes provider.
   * @class
   * @param prefix - Provider prefix.
   * @param emotes - The additional emotes.
   * @param urlTemplate - The provider url template.
   */
  constructor(prefix: string, emotes: ExternalEmote[], urlTemplate: string) {
    this.prefix = prefix
    this.emotes = emotes
    this.urlTemplate = urlTemplate

    _.templateSettings.interpolate = /{{([\s\S]+?)}}/g

    this.urlCompiledTemplate = _.template(this.urlTemplate)
  }

  /**
   * Returns the emotes included in a message.
   * @param  message - The message to parse.
   * @return The emotes.
   */
  public getMessageEmotes(message: string): Emotes {
    return _.reduce(
      this.emotes,
      (emotes, emote) => {
        const indexes = getWordsIndexesMatching(message, emote.code)

        if (indexes.length === 0) {
          return emotes
        }

        const ranges = _.map(indexes, (index) => [index, index + emote.code.length - 1].join('-'))

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
    const url1x = this.urlCompiledTemplate({ id, image: '1x' })
    const url2x = this.urlCompiledTemplate({ id, image: '2x' })
    const url4x = this.urlCompiledTemplate({ id, image: '3x' })

    const srcset = `${url1x} 1x,${url2x} 2x,${url4x} 4x`

    return `<img class="emote" src="${url1x}" srcset="${srcset}" alt="${name}" />`
  }

  /**
   * Returns the associated emote sets.
   * @return The emote sets.
   */
  public getEmoteSets() {
    return _.map(this.emotes, 'code')
  }
}

/**
 * Extra emote.
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
