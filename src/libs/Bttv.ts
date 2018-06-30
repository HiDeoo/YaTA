import * as _ from 'lodash'

import EmotesProvider, { Emote } from 'Libs/EmotesProvider'

/**
 * Bttv base API URL.
 */
const baseAPIUrl = 'https://api.betterttv.net/2'

/**
 * Bttv class.
 */
export default class Bttv {
  /**
   * Fetches Bttv emotes & bots for a specific channel.
   * @return The emotes provider and bots details.
   */
  public static async fetchEmotesAndBots(channel: string): Promise<BttvEmotesAndBots> {
    const response = await Promise.all([
      (await Bttv.fetch(`${baseAPIUrl}/emotes`)).json(),
      (await Bttv.fetch(`${baseAPIUrl}/channels/${channel}`)).json(),
    ])

    const emotes = new EmotesProvider(
      'bttv',
      [...response[0].emotes, ...response[1].emotes] as BttvEmote[],
      response[0].urlTemplate
    )

    return {
      bots: response[1].bots,
      emotes,
    }
  }

  /**
   * Fetches an URL.
   * @param  url - The URL to fetch.
   * @param  additionalHeaders -  Additional headers to pass down to the query.
   * @return The response.
   */
  private static fetch(url: string, additionalHeaders?: { [key: string]: string }) {
    const headers = new Headers({
      Accept: 'application/json',
    })

    if (_.size(additionalHeaders) > 0) {
      _.forEach(additionalHeaders, (value, name) => {
        headers.append(name, value)
      })
    }

    const request = new Request(url, { headers })

    return fetch(request)
  }
}

/**
 * Bttv emote.
 */
interface BttvEmote extends Emote {
  channel: string
  imageType: string
  restrictions?: {
    channels: string[]
    games: string[]
    emoticonSet?: string
  }
}

/**
 * Bttv emotes and bots details.
 */
type BttvEmotesAndBots = {
  bots: string[]
  emotes: EmotesProvider<BttvEmote>
}
